import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getBeatById } from '../services/beatService';
import { Beat } from '../types';
import { Download, AlertTriangle, CheckCircle, ExternalLink, ArrowLeft, ShieldAlert } from 'lucide-react';

const BeatDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [beat, setBeat] = useState<Beat | null>(null);
  const [adBlockDetected, setAdBlockDetected] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  
  // Unlock Status
  const [step1Clicked, setStep1Clicked] = useState(false);
  const [step2Clicked, setStep2Clicked] = useState(false);

  // Check for AdBlocker
  const detectAdBlock = useCallback(async () => {
    // Method 1: Check hidden bait element (defined in index.html)
    const bait = document.getElementById('ad-detection');
    if (bait) {
      const styles = window.getComputedStyle(bait);
      if (styles.display === 'none' || styles.height === '0px' || styles.visibility === 'hidden') {
        setAdBlockDetected(true);
        setLoading(false);
        return;
      }
    }

    // Method 2: Try to fetch a known ad script (simulation)
    // In a real environment, you might try fetching 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js'
    // For this demo, we assume false unless the CSS check above caught it, or if we use a specific variable often blocked.
    // We can also create a 'fake' request.
    try {
       // Just a simulated delay for realism
       await new Promise(r => setTimeout(r, 500));
       // To test AdBlock logic without an extension, uncomment the line below:
       // setAdBlockDetected(true); 
    } catch (e) {
      setAdBlockDetected(true);
    }
    
    setLoading(false);
  }, []);

  useEffect(() => {
    if (id) {
      const found = getBeatById(id);
      setBeat(found || null);
    }
    detectAdBlock();
  }, [id, detectAdBlock]);

  const handleAdClick = (step: 1 | 2, url: string) => {
    window.open(url, '_blank');
    if (step === 1) setStep1Clicked(true);
    if (step === 2) setStep2Clicked(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!beat) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <h2 className="text-2xl font-bold text-red-500">Beat not found</h2>
        <Link to="/" className="text-primary hover:underline">Go Home</Link>
      </div>
    );
  }

  // AdBlocker Modal / Gatekeeper
  if (adBlockDetected) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4">
        <div className="bg-surface max-w-md w-full p-8 rounded-2xl border border-red-500 shadow-2xl text-center">
          <ShieldAlert className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">AdBlocker Detected!</h2>
          <p className="text-gray-400 mb-6">
            We offer these beats for free by using advertisements. Please support the site by disabling your AdBlocker to access the download.
          </p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg transition-colors w-full"
          >
            I've Disabled It - Refresh
          </button>
          <p className="text-xs text-gray-500 mt-4">
            If you don't have an AdBlocker, try checking your browser's tracking protection settings.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20 pt-8 px-4 max-w-5xl mx-auto">
      <Link to="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors">
        <ArrowLeft size={20} /> Back to Browse
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Left: Beat Info */}
        <div className="flex flex-col items-center md:items-start">
          <div className="w-full aspect-square max-w-md rounded-2xl overflow-hidden shadow-2xl mb-6 relative group">
             <img src={beat.coverImage} alt={beat.title} className="w-full h-full object-cover" />
             <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                 {/* Visualizer placeholder or play button would go here */}
                 <div className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20">
                    <div className="w-3 h-3 bg-secondary rounded-full animate-ping"></div>
                 </div>
             </div>
          </div>
          
          <h1 className="text-3xl md:text-5xl font-extrabold mb-2">{beat.title}</h1>
          <div className="flex flex-wrap gap-3 mb-6">
            <span className="px-3 py-1 bg-gray-800 rounded-full text-sm text-gray-300 border border-gray-700">{beat.genre}</span>
            <span className="px-3 py-1 bg-gray-800 rounded-full text-sm text-gray-300 border border-gray-700">{beat.bpm} BPM</span>
            <span className="px-3 py-1 bg-gray-800 rounded-full text-sm text-gray-300 border border-gray-700">{new Date(beat.date).toLocaleDateString()}</span>
          </div>
        </div>

        {/* Right: Unlock System */}
        <div className="bg-surface rounded-2xl p-6 md:p-8 border border-gray-800 h-fit sticky top-24">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Download className="text-primary" /> Download
          </h2>
          
          <p className="text-gray-400 text-sm mb-6">
            Complete the steps below to unlock the free download link.
          </p>

          <div className="space-y-4">
            {/* Step 1 */}
            <button
              onClick={() => handleAdClick(1, beat.adLink1)}
              disabled={step1Clicked}
              className={`w-full p-4 rounded-xl border flex items-center justify-between transition-all group ${
                step1Clicked 
                  ? 'bg-green-500/10 border-green-500 text-green-500 cursor-default' 
                  : 'bg-gray-800 border-gray-700 hover:border-primary hover:bg-gray-750 text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${step1Clicked ? 'bg-green-500 text-black' : 'bg-gray-700'}`}>
                  {step1Clicked ? <CheckCircle size={18} /> : '1'}
                </div>
                <span className="font-medium">View Sponsor 1</span>
              </div>
              {!step1Clicked && <ExternalLink size={18} className="text-gray-500 group-hover:text-white" />}
            </button>

            {/* Step 2 */}
            <button
              onClick={() => handleAdClick(2, beat.adLink2)}
              disabled={!step1Clicked || step2Clicked}
              className={`w-full p-4 rounded-xl border flex items-center justify-between transition-all group ${
                step2Clicked
                  ? 'bg-green-500/10 border-green-500 text-green-500 cursor-default'
                  : !step1Clicked
                    ? 'bg-gray-900 border-gray-800 text-gray-600 cursor-not-allowed opacity-50'
                    : 'bg-gray-800 border-gray-700 hover:border-primary hover:bg-gray-750 text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${step2Clicked ? 'bg-green-500 text-black' : 'bg-gray-700'}`}>
                   {step2Clicked ? <CheckCircle size={18} /> : '2'}
                </div>
                <span className="font-medium">View Sponsor 2</span>
              </div>
              {step1Clicked && !step2Clicked && <ExternalLink size={18} className="text-gray-500 group-hover:text-white" />}
            </button>
            
            <div className="h-px bg-gray-800 my-6"></div>

            {/* Download Button */}
            {step1Clicked && step2Clicked ? (
              <a 
                href={beat.downloadLink} 
                target="_blank" 
                rel="noopener noreferrer"
                className="block w-full text-center bg-gradient-to-r from-primary to-secondary hover:from-indigo-500 hover:to-pink-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-purple-900/20 transform hover:-translate-y-1 transition-all"
              >
                Download Audio File
              </a>
            ) : (
              <button disabled className="w-full bg-gray-800 text-gray-500 font-bold py-4 rounded-xl cursor-not-allowed flex items-center justify-center gap-2">
                <AlertTriangle size={18} />
                Complete steps to unlock
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BeatDetail;