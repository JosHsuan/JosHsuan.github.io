import {withShareMetadata} from '../share-metadata.mjs';
import PortfolioHome from '../../components/PortfolioHome';

export const metadata=withShareMetadata({title:'Projects — JosHsuan Chao',description:'Selected work in computational design, digital fabrication and spatial interaction, spanning material research, robotic assembly and XR workflows.',alternates:{canonical:'/projects/'}});

export default function ProjectsPage(){return <PortfolioHome section="projects"/>;}
