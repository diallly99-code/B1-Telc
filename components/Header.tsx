
import React from 'react';
import UserIcon from './icons/UserIcon';
import HomeIcon from './icons/HomeIcon';

interface HeaderProps {
    onHomeClick: () => void;
    onProfileClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onHomeClick, onProfileClick }) => {
  return (
    <header className="bg-white dark:bg-slate-800 shadow-md">
      <div className="container mx-auto px-4 md:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
            <button onClick={onHomeClick} className="text-slate-600 dark:text-slate-300 hover:text-blue-500 dark:hover:text-blue-400 transition-colors" title="Accueil">
                <HomeIcon className="w-6 h-6" />
            </button>
            <button onClick={onProfileClick} className="text-slate-600 dark:text-slate-300 hover:text-purple-500 dark:hover:text-purple-400 transition-colors" title="Mon Profil">
                <UserIcon className="w-6 h-6" />
            </button>
        </div>
        <h1 
            className="text-xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-600 dark:from-blue-400 dark:to-purple-500 cursor-pointer text-center flex-1 mx-4"
            onClick={onHomeClick}
        >
          Préparation interactive – telc Deutsch B1
        </h1>
      </div>
    </header>
  );
};

export default Header;
