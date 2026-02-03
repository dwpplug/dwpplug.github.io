import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import BeatDetail from './pages/BeatDetail';
import Admin from './pages/Admin';
import Player from './components/Player';
import { PlayerProvider } from './contexts/PlayerContext';

const App: React.FC = () => {
  return (
    <PlayerProvider>
      <Router>
        <div className="min-h-screen bg-background text-white font-sans selection:bg-primary selection:text-white pb-24">
          <Navbar />
          <main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/beat/:id" element={<BeatDetail />} />
              <Route path="/admin" element={<Admin />} />
            </Routes>
          </main>
          
          <footer className="py-8 text-center text-gray-600 text-sm border-t border-gray-900 mt-auto mb-24">
            <p>© {new Date().getFullYear()} NeonFlow Beats. All rights reserved.</p>
          </footer>
          
          <Player />
        </div>
      </Router>
    </PlayerProvider>
  );
};

export default App;
