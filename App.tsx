
import React, { useState, useRef, useCallback } from 'react';
import { Upload, Wand2, Image as ImageIcon, Settings, Download, X, Edit3, Loader2 } from 'lucide-react';
import { generateImageContent } from './services/geminiService';
import { AspectRatio, ModelTier, GeneratedImage } from './types';
import { Button } from './components/Button';
import { Gallery } from './components/Gallery';

const App: React.FC = () => {
  // State
  const [activeTab, setActiveTab] = useState<'create' | 'edit'>('create');
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>(AspectRatio.Square);
  const [model, setModel] = useState<ModelTier>(ModelTier.Flash);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [images, setImages] = useState<GeneratedImage[]>([]);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handlers
  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError("Please enter a prompt description.");
      return;
    }
    
    // For edit mode, we require a base image
    if (activeTab === 'edit' && !uploadedImage) {
      setError("Please upload an image to edit.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const imageUrl = await generateImageContent({
        prompt,
        aspectRatio,
        model,
        referenceImage: activeTab === 'edit' && uploadedImage ? uploadedImage : undefined
      });

      const newImage: GeneratedImage = {
        id: Date.now().toString(),
        url: imageUrl,
        prompt,
        timestamp: Date.now(),
        model,
        aspectRatio
      };

      setImages(prev => [newImage, ...prev]);
      
      // If we are in edit mode, update the 'uploaded' image to the result so users can iterate
      if (activeTab === 'edit') {
         // Optional: Do we want to replace the source? 
         // Let's keep source but maybe show result as primary? 
         // For this UX, let's just add to gallery. 
      }
      
    } catch (err: any) {
      setError(err.message || "Something went wrong during generation.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError("File size too large. Please upload an image under 5MB.");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImage(reader.result as string);
        setActiveTab('edit');
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGallerySelect = (img: GeneratedImage) => {
    // Load selected gallery image into editor
    setUploadedImage(img.url);
    setActiveTab('edit');
    setPrompt(`Variation of: ${img.prompt}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = (id: string) => {
    setImages(prev => prev.filter(img => img.id !== id));
  };

  const clearUpload = () => {
    setUploadedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 pb-20">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-br from-yellow-400 to-orange-500 p-2 rounded-lg">
              <Wand2 className="text-slate-900" size={24} />
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-yellow-200 to-orange-400">
              BananaVision
            </h1>
          </div>
          <div className="flex items-center space-x-4">
             <a href="#" className="text-sm text-slate-400 hover:text-white transition-colors">Documentation</a>
             <div className="h-6 w-px bg-slate-700"></div>
             <div className="flex items-center space-x-2 text-xs text-slate-500">
                <span className={`w-2 h-2 rounded-full ${process.env.API_KEY ? 'bg-green-500' : 'bg-red-500'}`}></span>
                <span>API Ready</span>
             </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Main Interface Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Panel: Controls */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Mode Switcher */}
            <div className="bg-slate-800 p-1 rounded-xl flex shadow-inner">
              <button
                onClick={() => setActiveTab('create')}
                className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                  activeTab === 'create' 
                    ? 'bg-slate-700 text-white shadow-sm' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Create New
              </button>
              <button
                onClick={() => setActiveTab('edit')}
                className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                  activeTab === 'edit' 
                    ? 'bg-slate-700 text-white shadow-sm' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Edit Image
              </button>
            </div>

            {/* Prompt Input */}
            <div className="bg-slate-800 rounded-xl p-5 border border-slate-700 shadow-xl">
              <label className="block text-sm font-medium text-slate-300 mb-2">
                {activeTab === 'create' ? 'Describe your imagination' : 'Describe your edit'}
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={activeTab === 'create' 
                  ? "A futuristic city with flying cars in cyberpunk style..." 
                  : "Change the background to a beach, remove the car..."}
                className="w-full h-32 bg-slate-900 border-slate-700 rounded-lg p-3 text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none transition-all"
              />
              
              {/* Settings Grid */}
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Model</label>
                  <select 
                    value={model}
                    onChange={(e) => setModel(e.target.value as ModelTier)}
                    className="w-full bg-slate-900 border-slate-700 rounded-lg py-2 px-3 text-sm text-slate-200 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value={ModelTier.Flash}>Nano Banana (Fast)</option>
                    <option value={ModelTier.Pro}>Nano Banana Pro (HD)</option>
                    <option value={ModelTier.ImagenFast}>Imagen 4 Fast</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Aspect Ratio</label>
                  <select 
                    value={aspectRatio}
                    onChange={(e) => setAspectRatio(e.target.value as AspectRatio)}
                    className="w-full bg-slate-900 border-slate-700 rounded-lg py-2 px-3 text-sm text-slate-200 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value={AspectRatio.Square}>Square (1:1)</option>
                    <option value={AspectRatio.Wide}>Wide (16:9)</option>
                    <option value={AspectRatio.Tall}>Tall (9:16)</option>
                    <option value={AspectRatio.Portrait}>Portrait (3:4)</option>
                    <option value={AspectRatio.Landscape}>Landscape (4:3)</option>
                  </select>
                </div>
              </div>

              {/* Upload Section (Visible in Edit Mode) */}
              {activeTab === 'edit' && (
                <div className="mt-4 pt-4 border-t border-slate-700">
                  <label className="block text-xs font-medium text-slate-400 mb-2">Reference Image</label>
                  {!uploadedImage ? (
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-slate-600 rounded-lg p-6 text-center hover:bg-slate-700/50 hover:border-slate-500 transition-colors cursor-pointer group"
                    >
                      <div className="bg-slate-700 rounded-full p-2 w-10 h-10 mx-auto flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                        <Upload size={18} className="text-slate-300" />
                      </div>
                      <p className="text-sm text-slate-400">Click to upload</p>
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        className="hidden" 
                        accept="image/*"
                        onChange={handleFileUpload}
                      />
                    </div>
                  ) : (
                    <div className="relative group rounded-lg overflow-hidden border border-slate-600">
                      <img src={uploadedImage} alt="Reference" className="w-full h-40 object-cover opacity-75 group-hover:opacity-100 transition-opacity" />
                      <button 
                        onClick={clearUpload}
                        className="absolute top-2 right-2 bg-black/60 hover:bg-red-600 p-1.5 rounded-full text-white transition-colors"
                      >
                        <X size={14} />
                      </button>
                      <div className="absolute bottom-0 inset-x-0 bg-black/50 p-1">
                        <p className="text-xs text-center text-white">Reference Image</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Generate Button */}
              <div className="mt-6">
                <Button 
                  onClick={handleGenerate} 
                  isLoading={isLoading} 
                  className="w-full py-3 text-lg shadow-indigo-500/20"
                  icon={<Wand2 size={18} />}
                >
                  {activeTab === 'create' ? 'Generate Image' : 'Apply Edits'}
                </Button>
              </div>

              {/* Error Display */}
              {error && (
                <div className="mt-4 p-3 bg-red-900/30 border border-red-800 rounded-lg text-red-200 text-sm flex items-start">
                  <span className="mr-2 mt-0.5">⚠️</span>
                  {error}
                </div>
              )}
            </div>
          </div>

          {/* Right Panel: Preview & Gallery */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Hero / Latest Result */}
            {images.length > 0 ? (
              <div className="bg-slate-800 rounded-2xl overflow-hidden shadow-2xl border border-slate-700">
                <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-slate-800">
                   <h2 className="font-semibold text-slate-200 flex items-center">
                     <ImageIcon size={18} className="mr-2 text-indigo-400" />
                     Latest Creation
                   </h2>
                   <div className="flex gap-2">
                      <button 
                        onClick={() => handleGallerySelect(images[0])}
                        className="text-xs flex items-center px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded-full transition-colors"
                      >
                        <Edit3 size={12} className="mr-1.5" /> Edit this
                      </button>
                      <a 
                        href={images[0].url} 
                        download={`banana-vision-${images[0].id}.png`}
                        className="text-xs flex items-center px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full transition-colors"
                      >
                        <Download size={12} className="mr-1.5" /> Save
                      </a>
                   </div>
                </div>
                <div className="relative bg-slate-900/50 flex items-center justify-center min-h-[400px] p-4 pattern-grid-lg">
                  <img 
                    src={images[0].url} 
                    alt="Latest generated" 
                    className="max-h-[600px] max-w-full rounded-lg shadow-2xl object-contain"
                  />
                </div>
                <div className="p-4 bg-slate-800/80 backdrop-blur-sm border-t border-slate-700">
                  <p className="text-slate-300 italic">"{images[0].prompt}"</p>
                  <div className="flex mt-2 gap-4 text-xs text-slate-500 font-mono">
                    <span>Model: {images[0].model.replace('gemini-', '').replace('imagen-', '').replace('-preview', '')}</span>
                    <span>Ratio: {images[0].aspectRatio}</span>
                  </div>
                </div>
              </div>
            ) : (
              // Empty State
              <div className="bg-slate-800 rounded-2xl border border-slate-700 flex flex-col items-center justify-center min-h-[400px] text-center p-8">
                <div className="bg-slate-700/50 p-6 rounded-full mb-4">
                  <ImageIcon size={48} className="text-slate-500" />
                </div>
                <h3 className="text-xl font-medium text-slate-200 mb-2">Ready to create?</h3>
                <p className="text-slate-400 max-w-md">
                  Enter a prompt on the left to generate new images, or upload a photo to start editing.
                </p>
                {isLoading && (
                  <div className="mt-8 flex items-center text-indigo-400 animate-pulse">
                    <Loader2 className="animate-spin mr-2" />
                    Processing your request...
                  </div>
                )}
              </div>
            )}

            {/* Gallery Grid */}
            <div className="pt-8 border-t border-slate-800">
               <h3 className="text-lg font-semibold text-slate-300 mb-6 flex items-center">
                 <span className="w-1.5 h-6 bg-indigo-500 rounded-full mr-3"></span>
                 History
               </h3>
               <Gallery images={images} onDelete={handleDelete} onSelect={handleGallerySelect} />
            </div>

          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
