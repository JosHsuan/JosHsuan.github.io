import test from 'node:test';
import assert from 'node:assert/strict';
import {modelInformationLayout} from '../components/model-information.mjs';
test('model and permanent information have separate horizontal space at phone, tablet and desktop widths',()=>{
 for(const [width,height] of [[320,568],[390,844],[820,1180],[1440,1000],[1440,700]]){
  const {model,information}=modelInformationLayout(width/height,width);
  assert(model.left+model.width<information.left);
  assert(information.left+information.width<=1);
  assert.equal(model.top,information.top);
  assert(information.top+information.height<1);
  assert(information.width*width>=110);
 }
});
