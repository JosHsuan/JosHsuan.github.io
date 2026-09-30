import type { Project, Media } from '../content/portfolio'

export const mediaUrl = (media: Media, thumbnail = false) => `/media/${media.id}${media.id === 'woodflow-workflow' ? '.svg' : `${thumbnail ? '-thumb' : ''}.webp`}`

export default function ProjectCard({ project, section = 'work', index }: { project: Project; section?: 'work' | 'lab'; index: number }) {
  return <article className="project-card" data-reading-anchor>
    <a href={`#/${section}/${project.slug}`} className="project-link">
      <div className={`card-image${project.cover.fit === 'contain' ? ' image-contain' : ''}`}>
        <img src={mediaUrl(project.cover, true)} alt={project.cover.alt} width="640" height="400" loading="lazy" decoding="async" />
        <span className="image-open" aria-hidden="true">↗</span>
      </div>
      <div className="card-meta"><span>{String(index + 1).padStart(2, '0')} / {project.category}</span><span>{project.year}</span></div>
      <h3>{project.title}<span aria-hidden="true">↗</span></h3>
      <p className="card-summary">{project.summary}</p>
      <p className="card-role"><span>Role</span> {project.role}</p>
    </a>
  </article>
}
