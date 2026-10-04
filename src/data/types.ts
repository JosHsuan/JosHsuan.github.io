export type CategoryId = 'research' | 'fabrication' | 'computational' | 'creative' | 'xr';

export type SceneKind =
  | 'bending'
  | 'dots'
  | 'aggregation'
  | 'stacking'
  | 'garden'
  | 'waffle'
  | 'toolpath'
  | 'subdivision'
  | 'cutting'
  | 'surface'
  | 'none';

export interface PortfolioLink {
  label: string;
  url: string;
}

export interface Credit {
  name: string;
  role: string;
}

export interface ProjectRole {
  type: string;
  personal: string[];
  team: string[];
  scope: string;
}

export interface ProjectMedia {
  status: 'original' | 'illustrative' | 'unavailable';
  label: string;
  images: { src: string; alt: string; caption: string; width?: number; height?: number }[];
  video?: { src: string; caption: string };
  model?: { src: string; caption: string };
}

export interface Project {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  year: string;
  category: CategoryId;
  tags: string[];
  featured: boolean;
  summary: string;
  context: string;
  role: ProjectRole;
  method: string[];
  process: string[];
  result: string[];
  tools: string[];
  credits: Credit[];
  links: PortfolioLink[];
  media: ProjectMedia;
  scene: SceneKind;
  sceneCaption: string;
  accent: string;
}

export interface Profile {
  name: string;
  preferredName: string;
  initials: string;
  headline: string;
  introduction: string;
  about: string[];
  github: string;
  email?: string;
  cvUrl: string;
  contactNote: string;
}

export interface Filter {
  id: 'all' | CategoryId;
  label: string;
}

export interface Capability {
  title: string;
  description: string;
  tools: string[];
}

export interface Experience {
  organization: string;
  role: string;
  period: string;
  description: string[];
}

export interface Education {
  institution: string;
  program: string;
  period: string;
  focus: string;
}

export interface Publication {
  title: string;
  authors: string[];
  venue: string;
  year: string;
  url: string;
}

export interface Award {
  title: string;
  distinction: string;
  year: string;
}
