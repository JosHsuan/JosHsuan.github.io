import { PageFrame } from '@/components/ui/PageFrame';
import { getAsset, getProfile } from '@/content/read';
import { publicAssetUrl } from '@/lib/paths';
export const metadata = { title: '關於' };
export default function AboutPage() {
  const profile = getProfile();
  const cv = profile?.cvAssetId ? getAsset(profile.cvAssetId) : undefined;
  return <PageFrame title="關於" label="About / CV">{profile ? <article><h2>{profile.name}</h2><p>{profile.summary}</p>{profile.biography.map((paragraph, index) => <p key={index}>{paragraph}</p>)}{cv && <a href={publicAssetUrl(cv.path)} download>下載 CV</a>}</article> : undefined}</PageFrame>;
}
