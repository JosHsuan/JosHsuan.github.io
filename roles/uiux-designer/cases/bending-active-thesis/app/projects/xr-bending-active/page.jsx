import {withShareMetadata} from '../../share-metadata.mjs';
import XRProject from '../../../components/XRProject';
import study from '../../../release/xr-study.json';

export const metadata=withShareMetadata({
  title: study.metadataTitle,
  description: study.metadataDescription,
  alternates: { canonical: '/projects/xr-bending-active/' },
}, study.hero);

export default function XRProjectPage() {
  return <XRProject />;
}
