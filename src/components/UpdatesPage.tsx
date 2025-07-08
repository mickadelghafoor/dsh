import React, { useState, useRef } from 'react';
import { ArrowLeft, Upload, Play, Calendar, Eye, Trash2, Plus, Video, FileText } from 'lucide-react';

interface UpdatesPageProps {
  onBack: () => void;
}

interface UpdateItem {
  id: string;
  type: 'video' | 'text';
  title: string;
  content: string;
  thumbnail?: string;
  videoUrl?: string;
  uploadDate: string;
  views: number;
}

const UpdatesPage: React.FC<UpdatesPageProps> = ({ onBack }) => {
  const [updates, setUpdates] = useState<UpdateItem[]>([]);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [uploadType, setUploadType] = useState<'video' | 'text'>('text');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedVideo, setSelectedVideo] = useState<File | null>(null);
  const [selectedThumbnail, setSelectedThumbnail] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedUpdate, setSelectedUpdate] = useState<UpdateItem | null>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);

  // Load updates from localStorage on component mount
  React.useEffect(() => {
    const savedUpdates = localStorage.getItem('deltasilicon_updates');
    if (savedUpdates) {
      setUpdates(JSON.parse(savedUpdates));
    } else {
      // Add some default updates
      const defaultUpdates: UpdateItem[] = [
        {
          id: '1',
          type: 'text',
          title: 'Welcome to DSH Updates!',
          content: 'Stay tuned for the latest news, features, and content updates from DeltaSilicon.Hub. We\'ll be sharing exciting developments, new movie additions, and platform improvements here.',
          uploadDate: new Date().toISOString(),
          views: 0
        },
        {
          id: '2',
          type: 'text',
          title: 'New Streaming Services Added',
          content: 'We\'ve added support for multiple streaming services including VidFast, VidLink, and Videasy. You can now switch between different services in Settings to find the best streaming quality for your region.',
          uploadDate: new Date(Date.now() - 86400000).toISOString(),
          views: 0
        }
      ];
      setUpdates(defaultUpdates);
      localStorage.setItem('deltasilicon_updates', JSON.stringify(defaultUpdates));
    }
  }, []);

  // Save updates to localStorage
  const saveUpdates = (newUpdates: UpdateItem[]) => {
    localStorage.setItem('deltasilicon_updates', JSON.stringify(newUpdates));
    setUpdates(newUpdates);
  };

  const handleVideoSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('video/')) {
      setSelectedVideo(file);
    } else {
      alert('Please select a valid video file');
    }
  };

  const handleThumbnailSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedThumbnail(file);
    } else {
      alert('Please select a valid image file');
    }
  };

  const handleUpload = () => {
    if (!title.trim() || !content.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    if (uploadType === 'video' && !selectedVideo) {
      alert('Please select a video file');
      return;
    }

    // Simulate upload progress
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          
          // Create update item
          const newUpdate: UpdateItem = {
            id: Date.now().toString(),
            type: uploadType,
            title: title.trim(),
            content: content.trim(),
            uploadDate: new Date().toISOString(),
            views: 0,
            ...(uploadType === 'video' && selectedVideo && {
              videoUrl: URL.createObjectURL(selectedVideo),
              thumbnail: selectedThumbnail ? URL.createObjectURL(selectedThumbnail) : undefined
            })
          };

          const updatedUpdates = [newUpdate, ...updates];
          saveUpdates(updatedUpdates);
          
          // Reset form
          setTitle('');
          setContent('');
          setSelectedVideo(null);
          setSelectedThumbnail(null);
          setUploadProgress(0);
          setShowUploadForm(false);
          
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const deleteUpdate = (updateId: string) => {
    if (confirm('Are you sure you want to delete this update?')) {
      const updatedUpdates = updates.filter(update => update.id !== updateId);
      saveUpdates(updatedUpdates);
    }
  };

  const viewUpdate = (update: UpdateItem) => {
    // Increment view count
    const updatedUpdates = updates.map(u => 
      u.id === update.id ? { ...u, views: u.views + 1 } : u
    );
    saveUpdates(updatedUpdates);
    
    if (update.type === 'video') {
      setSelectedUpdate(update);
    }
  };

  const closeVideoPlayer = () => {
    setSelectedUpdate(null);
  };

  if (selectedUpdate && selectedUpdate.type === 'video') {
    return (
      <div className="fixed inset-0 bg-black z-50">
        <button
          onClick={closeVideoPlayer}
          className="absolute top-4 right-4 z-10 p-2 bg-black/70 hover:bg-black/90 rounded-lg transition-colors duration-300 backdrop-blur-sm"
        >
          <ArrowLeft className="w-6 h-6 text-white" />
        </button>

        <div className="absolute top-4 left-4 z-10 bg-black/70 backdrop-blur-sm rounded-lg p-3 max-w-md">
          <h2 className="text-white font-semibold text-lg">{selectedUpdate.title}</h2>
          <p className="text-gray-300 text-sm">{selectedUpdate.content}</p>
        </div>

        {selectedUpdate.videoUrl && (
          <video
            src={selectedUpdate.videoUrl}
            className="w-full h-full object-contain"
            controls
            autoPlay
          />
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-black/95 backdrop-blur-sm border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center">
            <button
              onClick={onBack}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors duration-300 mr-4"
            >
              <ArrowLeft className="w-6 h-6 text-yellow-400" />
            </button>
            <h1 className="text-xl font-bold text-white">Updates</h1>
          </div>
          
          <button
            onClick={() => setShowUploadForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-yellow-400 text-black font-semibold rounded-lg hover:bg-yellow-300 transition-all duration-300"
          >
            <Plus className="w-4 h-4" />
            Add Update
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="text-white">Latest</span>{' '}
            <span className="text-yellow-400 glow-text">Updates</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Stay informed with the latest news, features, and content updates from DeltaSilicon.Hub.
          </p>
        </div>

        {/* Upload Form Modal */}
        {showUploadForm && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-white">Add New Update</h3>
                  <button
                    onClick={() => setShowUploadForm(false)}
                    className="p-2 hover:bg-gray-800 rounded-lg transition-colors duration-300"
                  >
                    <ArrowLeft className="w-5 h-5 text-gray-400" />
                  </button>
                </div>

                {/* Upload Type Selection */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-300 mb-3">Update Type</label>
                  <div className="flex gap-4">
                    <button
                      onClick={() => setUploadType('text')}
                      className={`flex items-center gap-2 px-4 py-3 rounded-lg border transition-all duration-300 ${
                        uploadType === 'text'
                          ? 'bg-yellow-400 text-black border-yellow-400'
                          : 'bg-gray-800 text-gray-300 border-gray-600 hover:border-gray-500'
                      }`}
                    >
                      <FileText className="w-5 h-5" />
                      Text Update
                    </button>
                    <button
                      onClick={() => setUploadType('video')}
                      className={`flex items-center gap-2 px-4 py-3 rounded-lg border transition-all duration-300 ${
                        uploadType === 'video'
                          ? 'bg-yellow-400 text-black border-yellow-400'
                          : 'bg-gray-800 text-gray-300 border-gray-600 hover:border-gray-500'
                      }`}
                    >
                      <Video className="w-5 h-5" />
                      Video Update
                    </button>
                  </div>
                </div>

                {/* Title Input */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-300 mb-2">Title *</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter update title..."
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-yellow-400/50 focus:outline-none"
                  />
                </div>

                {/* Content Input */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-300 mb-2">Content *</label>
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Enter update content..."
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-yellow-400/50 focus:outline-none resize-none"
                    rows={4}
                  />
                </div>

                {/* Video Upload (if video type) */}
                {uploadType === 'video' && (
                  <div className="mb-6 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Video File *</label>
                      <input
                        ref={videoInputRef}
                        type="file"
                        accept="video/*"
                        onChange={handleVideoSelect}
                        className="hidden"
                      />
                      <button
                        onClick={() => videoInputRef.current?.click()}
                        className="w-full p-4 border-2 border-dashed border-gray-600 rounded-lg hover:border-yellow-400/50 transition-colors duration-300 flex flex-col items-center gap-2"
                      >
                        <Upload className="w-8 h-8 text-gray-400" />
                        <span className="text-gray-400">Click to select video file</span>
                      </button>
                      {selectedVideo && (
                        <div className="mt-2 bg-gray-800/50 p-3 rounded-lg">
                          <p className="text-white text-sm">{selectedVideo.name}</p>
                          <p className="text-gray-400 text-xs">{(selectedVideo.size / 1024 / 1024).toFixed(2)} MB</p>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Thumbnail (Optional)</label>
                      <input
                        ref={thumbnailInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleThumbnailSelect}
                        className="hidden"
                      />
                      <button
                        onClick={() => thumbnailInputRef.current?.click()}
                        className="w-full p-4 border-2 border-dashed border-gray-600 rounded-lg hover:border-yellow-400/50 transition-colors duration-300 flex flex-col items-center gap-2"
                      >
                        <Upload className="w-6 h-6 text-gray-400" />
                        <span className="text-gray-400 text-sm">Click to select thumbnail</span>
                      </button>
                      {selectedThumbnail && (
                        <div className="mt-2 bg-gray-800/50 p-3 rounded-lg">
                          <p className="text-white text-sm">{selectedThumbnail.name}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Upload Progress */}
                {uploadProgress > 0 && uploadProgress < 100 && (
                  <div className="mb-4">
                    <div className="bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                    <p className="text-sm text-gray-400 mt-1">Uploading... {uploadProgress}%</p>
                  </div>
                )}

                {/* Upload Button */}
                <button
                  onClick={handleUpload}
                  disabled={uploadProgress > 0 && uploadProgress < 100}
                  className="w-full px-6 py-3 bg-yellow-400 text-black font-semibold rounded-lg hover:bg-yellow-300 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploadProgress > 0 && uploadProgress < 100 ? 'Uploading...' : 'Publish Update'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Updates List */}
        <div className="space-y-6">
          {updates.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📢</div>
              <h3 className="text-2xl font-semibold text-white mb-2">No updates yet</h3>
              <p className="text-gray-400">Be the first to share an update with the community!</p>
            </div>
          ) : (
            updates.map((update) => (
              <div key={update.id} className="bg-gray-900/50 border border-gray-800 rounded-xl overflow-hidden hover:border-yellow-400/50 transition-all duration-300">
                {update.type === 'video' && update.thumbnail && (
                  <div className="relative aspect-video cursor-pointer" onClick={() => viewUpdate(update)}>
                    <img
                      src={update.thumbnail}
                      alt={update.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <div className="p-3 bg-yellow-400/90 text-black rounded-full hover:bg-yellow-400 transition-colors duration-300">
                        <Play className="w-6 h-6" />
                      </div>
                    </div>
                  </div>
                )}

                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {update.type === 'video' ? (
                          <Video className="w-5 h-5 text-yellow-400" />
                        ) : (
                          <FileText className="w-5 h-5 text-yellow-400" />
                        )}
                        <span className="text-xs text-yellow-400 font-semibold uppercase">
                          {update.type} Update
                        </span>
                      </div>
                      <h3 className="text-xl font-semibold text-white mb-2">{update.title}</h3>
                      <p className="text-gray-300 leading-relaxed mb-4">{update.content}</p>
                      
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span>{new Date(update.uploadDate).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Eye className="w-4 h-4" />
                            <span>{update.views} views</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => deleteUpdate(update.id)}
                      className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors duration-300"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {update.type === 'video' && (
                    <button
                      onClick={() => viewUpdate(update)}
                      className="w-full px-4 py-2 bg-yellow-400 text-black font-semibold rounded-lg hover:bg-yellow-300 transition-all duration-300 flex items-center justify-center gap-2"
                    >
                      <Play className="w-4 h-4" />
                      Watch Video
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default UpdatesPage;