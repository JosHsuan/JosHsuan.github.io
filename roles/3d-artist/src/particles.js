export function seedParticles(count, seed) {
  let value = seed >>> 0;
  const random = () => { value = (Math.imul(value,1664525) + 1013904223) >>> 0; return value / 4294967296; };
  return Float32Array.from({length:count*3}, random);
}
export function writeParticles(output, seeds, time, flow) {
  for(let i=0; i<seeds.length; i+=3) {
    const a = seeds[i]*Math.PI*2 + time*flow*(.35+seeds[i+1]*.3);
    const radius = .6 + seeds[i+1]*1.25;
    output[i] = Math.cos(a)*radius;
    output[i+1] = ((seeds[i+2]*3 + time*.3)%3)-1.3;
    output[i+2] = Math.sin(a)*radius;
  }
  return output;
}
