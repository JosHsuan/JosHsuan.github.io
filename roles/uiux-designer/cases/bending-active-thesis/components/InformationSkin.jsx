import GlassWarp from './GlassWarp';
/** React owns the skin and optical definition; native content retains its DOM. */
export default function InformationSkin(){
  return <span data-information-skin aria-hidden="true"><GlassWarp/></span>;
}
