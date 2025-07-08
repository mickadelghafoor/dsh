import React, { useEffect, useState } from 'react';
import { X, Settings } from 'lucide-react';
import { Movie } from '../types';
import { UserService } from '../services/userService';
import { StreamingServiceManager } from '../services/streamingService';

interface VideoPlayerProps {
  movie: Movie;
  onClose: () => void;
  contentType?: 'movie' | 'series' | 'anime';
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ movie, onClose, contentType = 'movie' }) => {
  const [showSettings, setShowSettings] = useState(false);
  const [activeService, setActiveService] = useState(StreamingServiceManager.getActiveService());

  // Get the streaming URL
  const getStreamingUrl = () => {
    if (contentType === 'series') {
      // For series, use TV show endpoint
      return `${activeService.baseUrl}/embed/tv/${movie.id}`;
    } else {
      // For movies and anime, use movie endpoint
      return StreamingServiceManager.getEmbedUrl(movie.id);
    }
  };

  // Add to watch history when component mounts
  useEffect(() => {
    if (UserService.isLoggedIn()) {
      UserService.addToHistory(movie, contentType);
    }
  }, [movie, contentType]);

  const handleServiceChange = (serviceId: string) => {
    StreamingServiceManager.setActiveService(serviceId);
    setActiveService(StreamingServiceManager.getActiveService());
    setShowSettings(false);
  };

  const services = StreamingServiceManager.getServices();

  return (
    <div className="fixed inset-0 bg-black z-50">
      {/* Controls */}
      <div className="absolute top-4 left-4 right-4 z-10 flex items-center justify-between">
        <button
          onClick={onClose}
          className="p-3 bg-black/70 hover:bg-black/90 rounded-lg transition-colors duration-300 backdrop-blur-sm"
        >
          <X className="w-6 h-6 text-white" />
        </button>
        
        <div className="relative">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-3 bg-black/70 hover:bg-black/90 rounded-lg transition-colors duration-300 backdrop-blur-sm"
          >
            <Settings className="w-6 h-6 text-white" />
          </button>

          {/* Settings Dropdown */}
          {showSettings && (
            <div className="absolute top-full right-0 mt-2 bg-gray-900/95 backdrop-blur-sm border border-gray-700 rounded-lg p-4 min-w-48">
              <h3 className="text-white font-semibold mb-3">Streaming Service</h3>
              <div className="space-y-2">
                {services.map((service) => (
                  <button
                    key={service.id}
                    onClick={() => handleServiceChange(service.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors duration-300 ${
                      service.isActive
                        ? 'bg-yellow-400 text-black font-semibold'
                        : 'text-gray-300 hover:bg-gray-800'
                    }`}
                  >
                    {service.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Video Iframe without sandbox */}
      <iframe
        src={getStreamingUrl()}
        className="w-full h-full"
        allowFullScreen
        frameBorder="0"
        title={`Watch ${movie.title || movie.name}`}
        allow="autoplay; encrypted-media; fullscreen"
        style={{ 
          pointerEvents: 'auto',
          userSelect: 'none'
        }}
      />
    </div>
  );
};

export default VideoPlayer;