import { PageFrame } from '@/components/ui/PageFrame';
import { getProfile } from '@/content/read';
export const metadata = { title: '聯絡' };
export default function ContactPage() {
  const profile = getProfile();
  return <PageFrame title="聯絡" label="Contact">{profile && (profile.email || profile.links.length) ? <div>{profile.email && <p><a href={`mailto:${profile.email}`}>{profile.email}</a></p>}{profile.links.map((link) => <p key={link.url}><a href={link.url}>{link.label}</a></p>)}</div> : undefined}</PageFrame>;
}
