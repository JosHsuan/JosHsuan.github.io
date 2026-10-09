// Read the actual rendered backdrop under text, without letting font-edge
// antialiasing masquerade as the authored foreground color. No production API.
export async function renderedTextContrast(page, locator) {
  await locator.evaluate(element=>element.setAttribute('data-reading-contrast-probe',''));
  const selector='[data-reading-contrast-probe],[data-reading-contrast-probe] *';
  const base=selector+'{transition:none!important}';
  const style=await page.addStyleTag({content:base});
  const geometry=await locator.evaluate(element=>{
    const box=element.getBoundingClientRect(),text=[];
    const walker=document.createTreeWalker(element,NodeFilter.SHOW_TEXT);
    while(walker.nextNode()){
      const node=walker.currentNode,parent=node.parentElement;
      if(!node.textContent.trim()||!parent)continue;
      const style=getComputedStyle(parent);
      if(style.visibility==='hidden'||style.display==='none')continue;
      const color=style.color.match(/[\d.]+/g)?.map(Number);
      if(!color||color.length<3)throw Error('Unsupported measured text color '+style.color);
      let opacity=color[3]??1;
      for(let owner=parent;owner;owner=owner.parentElement)opacity*=Number(getComputedStyle(owner).opacity);
      if(opacity===0)continue;
      const range=document.createRange();range.selectNodeContents(node);
      const size=parseFloat(style.fontSize),large=size>=24||(size>=18.666&&Number(style.fontWeight)>=700);
      for(const rect of range.getClientRects())if(rect.width>3&&rect.height>3){
        text.push({text:node.textContent.trim().slice(0,65),color:color.slice(0,3),opacity,minimum:large?3:4.5,
          x:rect.left-box.left,y:rect.top-box.top,width:rect.width,height:rect.height});
      }
    }
    return {width:box.width,height:box.height,text};
  });
  await style.evaluate((element,css)=>{element.textContent=css;},base+selector+'{color:transparent!important;-webkit-text-fill-color:transparent!important;text-shadow:none!important}');
  let bytes;
  try {bytes=await locator.screenshot({animations:'disabled'});}
  finally {
    // Restore authored color while transitions are still disabled. Otherwise
    // the next sample can observe the transparent-to-color transition itself.
    await style.evaluate((element,css)=>{element.textContent=css;},base);
    await locator.evaluate(element=>{getComputedStyle(element).color;element.removeAttribute('data-reading-contrast-probe');});
    await style.evaluate(element=>element.remove());
  }
  return page.evaluate(async({png,geometry})=>{
    const image=await createImageBitmap(await(await fetch('data:image/png;base64,'+png)).blob());
    const canvas=document.createElement('canvas');canvas.width=image.width;canvas.height=image.height;
    const context=canvas.getContext('2d');context.drawImage(image,0,0);image.close();
    const data=context.getImageData(0,0,canvas.width,canvas.height).data;
    const luminance=rgb=>rgb.map(channel=>{const v=channel/255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4;}).reduce((v,n,i)=>v+n*[.2126,.7152,.0722][i],0);
    return geometry.text.map(line=>{
      let minimum=Infinity,worst=null;
      const offsets=length=>{const values=[.5,length-.5];for(let n=2;n<length-1;n+=2)values.push(n);return values;};
      for(const dx of offsets(line.width))for(const dy of offsets(line.height)){
        const x=Math.min(canvas.width-1,Math.max(0,Math.floor((line.x+dx)*canvas.width/geometry.width)));
        const y=Math.min(canvas.height-1,Math.max(0,Math.floor((line.y+dy)*canvas.height/geometry.height)));
        const offset=(y*canvas.width+x)*4,backdrop=[...data.slice(offset,offset+3)];
        const foreground=line.color.map((channel,i)=>channel*line.opacity+backdrop[i]*(1-line.opacity));
        const a=luminance(foreground),b=luminance(backdrop);
        const ratio=(Math.max(a,b)+.05)/(Math.min(a,b)+.05);
        if(ratio<minimum){minimum=ratio;worst={x,y,backdrop,foreground};}
      }
      return {text:line.text,ratio:minimum,required:line.minimum,opacity:line.opacity,worst};
    });
  },{png:bytes.toString('base64'),geometry});
}
