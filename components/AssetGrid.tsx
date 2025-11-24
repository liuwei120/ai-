import React from 'react';
import { ImageAsset } from '../types';

interface AssetGridProps {
  assets: ImageAsset[];
  selectedId: string | null;
  onSelect: (asset: ImageAsset) => void;
  title: string;
}

export const AssetGrid: React.FC<AssetGridProps> = ({ assets, selectedId, onSelect, title }) => {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">{title}</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {assets.map((asset) => (
          <div 
            key={asset.id}
            onClick={() => onSelect(asset)}
            className={`
              group relative cursor-pointer rounded-2xl overflow-hidden aspect-[3/4] transition-all duration-300
              ${selectedId === asset.id ? 'ring-4 ring-indigo-500 ring-offset-2 scale-[1.02] shadow-xl' : 'hover:shadow-md hover:scale-[1.02]'}
            `}
          >
            <img 
              src={asset.url} 
              alt={asset.label || 'Asset'} 
              className="w-full h-full object-cover"
            />
            {asset.isGenerated && (
              <div className="absolute top-2 right-2 bg-purple-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold shadow-sm">
                AI
              </div>
            )}
            <div className={`absolute inset-0 bg-black/20 transition-opacity ${selectedId === asset.id ? 'opacity-0' : 'opacity-0 group-hover:opacity-10'}`} />
            
            {selectedId === asset.id && (
              <div className="absolute inset-0 flex items-center justify-center bg-indigo-500/20 backdrop-blur-[1px]">
                 <div className="bg-white rounded-full p-2 shadow-lg">
                    <svg className="w-6 h-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                 </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
