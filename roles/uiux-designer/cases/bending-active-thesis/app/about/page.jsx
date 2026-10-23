import {withShareMetadata} from '../share-metadata.mjs';
import PortfolioHome from '../../components/PortfolioHome';

export const metadata=withShareMetadata({title:'About — JosHsuan Chao',description:'Computational designer and developer bridging design technology, digital fabrication and spatial interaction.',alternates:{canonical:'/about/'}});

export default function AboutPage(){return <PortfolioHome section="about"/>;}
