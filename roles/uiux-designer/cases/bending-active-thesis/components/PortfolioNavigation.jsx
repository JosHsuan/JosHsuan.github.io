import styles from '../app/portfolio.module.css';

const links=[
  {id:'about',href:'/about/',label:'About'},
  {id:'projects',href:'/projects/',label:'Project'},
  {id:'contact',href:'/contact/',label:'Contact'},
];

/** Native links stay usable before the shared entry and navigation layer starts. */
export default function PortfolioNavigation({current='home',mainId='portfolio-main'}){
  return <>
    <a href={`#${mainId}`} className={styles.skip}>Skip to content</a>
    <header className={styles.navigation} data-portfolio-masthead>
      <a href="/" className={styles.identity} aria-label="JosHsuan Chao — Home" aria-current={current==='home'?'page':undefined} data-home-link>
        <span>JosHsuan Chao</span><span className={styles.identityDivider} aria-hidden="true">/</span><span className={styles.identityDiscipline}>DESIGN + MAKING</span>
      </a>
      <nav aria-label="Main navigation" className={styles.navigationLinks} data-portfolio-navigation>
        {links.map(link=><a key={link.id} href={link.href} aria-current={current===link.id?'page':undefined}>{link.label}</a>)}
      </nav>
    </header>
  </>;
}
