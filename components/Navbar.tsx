import React from 'react';
import { Link } from 'react-router-dom';
import { Music, Lock } from 'lucide-react';

const Navbar: React.FC = () => {
  return (
    <nav className="bg-surface border-b border-gray-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-secondary flex items-center justify-center group-hover:opacity-90 transition-opacity">
              <Music className="text-white w-5 h-5" />
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
              NeonFlow
            </span>
          </Link>
          
          <div className="flex items-center gap-4">
             <Link 
              to="/admin" 
              className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
            >
              <Lock className="w-4 h-4" />
              <span>Admin</span>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;