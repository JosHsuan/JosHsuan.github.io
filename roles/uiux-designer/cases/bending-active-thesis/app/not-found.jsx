import PortfolioNavigation from '../components/PortfolioNavigation';
import styles from './portfolio.module.css';

/** The published error document shares the same actual OCR type and navigation. */
export default function NotFound(){
 return <div className={styles.portfolio}>
  <PortfolioNavigation current="not-found"/>
  <main id="portfolio-main" tabIndex={-1} className={styles.main} data-portfolio-root data-portfolio-section="not-found">
   <section className={`${styles.section} ${styles.standalone}`} aria-labelledby="not-found-title">
    <p className={styles.eyebrow}>404 / PAGE NOT FOUND</p>
    <h1 id="not-found-title" className={styles.sectionTitle}>This page is not available.</h1>
    <p className={styles.prose}>Return to the introduction or explore the selected projects.</p>
    <a href="/" className={styles.textLink}>Return to home <span aria-hidden="true">↗</span></a>
   </section>
  </main>
 </div>;
}
