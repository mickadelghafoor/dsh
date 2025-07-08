import React, { useState, useEffect } from 'react';
import { X, Settings, User, Trash2, Download, Bell, Monitor, Globe, Palette, Play } from 'lucide-react';
import { UserService, UserSettings } from '../services/userService';
import { StreamingServiceManager } from '../services/streamingService';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: any;
  onLogout: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, currentUser, onLogout }) => {
  const [settings, setSettings] = useState<UserSettings>(UserService.getSettings());
  const [activeTab, setActiveTab] = useState<'general' | 'account' | 'data'>('general');

  useEffect(() => {
    if (isOpen) {
      setSettings(UserService.getSettings());
    }
  }, [isOpen]);

  const handleSettingChange = (key: keyof UserSettings, value: any) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    UserService.updateSettings({ [key]: value });
    
    // Handle streaming service change
    if (key === 'streamingService') {
      StreamingServiceManager.setActiveService(value);
    }
  };

  const handleClearHistory = () => {
    if (confirm('Are you sure you want to clear your watch history? This action cannot be undone.')) {
      UserService.clearHistory();
      alert('Watch history cleared successfully!');
    }
  };

  const handleClearFavorites = () => {
    if (confirm('Are you sure you want to clear all your favorites? This action cannot be undone.')) {
      const favorites = UserService.getFavorites();
      favorites.forEach(fav => UserService.removeFromFavorites(fav.movieId));
      alert('Favorites cleared successfully!');
    }
  };

  const handleResetSettings = () => {
    if (confirm('Are you sure you want to reset all settings to default?')) {
      UserService.resetSettings();
      StreamingServiceManager.setActiveService('vidsrc');
      setSettings(UserService.getSettings());
      alert('Settings reset successfully!');
    }
  };

  const handleLogout = () => {
    if (confirm('Are you sure you want to logout?')) {
      onLogout();
      onClose();
    }
  };

  if (!isOpen) return null;

  const tabs = [
    { id: 'general', name: 'General', icon: Settings },
    { id: 'account', name: 'Account', icon: User },
    { id: 'data', name: 'Data', icon: Download }
  ];

  const streamingServices = StreamingServiceManager.getServices();

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-400/10 rounded-lg">
              <Settings className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-400" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white">Settings</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors duration-300"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400" />
          </button>
        </div>

        <div className="flex flex-col sm:flex-row h-[calc(90vh-120px)]">
          {/* Sidebar */}
          <div className="w-full sm:w-48 md:w-64 border-b sm:border-b-0 sm:border-r border-gray-700 p-4">
            <nav className="flex sm:flex-col gap-2">
              {tabs.map((tab) => {
                const IconComponent = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-3 px-3 py-2 sm:py-3 rounded-lg transition-all duration-300 text-sm sm:text-base ${
                      activeTab === tab.id
                        ? 'bg-yellow-400 text-black font-semibold'
                        : 'text-gray-300 hover:bg-gray-800'
                    }`}
                  >
                    <IconComponent className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="hidden sm:block">{tab.name}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1 p-4 sm:p-6 overflow-y-auto">
            {activeTab === 'general' && (
              <div className="space-y-6 sm:space-y-8">
                <div>
                  <h3 className="text-lg sm:text-xl font-semibold text-white mb-4 flex items-center gap-2">
                    <Palette className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400" />
                    Appearance
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Theme</label>
                      <select
                        value={settings.theme}
                        onChange={(e) => handleSettingChange('theme', e.target.value)}
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-yellow-400/50 focus:outline-none text-sm"
                      >
                        <option value="dark">Dark</option>
                        <option value="light">Light</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg sm:text-xl font-semibold text-white mb-4 flex items-center gap-2">
                    <Play className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400" />
                    Streaming Service
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Default Service</label>
                      <select
                        value={settings.streamingService}
                        onChange={(e) => handleSettingChange('streamingService', e.target.value)}
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-yellow-400/50 focus:outline-none text-sm"
                      >
                        {streamingServices.map((service) => (
                          <option key={service.id} value={service.id}>
                            {service.name}
                          </option>
                        ))}
                      </select>
                      <p className="text-xs text-gray-500 mt-1">
                        Choose your preferred streaming service for watching content
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg sm:text-xl font-semibold text-white mb-4 flex items-center gap-2">
                    <Monitor className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400" />
                    Playback
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium text-gray-300">Autoplay</label>
                        <p className="text-xs text-gray-500">Automatically start playing videos</p>
                      </div>
                      <button
                        onClick={() => handleSettingChange('autoplay', !settings.autoplay)}
                        className={`relative inline-flex h-5 w-9 sm:h-6 sm:w-11 items-center rounded-full transition-colors ${
                          settings.autoplay ? 'bg-yellow-400' : 'bg-gray-600'
                        }`}
                      >
                        <span
                          className={`inline-block h-3 w-3 sm:h-4 sm:w-4 transform rounded-full bg-white transition-transform ${
                            settings.autoplay ? 'translate-x-5 sm:translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Default Quality</label>
                      <select
                        value={settings.quality}
                        onChange={(e) => handleSettingChange('quality', e.target.value)}
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-yellow-400/50 focus:outline-none text-sm"
                      >
                        <option value="auto">Auto</option>
                        <option value="HD">HD (720p)</option>
                        <option value="4K">4K (2160p)</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg sm:text-xl font-semibold text-white mb-4 flex items-center gap-2">
                    <Globe className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400" />
                    Language & Region
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Language</label>
                      <select
                        value={settings.language}
                        onChange={(e) => handleSettingChange('language', e.target.value)}
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-yellow-400/50 focus:outline-none text-sm"
                      >
                        <option value="en">English</option>
                        <option value="es">Español</option>
                        <option value="fr">Français</option>
                        <option value="de">Deutsch</option>
                        <option value="ja">日本語</option>
                        <option value="ko">한국어</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg sm:text-xl font-semibold text-white mb-4 flex items-center gap-2">
                    <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400" />
                    Notifications
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium text-gray-300">Enable Notifications</label>
                        <p className="text-xs text-gray-500">Get notified about new releases and updates</p>
                      </div>
                      <button
                        onClick={() => handleSettingChange('notifications', !settings.notifications)}
                        className={`relative inline-flex h-5 w-9 sm:h-6 sm:w-11 items-center rounded-full transition-colors ${
                          settings.notifications ? 'bg-yellow-400' : 'bg-gray-600'
                        }`}
                      >
                        <span
                          className={`inline-block h-3 w-3 sm:h-4 sm:w-4 transform rounded-full bg-white transition-transform ${
                            settings.notifications ? 'translate-x-5 sm:translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'account' && (
              <div className="space-y-6 sm:space-y-8">
                <div>
                  <h3 className="text-lg sm:text-xl font-semibold text-white mb-4">Account Information</h3>
                  <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 sm:p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 bg-yellow-400 rounded-full flex items-center justify-center">
                        <User className="w-6 h-6 sm:w-8 sm:h-8 text-black" />
                      </div>
                      <div>
                        <h4 className="text-base sm:text-lg font-semibold text-white">{currentUser?.name}</h4>
                        <p className="text-xs sm:text-sm text-gray-400">
                          Member since {new Date(currentUser?.loginDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
                      <div className="text-center p-3 sm:p-4 bg-gray-900/50 rounded-lg">
                        <div className="text-xl sm:text-2xl font-bold text-yellow-400">
                          {UserService.getWatchHistory().length}
                        </div>
                        <div className="text-xs sm:text-sm text-gray-400">Items Watched</div>
                      </div>
                      <div className="text-center p-3 sm:p-4 bg-gray-900/50 rounded-lg">
                        <div className="text-xl sm:text-2xl font-bold text-yellow-400">
                          {UserService.getFavorites().length}
                        </div>
                        <div className="text-xs sm:text-sm text-gray-400">Favorites</div>
                      </div>
                      <div className="text-center p-3 sm:p-4 bg-gray-900/50 rounded-lg">
                        <div className="text-xl sm:text-2xl font-bold text-yellow-400">
                          {Math.floor((Date.now() - new Date(currentUser?.loginDate).getTime()) / (1000 * 60 * 60 * 24))}
                        </div>
                        <div className="text-xs sm:text-sm text-gray-400">Days Active</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg sm:text-xl font-semibold text-white mb-4">Account Actions</h3>
                  <div className="space-y-4">
                    <button
                      onClick={handleLogout}
                      className="w-full px-4 py-2 sm:px-6 sm:py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors duration-300 flex items-center justify-center gap-2 text-sm sm:text-base"
                    >
                      <User className="w-4 h-4 sm:w-5 sm:h-5" />
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'data' && (
              <div className="space-y-6 sm:space-y-8">
                <div>
                  <h3 className="text-lg sm:text-xl font-semibold text-white mb-4">Data Management</h3>
                  <p className="text-gray-400 mb-6 text-sm">
                    Manage your personal data stored locally on your device.
                  </p>
                </div>

                <div className="space-y-4 sm:space-y-6">
                  <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 sm:p-6">
                    <h4 className="text-base sm:text-lg font-semibold text-white mb-2">Watch History</h4>
                    <p className="text-xs sm:text-sm text-gray-400 mb-4">
                      Clear your entire watch history. This action cannot be undone.
                    </p>
                    <button
                      onClick={handleClearHistory}
                      className="px-3 py-2 sm:px-4 sm:py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors duration-300 flex items-center gap-2 text-sm"
                    >
                      <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                      Clear History
                    </button>
                  </div>

                  <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 sm:p-6">
                    <h4 className="text-base sm:text-lg font-semibold text-white mb-2">Favorites</h4>
                    <p className="text-xs sm:text-sm text-gray-400 mb-4">
                      Remove all items from your favorites list.
                    </p>
                    <button
                      onClick={handleClearFavorites}
                      className="px-3 py-2 sm:px-4 sm:py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors duration-300 flex items-center gap-2 text-sm"
                    >
                      <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                      Clear Favorites
                    </button>
                  </div>

                  <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 sm:p-6">
                    <h4 className="text-base sm:text-lg font-semibold text-white mb-2">Settings</h4>
                    <p className="text-xs sm:text-sm text-gray-400 mb-4">
                      Reset all settings to their default values.
                    </p>
                    <button
                      onClick={handleResetSettings}
                      className="px-3 py-2 sm:px-4 sm:py-2 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-lg transition-colors duration-300 flex items-center gap-2 text-sm"
                    >
                      <Settings className="w-3 h-3 sm:w-4 sm:h-4" />
                      Reset Settings
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;