import React from 'react';
import { Film, Tv, Settings, History, Heart, HelpCircle, Info, Bell } from 'lucide-react';

interface SideNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  isLoggedIn: boolean;
  isOpen: boolean;
  onClose: () => void;
}

const SideNavigation: React.FC<SideNavigationProps> = ({ 
  activeTab, 
  onTabChange, 
  isLoggedIn,
  isOpen,
  onClose
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
    { id: 'settings', name: 'Settings', icon: Settings },
    { id: 'support', name: 'Support', icon: HelpCircle },
    { id: 'about', name: 'About', icon: Info }
  ];

  const handleTabClick = (tabId: string) => {
    onTabChange(tabId);
    onClose();
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Side Navigation */}
      <div className={`fixed left-0 top-0 h-full w-64 bg-gray-900/95 backdrop-blur-sm border-r border-gray-700 z-50 transform transition-transform duration-300 lg:relative lg:translate-x-0 lg:w-16 xl:w-64 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="p-4">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-8 px-2">
            <div className="w-8 h-8 bg-yellow-400 rounded-lg flex items-center justify-center">
              <Film className="w-5 h-5 text-black" />
            </div>
            <span className="text-xl font-bold text-yellow-400 glow-text lg:hidden xl:block">
              DSH
            </span>
          </div>

          {/* Navigation Items */}
          <nav className="space-y-2">
            {tabs.map((tab) => {
              const IconComponent = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabClick(tab.id)}
                  className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-300 group ${
                    isActive
                      ? 'text-yellow-400 bg-yellow-400/10 border border-yellow-400/20'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                  }`}
                  title={tab.name}
                >
                  <IconComponent className={`w-6 h-6 ${isActive ? 'text-yellow-400' : ''} group-hover:scale-110 transition-transform`} />
                  <span className="font-medium lg:hidden xl:block">{tab.name}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </>
  );
};

export default SideNavigation;