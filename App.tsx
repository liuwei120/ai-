import React, { useState, useEffect } from 'react';
import { AppStep, ImageAsset } from './types';
import { DEFAULT_PEOPLE, DEFAULT_OUTFITS } from './constants';
import { AssetGrid } from './components/AssetGrid';
import { Button } from './components/Button';
import { Steps } from './components/Steps';
import { Uploader } from './components/Uploader';
import { generateOutfitImage, generateTryOnResult, urlToBase64 } from './services/geminiService';

const App: React.FC = () => {
  // State
  const [step, setStep] = useState<AppStep>(AppStep.SELECT_PERSON);
  const [people, setPeople] = useState<ImageAsset[]>(DEFAULT_PEOPLE);
  const [outfits, setOutfits] = useState<ImageAsset[]>(DEFAULT_OUTFITS);
  
  const [selectedPersonId, setSelectedPersonId] = useState<string | null>(null);
  const [selectedOutfitId, setSelectedOutfitId] = useState<string | null>(null);
  
  const [outfitPrompt, setOutfitPrompt] = useState('');
  const [isGeneratingOutfit, setIsGeneratingOutfit] = useState(false);
  const [isGeneratingResult, setIsGeneratingResult] = useState(false);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Helper to handle adding uploaded images
  const handleUpload = (base64: string, type: 'person' | 'outfit', filename: string) => {
    const newAsset: ImageAsset = {
      id: `upload-${Date.now()}`,
      url: base64,
      type,
      label: filename
    };
    if (type === 'person') {
      setPeople(prev => [newAsset, ...prev]);
      setSelectedPersonId(newAsset.id);
    } else {
      setOutfits(prev => [newAsset, ...prev]);
      setSelectedOutfitId(newAsset.id);
    }
  };

  // Generate Outfit Logic
  const handleGenerateOutfit = async () => {
    if (!outfitPrompt.trim()) return;
    setIsGeneratingOutfit(true);
    setError(null);
    try {
      const generatedBase64 = await generateOutfitImage(outfitPrompt);
      const newAsset: ImageAsset = {
        id: `gen-${Date.now()}`,
        url: generatedBase64,
        type: 'outfit',
        label: outfitPrompt,
        isGenerated: true
      };
      setOutfits(prev => [newAsset, ...prev]);
      setSelectedOutfitId(newAsset.id);
      setOutfitPrompt('');
    } catch (err: any) {
      setError(err.message || 'Failed to generate outfit. Please try again.');
    } finally {
      setIsGeneratingOutfit(false);
    }
  };

  // Generate Final Try-On Logic
  const handleTryOn = async () => {
    const person = people.find(p => p.id === selectedPersonId);
    const outfit = outfits.find(o => o.id === selectedOutfitId);

    if (!person || !outfit) return;

    setIsGeneratingResult(true);
    setError(null);
    setResultImage(null); // Reset previous result

    try {
      // If the selected images are URLs (remote), convert to base64 first
      const personB64 = person.url.startsWith('data:') ? person.url : await urlToBase64(person.url);
      const outfitB64 = outfit.url.startsWith('data:') ? outfit.url : await urlToBase64(outfit.url);

      const result = await generateTryOnResult(personB64, outfitB64);
      setResultImage(result);
      setStep(AppStep.RESULT);
    } catch (err: any) {
      setError(err.message || 'Failed to perform virtual try-on. Please try again.');
    } finally {
      setIsGeneratingResult(false);
    }
  };

  // Navigation handlers
  const canProceedToOutfit = !!selectedPersonId;
  const canProceedToResult = !!selectedOutfitId;

  const goToNextStep = () => {
    if (step === AppStep.SELECT_PERSON && canProceedToOutfit) setStep(AppStep.SELECT_OUTFIT);
    if (step === AppStep.SELECT_OUTFIT && canProceedToResult) handleTryOn();
  };

  const goToPrevStep = () => {
    if (step === AppStep.SELECT_OUTFIT) setStep(AppStep.SELECT_PERSON);
    if (step === AppStep.RESULT) setStep(AppStep.SELECT_OUTFIT);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center">
      {/* Header */}
      <header className="w-full bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-2xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🍌</span>
            <h1 className="font-bold text-xl text-gray-900 tracking-tight">NanoStyle AI</h1>
          </div>
          <div className="text-xs font-medium bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full">
            Gemini Flash 2.5
          </div>
        </div>
      </header>

      <main className="w-full max-w-2xl px-6 pb-24">
        <Steps currentStep={step} />

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl text-sm flex items-center gap-2 border border-red-100">
             <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
             {error}
          </div>
        )}

        {/* STEP 1: Person Selection */}
        {step === AppStep.SELECT_PERSON && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-gray-900">Choose a Model</h2>
              <p className="text-gray-500">Upload your own photo or pick a preset model.</p>
            </div>

            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 space-y-6">
               <Uploader 
                  label="Upload your full-body photo" 
                  onUpload={(b64, name) => handleUpload(b64, 'person', name)} 
               />
               <AssetGrid 
                  title="Presets" 
                  assets={people} 
                  selectedId={selectedPersonId} 
                  onSelect={(p) => setSelectedPersonId(p.id)} 
               />
            </div>
          </div>
        )}

        {/* STEP 2: Outfit Selection */}
        {step === AppStep.SELECT_OUTFIT && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-gray-900">Pick an Outfit</h2>
              <p className="text-gray-500">Select, upload, or generate a unique style.</p>
            </div>

            {/* AI Generator Box */}
            <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-6 rounded-3xl shadow-lg text-white space-y-4">
              <div className="flex items-center gap-2 mb-2">
                 <svg className="w-5 h-5 text-yellow-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                 <h3 className="font-bold text-lg">AI Outfit Designer</h3>
              </div>
              <p className="text-indigo-100 text-sm">Describe a clothing item (e.g., "A vintage red leather jacket with gold studs")</p>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={outfitPrompt}
                  onChange={(e) => setOutfitPrompt(e.target.value)}
                  placeholder="Describe your dream outfit..."
                  className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-indigo-200 focus:outline-none focus:bg-white/20 focus:border-white/40 transition-all"
                  onKeyDown={(e) => e.key === 'Enter' && handleGenerateOutfit()}
                />
                <Button 
                   onClick={handleGenerateOutfit} 
                   isLoading={isGeneratingOutfit}
                   className="bg-white text-indigo-700 hover:bg-indigo-50 shadow-none border-0 shrink-0"
                >
                  Generate
                </Button>
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 space-y-6">
              <Uploader 
                  label="Upload outfit photo" 
                  onUpload={(b64, name) => handleUpload(b64, 'outfit', name)} 
              />
              <AssetGrid 
                  title="Wardrobe" 
                  assets={outfits} 
                  selectedId={selectedOutfitId} 
                  onSelect={(o) => setSelectedOutfitId(o.id)} 
              />
            </div>
          </div>
        )}

        {/* STEP 3: Result */}
        {step === AppStep.RESULT && (
          <div className="space-y-6 animate-in fade-in zoom-in duration-500">
             <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-gray-900">Your New Look</h2>
              <p className="text-gray-500">Generated with Gemini Nano Banana.</p>
            </div>

            <div className="bg-white p-4 rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
               {resultImage ? (
                  <div className="relative group">
                    <img src={resultImage} alt="Generated Try-On" className="w-full h-auto rounded-2xl" />
                    <div className="absolute bottom-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <a 
                        href={resultImage} 
                        download="nanostyle-result.png"
                        className="bg-white text-gray-900 px-4 py-2 rounded-full font-medium shadow-lg hover:bg-gray-50 flex items-center gap-2 text-sm"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                        Download
                      </a>
                    </div>
                  </div>
               ) : (
                 <div className="aspect-[3/4] flex items-center justify-center bg-gray-100 rounded-2xl animate-pulse">
                    <p className="text-gray-400">Loading result...</p>
                 </div>
               )}
            </div>
            
             <div className="flex justify-center">
                <Button variant="outline" onClick={() => setStep(AppStep.SELECT_OUTFIT)}>
                   Try Another Outfit
                </Button>
             </div>
          </div>
        )}
      </main>

      {/* Sticky Bottom Actions */}
      {step !== AppStep.RESULT && (
        <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 p-4 z-40">
           <div className="max-w-2xl mx-auto flex items-center justify-between gap-4">
             {step > AppStep.SELECT_PERSON ? (
               <Button variant="ghost" onClick={goToPrevStep}>Back</Button>
             ) : (
               <div /> // Spacer
             )}
             
             <Button 
                onClick={goToNextStep} 
                disabled={(step === AppStep.SELECT_PERSON && !canProceedToOutfit) || (step === AppStep.SELECT_OUTFIT && !canProceedToResult)}
                isLoading={isGeneratingResult}
                className="w-full sm:w-auto min-w-[140px]"
             >
               {step === AppStep.SELECT_OUTFIT ? 'Visualize Look ✨' : 'Next Step'}
             </Button>
           </div>
        </div>
      )}
    </div>
  );
};

export default App;