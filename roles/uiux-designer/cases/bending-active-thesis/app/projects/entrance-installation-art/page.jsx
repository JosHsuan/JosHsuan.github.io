import {withShareMetadata} from '../../share-metadata.mjs';
import ProjectCaseStudy from '../../../components/ProjectCaseStudy';
import studies from '../../../release/project-studies.json';

const project=studies.projects.find(project=>project.id==='entrance-installation-art');
export const metadata=withShareMetadata({title:project.metadataTitle,description:project.metadataDescription,alternates:{canonical:'/projects/entrance-installation-art/'}}, project.hero);
export default function Page(){return <ProjectCaseStudy project={project}/>;}
