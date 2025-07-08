import React from 'react';
import { Film, Tv, Settings, History, Heart, Bell } from 'lucide-react';

interface BottomNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  isLoggedIn: boolean;
  isVisible: boolean;
}

const BottomNavigation: React.FC<BottomNavigationProps> = ({ 
  activeTab, 
  onTabChange, 
  isLoggedIn,
  isVisible
}) => {
  const tabs = [
    { id: 'movies', name: 'Movies', icon: Film },
    { id: 'series', name: 'Series', icon: Tv },
    { id: 'anime', name: 'Anime', icon: Tv },
    { id: 'updates', name: 'Updates', icon: Bell },
    ...(isLoggedIn ? [
      { id: 'history', name: 'History', icon: History },
      { id: 'favorites', name: 'Favorites', icon: Heart }
    ] : []),
    { id: 'settings', name: 'Settings', icon: Settings }
  ];

  return (
    <div className={`fixed bottom-0 left-0 right-0 bg-gray-900/95 backdrop-blur-sm border-t border-gray-700 z-30 transition-transform duration-300 ${
      isVisible ? 'translate-y-0' : 'translate-y-full'
    }`}>
      <div className="max-w-7xl mx-auto px-2">
        <div className="flex justify-around items-center py-2">
          {tabs.map((tab) => {
            const IconComponent = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex flex-col items-center gap-1 px-2 py-2 rounded-lg transition-all duration-300 ${
                  isActive
                    ? 'text-yellow-400 bg-yellow-400/10'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                }`}
              >
                <IconComponent className={`w-5 h-5 ${isActive ? 'text-yellow-400' : ''}`} />
                <span className="text-xs font-medium">{tab.name}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default BottomNavigation;