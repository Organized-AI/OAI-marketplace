export interface Component {
  id: string;
  name: string;
  icon: string;
  description: string;
  category: string;
  subCategory?: string;
  company?: string;
  downloads?: number;
  tags?: string[];
  filePath?: string;
  version?: string;
  dependencies?: string[];
  optionalDependencies?: string[];
  conflicts?: string[];
  recommends?: string[];
}

export interface MarketplaceData {
  agents: Component[];
  commands: Component[];
  settings: Component[];
  hooks: Component[];
  mcps: Component[];
  templates?: Component[];
  skills?: Component[];
  [key: string]: Component[] | undefined;
}

declare const marketplaceData: MarketplaceData;
export default marketplaceData;
