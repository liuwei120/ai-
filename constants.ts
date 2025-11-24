import { ImageAsset } from './types';

// Placeholder images mimicking a fashion app
export const DEFAULT_PEOPLE: ImageAsset[] = [
  {
    id: 'p1',
    type: 'person',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1000&auto=format&fit=crop',
    label: 'Model A'
  },
  {
    id: 'p2',
    type: 'person',
    url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=1000&auto=format&fit=crop',
    label: 'Model B'
  },
  {
    id: 'p3',
    type: 'person',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1000&auto=format&fit=crop',
    label: 'Model C'
  }
];

export const DEFAULT_OUTFITS: ImageAsset[] = [
  {
    id: 'c1',
    type: 'outfit',
    url: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=1000&auto=format&fit=crop',
    label: 'Denim Jacket'
  },
  {
    id: 'c2',
    type: 'outfit',
    url: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=1000&auto=format&fit=crop',
    label: 'Black T-Shirt'
  },
  {
    id: 'c3',
    type: 'outfit',
    url: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1000&auto=format&fit=crop',
    label: 'Summer Dress'
  }
];
