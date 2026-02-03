import React, { useState, useMemo, useEffect } from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';
import { Beat, SortOption, FilterGenre, GENRES } from '../types';
import { getBeats } from '../services/beatService';
import BeatCard from '../components/BeatCard';

const Home: React.FC = () => {
  const [beats, setBeats] = useState<Beat[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<FilterGenre>('All');
  const [sortOption, setSortOption] = useState<SortOption>('newest');

  useEffect(() => {
    // Load beats from service (local storage simulation)
    setBeats(getBeats());
  }, []);

  const filteredAndSortedBeats = useMemo(() => {
    let result = [...beats];

    // Filter by Search
    if (searchTerm) {
      result = result.filter(beat => 
        beat.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by Genre
    if (selectedGenre !== 'All') {
      result = result.filter(beat => beat.genre === selectedGenre);
    }

    // Sort
    result.sort((a, b) => {
      switch (sortOption) {
        case 'newest':
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case 'oldest':
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        case 'bpm_high':
          return b.bpm - a.bpm;
        case 'bpm_low':
          return a.bpm - b.bpm;
        default:
          return 0;
      }
    });

    return result;
  }, [beats, searchTerm, selectedGenre, sortOption]);

  return (
    <div className="min-h-screen pb-20">
      {/* Hero Section */}
      <div className="bg-gradient-to-b from-surface to-background py-12 md:py-20 px-4 text-center">
        <h1 className="text-4xl md:text-6xl font-extrabold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-primary to-secondary">
          Find Your Next Hit
        </h1>
        <p className="text-gray-400 max-w-2xl mx-auto text-lg mb-8">
          Premium beats and instrumentals. Download high-quality tracks instantly.
        </p>

        {/* Search Bar */}
        <div className="max-w-xl mx-auto relative group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-500 group-focus-within:text-primary transition-colors" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-3 border border-gray-700 rounded-full leading-5 bg-black/50 text-gray-300 placeholder-gray-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary sm:text-sm transition-all shadow-xl backdrop-blur-sm"
            placeholder="Search beats by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Filters & Controls */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          
          {/* Genres */}
          <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
            {GENRES.map((genre) => (
              <button
                key={genre}
                onClick={() => setSelectedGenre(genre)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  selectedGenre === genre
                    ? 'bg-primary text-white'
                    : 'bg-surface text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
              >
                {genre}
              </button>
            ))}
          </div>

          {/* Sort */}
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-gray-400" />
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value as SortOption)}
              className="bg-surface border-none text-gray-300 text-sm rounded-lg focus:ring-primary focus:border-primary block p-2"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="bpm_high">Highest BPM</option>
              <option value="bpm_low">Lowest BPM</option>
            </select>
          </div>
        </div>

        {/* Beats Grid */}
        {filteredAndSortedBeats.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredAndSortedBeats.map((beat) => (
              <BeatCard key={beat.id} beat={beat} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg">No beats found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;