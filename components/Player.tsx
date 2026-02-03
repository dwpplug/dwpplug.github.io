import React, { useEffect, useRef, useState } from 'react';
import { usePlayer } from '../contexts/PlayerContext';
import { Play, Pause, SkipForward, SkipBack, X, Maximize2, Minimize2 } from 'lucide-react';

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: any;
  }
}

const Player: React.FC = () => {
  const { currentBeat, isPlaying, setIsPlaying, togglePlay } = usePlayer();
  const playerRef = useRef<any>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [playerReady, setPlayerReady] = useState(false);

  // Load YouTube API
  useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

      window.onYouTubeIframeAPIReady = () => {
        setPlayerReady(true);
      };
    } else {
      setPlayerReady(true);
    }
  }, []);

  // Initialize/Update Player
  useEffect(() => {
    if (playerReady && currentBeat?.youtubeId) {
      if (playerRef.current) {
        playerRef.current.loadVideoById(currentBeat.youtubeId);
      } else {
        playerRef.current = new window.YT.Player('yt-player', {
          height: '100%',
          width: '100%',
          videoId: currentBeat.youtubeId,
          playerVars: {
            autoplay: 1,
            controls: 1,
            modestbranding: 1,
          },
          events: {
            onStateChange: (event: any) => {
              // 1 = Playing, 2 = Paused
              if (event.data === 1) setIsPlaying(true);
              if (event.data === 2) setIsPlaying(false);
            },
          },
        });
      }
    }
  }, [currentBeat, playerReady]);

  // Handle Play/Pause
  useEffect(() => {
    if (playerRef.current && playerRef.current.playVideo) {
      if (isPlaying) {
        playerRef.current.playVideo();
      } else {
        playerRef.current.pauseVideo();
      }
    }
  }, [isPlaying]);

  if (!currentBeat) return null;

  return (
    <div className={`fixed bottom-0 left-0 right-0 z-50 bg-surface border-t border-gray-800 shadow-2xl transition-all duration-300 ${isExpanded ? 'h-96' : 'h-24'}`}>
      <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between gap-4">
        
        {/* Track Info & Thumbnail */}
        <div className={`flex items-center gap-4 ${isExpanded ? 'absolute top-4 left-4' : ''}`}>
           {/* Video Container - Hidden on mobile if collapsed, but needed for audio policy */}
           <div className={`relative overflow-hidden bg-black rounded-lg transition-all ${isExpanded ? 'w-80 h-48' : 'w-16 h-16'}`}>
              <div id="yt-player" className="w-full h-full"></div>
              {/* Overlay to prevent interaction in collapsed mode so clicks go to expand */}
              {!isExpanded && (
                <div 
                  className="absolute inset-0 cursor-pointer bg-transparent" 
                  onClick={() => setIsExpanded(true)} 
                />
              )}
           </div>
           
           <div className={`${isExpanded ? 'hidden' : 'block'} min-w-0`}>
             <h4 className="font-bold text-white truncate">{currentBeat.title}</h4>
             <p className="text-xs text-gray-400">{currentBeat.genre} • {currentBeat.bpm} BPM</p>
           </div>
        </div>

        {/* Controls */}
        <div className={`flex flex-col items-center justify-center flex-1 ${isExpanded ? 'mt-64' : ''}`}>
          <div className="flex items-center gap-6">
            <button className="text-gray-400 hover:text-white transition-colors">
              <SkipBack size={24} />
            </button>
            
            <button 
              onClick={togglePlay}
              className="w-12 h-12 bg-white rounded-full flex items-center justify-center hover:scale-105 transition-transform"
            >
              {isPlaying ? (
                <Pause className="text-black fill-black" size={20} />
              ) : (
                <Play className="text-black fill-black ml-1" size={20} />
              )}
            </button>
            
            <button className="text-gray-400 hover:text-white transition-colors">
              <SkipForward size={24} />
            </button>
          </div>
        </div>

        {/* Extra Options */}
        <div className={`flex items-center gap-4 ${isExpanded ? 'absolute top-4 right-4' : ''}`}>
           <button 
             onClick={() => setIsExpanded(!isExpanded)}
             className="text-gray-400 hover:text-white hidden md:block"
           >
             {isExpanded ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
           </button>
        </div>
      </div>
    </div>
  );
};

export default Player;
