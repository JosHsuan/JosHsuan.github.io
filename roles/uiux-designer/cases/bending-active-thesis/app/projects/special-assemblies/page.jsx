import ProjectCaseStudy from '../../../components/ProjectCaseStudy';
import studies from '../../../release/project-studies.json';

const project=studies.projects.find(project=>project.id==='special-assemblies');
export const metadata={title:project.metadataTitle,description:project.metadataDescription,alternates:{canonical:'/projects/special-assemblies/'}};
export default function Page(){return <ProjectCaseStudy project={project}/>;}
