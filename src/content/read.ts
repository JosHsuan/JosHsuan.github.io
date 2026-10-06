import data from '@/generated/public-content.json';
import { snapshotSchema } from './schema';

const content = snapshotSchema.parse(data);
export const listPublishedProjects = () => content.projects;
export const listPublishedResearch = () => content.research;
export const getPublishedProject = (slug: string) => content.projects.find((entry) => entry.slug === slug);
export const getPublishedResearch = (slug: string) => content.research.find((entry) => entry.slug === slug);
export const getProfile = () => content.profile;
export const getAsset = (id: string) => content.assets.find((asset) => asset.id === id);
