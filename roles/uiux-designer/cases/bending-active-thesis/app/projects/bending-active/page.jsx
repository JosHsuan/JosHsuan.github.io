import {withShareMetadata} from '../../share-metadata.mjs';
import BendingProject from '../../../components/BendingProject';

export const metadata=withShareMetadata({title:'Bending-Active — JosHsuan Chao',description:'A research story about geometry, openings and the behaviour of a metal sheet.',alternates:{canonical:'/projects/bending-active/'}}, {src:'/assets/cinematic/model-poster.webp',width:1440,height:1000,alt:'The approved Bending-Active metal-panel model, shown in its original exhibition scene.'});
export default function Page(){return <BendingProject/>;}
