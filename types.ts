export interface ImageAsset {
  id: string;
  url: string; // Base64 or remote URL
  type: 'person' | 'outfit';
  label?: string;
  isGenerated?: boolean;
}

export enum AppStep {
  SELECT_PERSON = 0,
  SELECT_OUTFIT = 1,
  RESULT = 2,
}

export interface GenerationConfig {
  prompt?: string;
  aspectRatio?: string;
}
