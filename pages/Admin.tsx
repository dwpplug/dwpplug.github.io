import React, { useState } from 'react';
import { addBeat, getBeats } from '../services/beatService';
import { fetchChannelUploads, getVideoDetails } from '../services/youtubeService';
import { Beat, GENRES } from '../types';
import { Plus, Check, Lock, Youtube, Search, ArrowDown } from 'lucide-react';

const Admin: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  
  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<Beat[]>([]);

  // Form State
  const [formData, setFormData] = useState<Partial<Beat>>({
    title: '',
    genre: 'Trap',
    bpm: 140,
    coverImage: 'https://picsum.photos/400/400',
    downloadLink: '',
    adLink1: 'https://adsterra.com/',
    adLink2: 'https://adsterra.com/',
    youtubeId: '',
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === '1965') {
      setIsAuthenticated(true);
    } else {
      alert('Incorrect password');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'bpm' ? parseInt(value) : value
    }));
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setErrorMsg('');
    setSearchResults([]);

    try {
      const targetChannel = 'https://youtube.com/@2knobu';
      let results: Beat[] = [];

      // Check if input is a YouTube URL
      if (searchQuery.includes('youtube.com/') || searchQuery.includes('youtu.be/')) {
        const singleVideo = await getVideoDetails(searchQuery);
        if (singleVideo) results = [singleVideo];
      } else {
        // Otherwise, fetch channel RSS and filter
        const allRecent = await fetchChannelUploads(targetChannel, 15); // Fetch max allowed by RSS
        results = allRecent.filter(beat => 
          beat.title.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }

      if (results.length === 0) {
        setErrorMsg('No videos found matching your query in the latest uploads.');
      } else {
        setSearchResults(results);
      }
    } catch (err: any) {
      setErrorMsg('Search failed. ' + err.message);
    } finally {
      setIsSearching(false);
    }
  };

  const selectVideo = (beat: Beat) => {
    setFormData({
      ...formData,
      title: beat.title,
      bpm: beat.bpm || 140,
      genre: beat.genre || 'Trap',
      coverImage: beat.coverImage,
      youtubeId: beat.youtubeId,
    });
    setSuccessMsg('Form populated from video!');
    setTimeout(() => setSuccessMsg(''), 2000);
    // Clear search results to clean up UI
    setSearchResults([]);
    setSearchQuery('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.downloadLink) {
      alert('Please fill in required fields');
      return;
    }

    const newBeat: Beat = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      title: formData.title!,
      genre: formData.genre as string || 'Trap',
      bpm: formData.bpm || 120,
      coverImage: formData.coverImage || 'https://picsum.photos/400/400',
      downloadLink: formData.downloadLink!,
      adLink1: formData.adLink1 || 'https://google.com',
      adLink2: formData.adLink2 || 'https://google.com',
      youtubeId: formData.youtubeId, // Ensure YouTube ID is saved
    };

    addBeat(newBeat);
    setSuccessMsg('Beat uploaded successfully!');
    
    setFormData({
      title: '',
      genre: 'Trap',
      bpm: 140,
      coverImage: 'https://picsum.photos/400/400',
      downloadLink: '',
      adLink1: 'https://adsterra.com/',
      adLink2: 'https://adsterra.com/',
      youtubeId: '',
    });

    setTimeout(() => setSuccessMsg(''), 3000);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <form onSubmit={handleLogin} className="bg-surface p-8 rounded-2xl border border-gray-800 w-full max-w-sm">
          <div className="flex justify-center mb-6">
            <div className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center">
              <Lock className="text-primary" />
            </div>
          </div>
          <h2 className="text-xl font-bold text-center mb-6">Admin Access</h2>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter Password"
            className="w-full bg-background border border-gray-700 rounded-lg p-3 text-white mb-4 focus:border-primary focus:outline-none"
          />
          <button type="submit" className="w-full bg-primary hover:bg-indigo-600 text-white font-bold py-3 rounded-lg transition-colors">
            Login
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen max-w-4xl mx-auto py-12 px-4">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <button onClick={() => setIsAuthenticated(false)} className="text-sm text-red-400 hover:text-red-300">Logout</button>
      </div>

      {successMsg && (
        <div className="mb-6 bg-green-500/20 border border-green-500 text-green-400 p-4 rounded-lg flex items-center gap-2">
          <Check size={20} /> {successMsg}
        </div>
      )}
      
      {errorMsg && (
        <div className="mb-6 bg-red-500/20 border border-red-500 text-red-400 p-4 rounded-lg flex items-center gap-2">
          <Lock size={20} /> {errorMsg}
        </div>
      )}

      {/* Search & Import Section */}
      <div className="bg-surface border border-gray-800 rounded-2xl p-8 mb-8">
        <div className="flex items-center gap-3 mb-6 text-primary">
           <Search size={24} />
           <h2 className="text-2xl font-bold text-white">Search & Import</h2>
        </div>
        
        <form onSubmit={handleSearch} className="flex gap-4 mb-6">
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-background border border-gray-700 rounded-lg p-3 text-white focus:border-primary focus:outline-none"
            placeholder="Search keywords (e.g. 'Drill') or paste YouTube URL..."
          />
          <button 
            type="submit" 
            disabled={isSearching}
            className="bg-primary hover:bg-indigo-600 text-white px-6 py-3 rounded-lg font-bold transition-colors disabled:opacity-50"
          >
            {isSearching ? 'Searching...' : 'Search'}
          </button>
        </form>

        {searchResults.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {searchResults.map((beat) => (
              <div key={beat.youtubeId} className="bg-background border border-gray-800 p-3 rounded-lg flex gap-3 hover:border-gray-600 transition-colors">
                <img src={beat.coverImage} alt="" className="w-20 h-20 object-cover rounded bg-gray-800" />
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-sm truncate mb-1">{beat.title}</h4>
                  <p className="text-xs text-gray-500 mb-2">{beat.bpm} BPM • {beat.genre}</p>
                  <button 
                    type="button"
                    onClick={() => selectVideo(beat)}
                    className="text-xs bg-gray-800 hover:bg-gray-700 px-3 py-1.5 rounded text-white flex items-center gap-1"
                  >
                    Select <ArrowDown size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Manual Upload Section */}
      <div className="bg-surface border border-gray-800 rounded-2xl p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Beat Details</h2>
          {formData.youtubeId && (
            <span className="text-xs bg-red-900/50 text-red-200 px-2 py-1 rounded border border-red-900 flex items-center gap-1">
              <Youtube size={12} /> YouTube Audio Linked
            </span>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Beat Title</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                className="w-full bg-background border border-gray-700 rounded-lg p-3 text-white focus:border-primary focus:outline-none"
                placeholder="e.g. Midnight Rain"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Genre</label>
              <select
                name="genre"
                value={formData.genre}
                onChange={handleInputChange}
                className="w-full bg-background border border-gray-700 rounded-lg p-3 text-white focus:border-primary focus:outline-none"
              >
                {GENRES.map(g => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">BPM</label>
              <input
                type="number"
                name="bpm"
                value={formData.bpm}
                onChange={handleInputChange}
                required
                className="w-full bg-background border border-gray-700 rounded-lg p-3 text-white focus:border-primary focus:outline-none"
              />
            </div>

             <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Cover Image URL</label>
              <input
                type="text"
                name="coverImage"
                value={formData.coverImage}
                onChange={handleInputChange}
                className="w-full bg-background border border-gray-700 rounded-lg p-3 text-white focus:border-primary focus:outline-none"
                placeholder="https://..."
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">YouTube Video ID (Source Audio)</label>
            <div className="relative">
              <input
                type="text"
                name="youtubeId"
                value={formData.youtubeId || ''}
                onChange={handleInputChange}
                className="w-full bg-background border border-gray-700 rounded-lg p-3 pl-10 text-white focus:border-primary focus:outline-none font-mono text-sm"
                placeholder="e.g. dQw4w9WgXcQ"
              />
              <Youtube size={16} className="absolute left-3 top-3.5 text-gray-500" />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Required for the audio player. Automatically filled when selecting from search.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Download Link</label>
            <input
              type="url"
              name="downloadLink"
              value={formData.downloadLink}
              onChange={handleInputChange}
              required
              className="w-full bg-background border border-gray-700 rounded-lg p-3 text-white focus:border-primary focus:outline-none"
              placeholder="https://mediafire.com/file/..."
            />
          </div>

          <div className="h-px bg-gray-800 my-4"></div>
          <h3 className="text-lg font-semibold text-primary">Monetization (Adsterra)</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Smart Link 1</label>
              <input
                type="url"
                name="adLink1"
                value={formData.adLink1}
                onChange={handleInputChange}
                required
                className="w-full bg-background border border-gray-700 rounded-lg p-3 text-white focus:border-primary focus:outline-none"
              />
            </div>
             <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Smart Link 2</label>
              <input
                type="url"
                name="adLink2"
                value={formData.adLink2}
                onChange={handleInputChange}
                required
                className="w-full bg-background border border-gray-700 rounded-lg p-3 text-white focus:border-primary focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 mt-8 transition-opacity"
          >
            <Plus size={20} />
            Publish Beat
          </button>
        </form>
      </div>
    </div>
  );
};

export default Admin;