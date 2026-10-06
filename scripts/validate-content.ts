import { readContentSource } from './content-source';
const snapshot = await readContentSource();
console.log(`Content valid: ${snapshot.projects.length} projects, ${snapshot.research.length} research entries, ${snapshot.assets.length} approved assets.`);
