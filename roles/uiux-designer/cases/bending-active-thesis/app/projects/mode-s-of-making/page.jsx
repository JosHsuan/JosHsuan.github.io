import ProjectCaseStudy from '../../../components/ProjectCaseStudy';
import studies from '../../../release/project-studies.json';

const project=studies.projects.find(project=>project.id==='mode-s-of-making');
export const metadata={title:project.metadataTitle,description:project.metadataDescription,alternates:{canonical:'/projects/mode-s-of-making/'}};
export default function Page(){return <ProjectCaseStudy project={project}/>;}
