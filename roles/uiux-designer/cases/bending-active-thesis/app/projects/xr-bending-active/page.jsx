import XRProject from '../../../components/XRProject';
import study from '../../../release/xr-study.json';

export const metadata = {
  title: study.metadataTitle,
  description: study.metadataDescription,
  alternates: { canonical: '/projects/xr-bending-active/' },
};

export default function XRProjectPage() {
  return <XRProject />;
}
