
import React from 'react';
import { ModuleType } from '../types';
import { MODULES } from '../constants';

interface NavigationProps {
  onModuleSelect: (module: ModuleType) => void;
}

const Navigation: React.FC<NavigationProps> = ({ onModuleSelect }) => {
    const colors: { [key: string]: { bg: string, text: string, hoverBg: string } } = {
        blue: { bg: 'bg-blue-500', text: 'text-white', hoverBg: 'hover:bg-blue-600' },
        green: { bg: 'bg-green-500', text: 'text-white', hoverBg: 'hover:bg-green-600' },
        purple: { bg: 'bg-purple-500', text: 'text-white', hoverBg: 'hover:bg-purple-600' },
        orange: { bg: 'bg-orange-500', text: 'text-white', hoverBg: 'hover:bg-orange-600' },
        red: { bg: 'bg-red-500', text: 'text-white', hoverBg: 'hover:bg-red-600' },
        yellow: { bg: 'bg-yellow-500', text: 'text-black', hoverBg: 'hover:bg-yellow-600' },
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {MODULES.map((module) => {
            const Icon = module.icon;
            const color = colors[module.color] || colors.blue;
            return (
            <button
                key={module.id}
                onClick={() => onModuleSelect(module.id)}
                className={`flex flex-col items-center justify-center p-8 rounded-lg shadow-lg transform hover:-translate-y-1 transition-all duration-300 ${color.bg} ${color.text} ${color.hoverBg}`}
            >
                <Icon className="w-16 h-16 mb-4" />
                <span className="text-2xl font-semibold">{module.title}</span>
                <span className="text-sm mt-2 text-center font-light">{module.description}</span>
            </button>
            );
        })}
        </div>
    );
};

export default Navigation;