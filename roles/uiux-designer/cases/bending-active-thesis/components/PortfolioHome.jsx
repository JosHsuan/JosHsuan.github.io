/* eslint-disable @next/next/no-img-element -- Approved documentary preview pixels use native images with exact public asset identity. */
import PortfolioNavigation from './PortfolioNavigation';
import ProjectModelPreview from './ProjectModelPreview';
import HomeShowcaseStage from './HomeShowcaseStage';
import InformationSkin from './InformationSkin';
import {projectGridRows} from './project-grid-layout.mjs';
import introduction from '../release/introduction.json';
import contact from '../release/contact.json';
import review from '../release/story.json';
import xrStudy from '../release/xr-study.json';
import projectStudies from '../release/project-studies.json';
import styles from '../app/portfolio.module.css';

const projects=[
  {
    id:'bending-active',href:'/projects/bending-active/',title:review.title,
    category:'COMPUTATIONAL DESIGN / MATERIAL RESEARCH',
    description:'A study connecting geometric representation, metal-panel openings and physical assembly.',
    image:{src:'/assets/cinematic/model-poster.webp',width:1440,height:1000,alt:'The approved Bending-Active metal-panel model, shown in its original exhibition scene.'},
  },
  {
    id:'xr-bending-active',href:'/projects/xr-bending-active/',title:xrStudy.shortTitle,
    category:'EXTENDED REALITY / RESEARCH PROTOTYPE',description:xrStudy.summary,image:xrStudy.hero,
  },
  ...projectStudies.projects.map(project=>({id:project.id,href:`/projects/${project.slug}/`,title:project.shortTitle,category:project.category,description:project.summary,image:project.hero})),
];

const approaches=[
  {name:'FORM',title:'Design and engineering information',description:'Geometry and spatial relationships give physical and digital systems a shared description.'},
  {name:'SYSTEM',title:'Computational tools and interfaces',description:'Computational tools and interactive interfaces connect design intent, engineering information and spatial interaction.'},
  {name:'MAKE',title:'Fabrication-ready workflows',description:'Workflows translate design and engineering information into fabrication-ready, machine-readable data.'},
];

function Arrow({diagonal=false}){return <span aria-hidden="true">{diagonal?'↗':'↘'}</span>;}

// Begin at human architectural scale, then change subject and lens language.
const showcaseOrder=['entrance-installation-art','mode-s-machine','project-caschlatsch','dot-based-3d-printing','special-assemblies','hc3dp-caustics','mode-s-of-making'];
const showcaseModels=projectStudies.projects.flatMap(project=>[project.model,...project.additionalModels??[]].filter(Boolean).map(model=>({id:project.id,model}))).sort((a,b)=>{
 const key=item=>item.id==='mode-s-of-making'&&item.model.id==='machine'?'mode-s-machine':item.id;
 return showcaseOrder.indexOf(key(a))-showcaseOrder.indexOf(key(b));
});

function Introduction(){
 return <section id="about" tabIndex={-1} className={styles.showcaseIntro} data-home-introduction aria-labelledby="home-title">
  <HomeShowcaseStage models={showcaseModels}/>
  <div className={styles.showcaseCopy} data-information-window="home-introduction" data-information-motion-surface="plane"><InformationSkin/>
   <p className={styles.eyebrow}>01 / ABOUT</p>
   <h1 id="home-title" className={styles.showcaseTitle}>{"Hi, I'm JosHsuan"}<span className={styles.period}>.</span></h1>
   <p className={styles.statement} data-introduction-statement>{introduction.statement}</p>
   <p className={styles.description} data-introduction-description>{introduction.description}</p>
  </div>
  <a className={styles.showcaseScroll} href="#projects">Discover the work <Arrow/></a>
 </section>;
}

function ProjectDeck(){
 return <section id="projects" className={styles.deckSection} style={{'--deck-count':projects.length}} data-home-deck data-portfolio-projects aria-labelledby="deck-title">
  <div className={styles.deckSticky}>
   <header className={styles.deckHeading}><div><p className={styles.eyebrow}>02 / DISCOVER</p><h2 id="deck-title">A different perspective.</h2></div><p data-deck-count>01 / {String(projects.length).padStart(2,'0')}</p></header>
   <ol className={styles.deckCards}>{projects.map((project,index)=><li key={project.id} className={styles.deckCard} data-deck-card={project.id}>
    <div className={styles.deckImage}><img src={project.image.src} width={project.image.width} height={project.image.height} alt={project.image.alt} loading="eager" decoding="async" data-site-critical/></div>
    <a href={project.href} className={styles.deckLink} data-project-card={project.id} aria-labelledby={`deck-title-${project.id}`}>
     <span className={styles.deckSerial}>{String(index+1).padStart(2,'0')} / {String(projects.length).padStart(2,'0')}</span>
     <div className={styles.deckCopy}><p>{project.category}</p><h3 id={`deck-title-${project.id}`}>{project.title}</h3><span>Explore project <Arrow diagonal/></span></div>
    </a>
   </li>)}</ol>
   <footer className={styles.deckFooter}><span>Scroll to reveal / Reverse to revisit</span><a href="/projects/">View all projects <Arrow diagonal/></a><a href="#contact">Contact <Arrow/></a></footer>
  </div>
 </section>;
}

function About({standalone=false}){
  const Heading=standalone?'h1':'h2';
  const ApproachHeading=standalone?'h2':'h3';
  return <section id="about" className={[styles.section,standalone?styles.standalone:''].join(' ')} aria-labelledby="about-title" data-portfolio-about data-home-introduction={standalone?'':undefined}>
    <div className={`${styles.sectionLead} ${styles.scrollCopy}`} data-information-window="about-introduction" data-information-motion-surface="plane" data-home-scroll-window="about-introduction"><InformationSkin/>
      <p className={styles.eyebrow}>01 / ABOUT</p>
      <div><Heading id="about-title" className={styles.sectionTitle}>Between physical and digital.</Heading>
        <p className={styles.sectionIntro} data-introduction-statement>{introduction.statement}</p>
        <p className={styles.prose} data-introduction-description>{introduction.description}</p>
        {!standalone&&<a href="/about/" className={styles.textLink}>More about my approach <Arrow diagonal/></a>}
      </div>
    </div>
    <div className={styles.approaches}>{approaches.map(approach=><article key={approach.name} className={styles.scrollCopy} data-information-window="about-approach" data-information-motion-surface="plane" data-home-scroll-window={approach.name}><InformationSkin/>
      <p className={styles.eyebrow}>{approach.name}</p><ApproachHeading>{approach.title}</ApproachHeading><p>{approach.description}</p>
    </article>)}</div>
    {standalone&&<a href="/projects/" className={`${styles.textLink} ${styles.scrollCopy}`} data-information-window="about-project-link" data-information-motion-surface="plane" data-home-scroll-window="about-project-link"><InformationSkin/>Explore the tools and workflows <Arrow diagonal/></a>}
  </section>;
}

function Projects({standalone=false,scrolling=true}){
  const Heading=standalone?'h1':'h2';
  const CardHeading=standalone?'h2':'h3';
  return <section id="projects" className={[styles.section,styles.projects,standalone?styles.standalone:''].join(' ')} aria-labelledby="projects-title" data-portfolio-projects>
    <div className={scrolling?`${styles.projectHeading} ${styles.scrollCopy}`:styles.projectHeading} data-information-window={scrolling?'home-project-heading':undefined} data-information-motion-surface={scrolling?'plane':undefined} data-home-scroll-window={scrolling?'project-heading':undefined}>
      {scrolling&&<InformationSkin/>}
      <div><p className={styles.eyebrow}>02 / SELECTED PROJECTS</p><Heading id="projects-title" className={styles.sectionTitle}>Design systems, made tangible.</Heading></div>
      <p className={styles.projectCount}>{String(projects.length).padStart(2,'0')} projects<br/>Computation / fabrication / interaction</p>
    </div>
    <ul className={styles.projectGrid} style={{'--project-grid-rows':projectGridRows(projects.length)}} data-project-grid data-project-grid-cells={projectGridRows(projects.length)*3}>
      {projects.map(project=><li key={project.id} className={project.id==='xr-bending-active'?`${styles.projectCard} ${styles.xrProjectCard}`:styles.projectCard} data-project-tile={project.id} data-information-window={scrolling?'home-project-card':undefined} data-information-motion-surface={scrolling&&project.id!=='bending-active'?'plane':undefined} data-home-scroll-window={scrolling?project.id:undefined}>
        {scrolling&&<InformationSkin/>}
        <div className={styles.projectImage}>
          {project.id==='bending-active'&&standalone
            ?<ProjectModelPreview poster={project.image}/>
            :<img src={project.image.src} width={project.image.width} height={project.image.height} alt={project.image.alt} loading="eager" decoding="async" data-site-critical data-project-card-image/>}
        </div>
        <a className={styles.projectLink} href={project.href} data-project-card={project.id} aria-labelledby={`project-card-${project.id}`} aria-describedby={`project-description-${project.id}`}>
          <div className={styles.cardCopy} data-project-card-title>
            <span className={styles.cardCategory}>{project.category}</span><CardHeading id={`project-card-${project.id}`}>{project.title}</CardHeading><span className={styles.cardAction}>Explore project <Arrow diagonal/></span>
          </div>
          <span className={styles.accessibleOnly} id={`project-description-${project.id}`}>{project.description}</span>
        </a>
      </li>)}
    </ul>
    <p className={scrolling?`${styles.gridNote} ${styles.scrollCopy}`:styles.gridNote} data-information-window={scrolling?'home-project-note':undefined} data-information-motion-surface={scrolling?'plane':undefined} data-home-scroll-window={scrolling?'project-note':undefined}>{scrolling&&<InformationSkin/>}Studies connecting computational design, spatial interaction and physical fabrication.</p>
  </section>;
}

function Contact({standalone=false,scrolling=true}){
  const Heading=standalone?'h1':'h2';
  return <section id="contact" className={[styles.section,styles.contact,standalone?styles.contactPage:''].join(' ')} aria-labelledby="contact-title" data-portfolio-contact>
    <div className={scrolling?styles.scrollCopy:undefined} data-information-window={scrolling?'home-contact':undefined} data-information-motion-surface={scrolling?'plane':undefined} data-home-scroll-window={scrolling?'contact':undefined}>{scrolling&&<InformationSkin/>}<p className={styles.eyebrow}>03 / CONTACT</p><Heading id="contact-title" className={styles.sectionTitle}>Let’s connect.</Heading><p className={styles.prose}>Have a question about the work or an idea to share? I’d be happy to hear from you.</p></div>
    <div className={scrolling?`${styles.contactChannels} ${styles.scrollCopy}`:styles.contactChannels} data-information-window={scrolling?'home-contact-channels':undefined} data-information-motion-surface={scrolling?'plane':undefined} data-home-scroll-window={scrolling?'contact-channels':undefined}>{scrolling&&<InformationSkin/>}
      <a href={`mailto:${contact.email}`} className={styles.contactLink} data-contact-email><span><span className={styles.invitationLabel}>EMAIL</span><span className={styles.contactHandle}>{contact.email}</span></span><Arrow diagonal/></a>
      <nav className={styles.socialLinks} aria-label="Public profiles" data-contact-social-links>{contact.socialLinks.map(link=><a key={link.id} href={link.href} target="_blank" rel="noreferrer" aria-label={`${link.label} (new tab)`}>{link.label}<Arrow diagonal/></a>)}</nav>
    </div>
  </section>;
}

/** Shared static portfolio pages. SiteExperience alone owns event-driven entry. */
export default function PortfolioHome({section='home'}){
  return <div className={styles.portfolio}>
    <PortfolioNavigation current={section}/>
    <main id="portfolio-main" tabIndex={-1} className={styles.main} data-portfolio-root data-information-motion-profile="velocity-skin" data-portfolio-section={section}>
      {section==='home'&&<><Introduction/><ProjectDeck/><Contact scrolling/></>}
      {section==='about'&&<><About standalone/><Contact/></>}
      {section==='projects'&&<><Projects standalone/><Contact/></>}
      {section==='contact'&&<Contact standalone/>}
      <footer className={styles.footer}><span>JosHsuan Chao</span><span>DESIGN TECHNOLOGY / FABRICATION / SPATIAL INTERACTION</span><a href="#portfolio-main">Back to top <span aria-hidden="true">↑</span></a></footer>
    </main>
  </div>;
}
