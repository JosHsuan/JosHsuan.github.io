import {withShareMetadata} from '../../share-metadata.mjs';
import ProjectCaseStudy from '../../../components/ProjectCaseStudy';
import studies from '../../../release/project-studies.json';

const project=studies.projects.find(project=>project.id==='mode-s-of-making');
export const metadata=withShareMetadata({title:project.metadataTitle,description:project.metadataDescription,alternates:{canonical:'/projects/mode-s-of-making/'}}, project.hero);
export default function Page(){return <ProjectCaseStudy project={project}/>;}
