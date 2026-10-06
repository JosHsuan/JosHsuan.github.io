import { notFound } from 'next/navigation';
import { getAsset, getPublishedProject, getPublishedResearch } from '@/content/read';
import { PageFrame } from '@/components/ui/PageFrame';
import { SceneIsland } from '@/features/scene-viewer/SceneIsland';
import { publicAssetUrl } from '@/lib/paths';
import styles from '@/components/ui/PageFrame.module.css';

export function EntryDetail({ kind, slug }: { kind: 'projects' | 'research'; slug: string }) {
  const entry = kind === 'projects' ? getPublishedProject(slug) : getPublishedResearch(slug);
  if (!entry) notFound();
  return <PageFrame title={entry.title} label={kind}><article className={styles.article}>
    <p>{entry.summary}</p><p>{entry.year} · {entry.role}</p>
    {entry.sceneId && <SceneIsland sceneId={entry.sceneId} />}
    {entry.sections.map((section, index) => <section key={index}><h2>{section.heading}</h2>{section.paragraphs.map((paragraph, i) => <p key={i}>{paragraph}</p>)}</section>)}
    {([['個人貢獻', entry.contributions], ['方法', entry.methods], ['成果', entry.outcomes], ['限制', entry.limitations]] as const).map(([label, values]) => values.length > 0 && <section key={label}><h2>{label}</h2><ul>{values.map((value, i) => <li key={i}>{value}</li>)}</ul></section>)}
    {entry.media.map((id) => { const asset = getAsset(id); return asset && <p key={id}><a href={publicAssetUrl(asset.path)}>{asset.alt}</a> · {asset.credit}</p>; })}
    {entry.credits.length > 0 && <section><h2>協作與來源</h2><ul>{entry.credits.map((credit, i) => <li key={i}>{credit.url ? <a href={credit.url}>{credit.name}</a> : credit.name} · {credit.role}</li>)}</ul></section>}
  </article></PageFrame>;
}
