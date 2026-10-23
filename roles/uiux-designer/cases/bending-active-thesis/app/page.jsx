import introduction from '../release/introduction.json';
import {withShareMetadata} from './share-metadata.mjs';
import PortfolioHome from '../components/PortfolioHome';
export const metadata=withShareMetadata({title:introduction.metadataTitle,description:introduction.metadataDescription,alternates:{canonical:'/'}});
export default function Page(){return <PortfolioHome/>;}
