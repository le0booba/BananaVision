import React from 'react';
import { GeneratedImage } from '../types';
import { Download, Trash2, Maximize2 } from 'lucide-react';

interface GalleryProps {
  images: GeneratedImage[];
  onDelete: (id: string) => void;
  onSelect: (image: GeneratedImage) => void;
}

export const Gallery: React.FC<GalleryProps> = ({ images, onDelete, onSelect }) => {
  if (images.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-slate-700 rounded-xl bg-slate-800/50">
        <p className="text-slate-400 text-lg">No images generated yet.</p>
        <p className="text-slate-500 text-sm mt-2">Start creating to see your artwork here.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {images.map((img) => (
        <div key={img.id} className="group relative bg-slate-800 rounded-xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 border border-slate-700">
          <div className="aspect-square w-full overflow-hidden bg-slate-900 relative">
            <img 
              src={img.url} 
              alt={img.prompt} 
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            {/* Overlay */}
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2 backdrop-blur-sm">
               <button 
                onClick={() => onSelect(img)}
                className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
                title="View / Edit"
              >
                <Maximize2 size={20} />
              </button>
              <a 
                href={img.url} 
                download={`banana-vision-${img.id}.png`}
                className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
                title="Download"
              >
                <Download size={20} />
              </a>
              <button 
                onClick={() => onDelete(img.id)}
                className="p-2 bg-red-500/20 hover:bg-red-500/40 text-red-400 hover:text-red-200 rounded-full transition-colors"
                title="Delete"
              >
                <Trash2 size={20} />
              </button>
            </div>
          </div>
          <div className="p-3">
            <p className="text-xs text-slate-400 font-mono truncate" title={img.model}>
              {img.model.replace('gemini-', '').replace('-preview', '')}
            </p>
            <p className="text-sm text-slate-200 line-clamp-2 mt-1 leading-snug" title={img.prompt}>
              {img.prompt}
            </p>
            <p className="text-xs text-slate-500 mt-2">
              {new Date(img.timestamp).toLocaleTimeString()}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};
