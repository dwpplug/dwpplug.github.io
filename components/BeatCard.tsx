import React from 'react';
import { Beat } from '../types';
import { Play, Pause, Calendar, Zap, Disc } from 'lucide-react';
import { Link } from 'react-router-dom';
import { usePlayer } from '../contexts/PlayerContext';

interface BeatCardProps {
  beat: Beat;
}

const BeatCard: React.FC<BeatCardProps> = ({ beat }) => {
  const { currentBeat, isPlaying, playBeat } = usePlayer();
  
  const isCurrent = currentBeat?.id === beat.id;
  const isPlayingCurrent = isCurrent && isPlaying;

  const handlePlayClick = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigation if inside a link
    playBeat(beat);
  };

  return (
    <div className={`bg-surface rounded-xl overflow-hidden hover:transform hover:scale-[1.02] transition-all duration-300 shadow-lg border group ${isCurrent ? 'border-primary' : 'border-gray-800'}`}>
      <div className="relative aspect-square overflow-hidden">
        <img 
          src={beat.coverImage} 
          alt={beat.title} 
          className="w-full h-full object-cover group-hover:opacity-60 transition-opacity"
        />
        <div className={`absolute inset-0 flex items-center justify-center transition-opacity ${isPlayingCurrent ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
          <button 
            onClick={handlePlayClick}
            className="w-14 h-14 bg-primary rounded-full flex items-center justify-center shadow-lg hover:bg-indigo-500 transition-colors transform hover:scale-110"
          >
            {isPlayingCurrent ? (
               <Pause fill="white" className="text-white" />
            ) : (
               <Play fill="white" className="text-white ml-1" />
            )}
          </button>
        </div>
        <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-md px-2 py-1 rounded text-xs font-bold text-white border border-gray-700">
          {beat.bpm} BPM
        </div>
      </div>
      
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className={`font-bold text-lg truncate pr-2 ${isCurrent ? 'text-primary' : 'text-white'}`}>{beat.title}</h3>
            <div className="flex items-center gap-2 text-gray-400 text-xs mt-1">
              <span className="flex items-center gap-1"><Disc size={12}/> {beat.genre}</span>
              <span className="w-1 h-1 rounded-full bg-gray-600"></span>
              <span className="flex items-center gap-1"><Calendar size={12}/> {new Date(beat.date).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
        
        <Link 
          to={`/beat/${beat.id}`}
          className="w-full mt-4 bg-gray-800 hover:bg-gray-700 text-white py-2 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2"
        >
          <Zap size={16} className="text-yellow-400"/>
          Get Beat
        </Link>
      </div>
    </div>
  );
};

export default BeatCard;
