// Static composition; the existing clock and camera writer retain ownership.
const layouts = {
 desktop:{model:{left:.51,top:.20,width:.27,height:.52},information:{left:.8,top:.20,width:.135,height:.6}},
 compact:{model:{left:.51,top:.20,width:.215,height:.52},information:{left:.745,top:.20,width:.15,height:.6}},
 stacked:{model:{left:.045,top:.205,width:.52,height:.43},information:{left:.6,top:.205,width:.355,height:.58}},
};
for(const layout of Object.values(layouts)){Object.freeze(layout.model);Object.freeze(layout.information);Object.freeze(layout);}
export function modelInformationLayout(aspect,width){
 if(!(aspect>0)||!Number.isFinite(aspect))throw RangeError('Finite positive stage aspect required');
 if(width!==undefined&&(!(width>0)||!Number.isFinite(width)))throw RangeError('Finite positive stage width required');
 const stacked=width===undefined?aspect<1:width<=780;
 return layouts[stacked?'stacked':width<=1100?'compact':'desktop'];
}
export function modelInformationSummary(record){
 if(record.id==='curvature')return 'Authored vertex colors. Scalar field, units and legend unavailable.';
 return record.family==='representation'?'Original thesis source geometry.':record.description;
}
export function modelAnnotationLabel(id){
 return ({origami:'Polygon edges',curvature:'Authored colors','experiment-a':'Arched profile','experiment-b':'Spatial twist','experiment-c':'Alternating profile'})[id]??'Source surface';
}
