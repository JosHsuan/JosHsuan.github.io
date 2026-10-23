import {withShareMetadata} from '../share-metadata.mjs';
import PortfolioHome from '../../components/PortfolioHome';

export const metadata=withShareMetadata({title:'Contact — JosHsuan Chao',description:'Contact JosHsuan Chao by email and find public work and profiles.',alternates:{canonical:'/contact/'}});

export default function ContactPage(){return <PortfolioHome section="contact"/>;}
