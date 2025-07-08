import React, { useState, useEffect } from 'react';
import { Search, Filter, Grid, List, Play, Star, Calendar, Menu, X, Settings, User, LogOut, Plus, Film, Tv } from 'lucide-react';
import { tmdbApi, Movie } from '../services/tmdbApi';
import { SeriesService } from '../services/seriesService';
import { AnimeService } from '../services/animeService';
import { UserService } from '../services/userService';
import { RecommendationService } from '../services/recommendationService';
import VideoPlayer from './VideoPlayer';
import SeriesPlayer from './SeriesPlayer';
import SettingsModal from './SettingsModal';
import LoginModal from './LoginModal';
import MovieInfoPage from './MovieInfoPage';
import ActorMoviesPage from './ActorMoviesPage';
import SupportPage from './SupportPage';
import CompanyVideosPage from './CompanyVideosPage';
import VoiceUploadPage from './VoiceUploadPage';
import UpdatesPage from './UpdatesPage';

interface DashboardProps {
  onBack: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onBack }) => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('trending');
  const [selectedContentType, setSelectedContentType] = useState<'movies' | 'series' | 'anime'>('movies');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [loading, setLoading] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [selectedActorId, setSelectedActorId] = useState<number | null>(null);
  const [showPlayer, setShowPlayer] = useState(false);
  const [showSeriesPlayer, setShowSeriesPlayer] = useState(false);
  const [showMovieInfo, setShowMovieInfo] = useState(false);
  const [showActorMovies, setShowActorMovies] = useState(false);
  const [showMobileNav, setShowMobileNav] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showSupport, setShowSupport] = useState(false);
  const [showCompanyVideos, setShowCompanyVideos] = useState(false);
  const [showVoiceUpload, setShowVoiceUpload] = useState(false);
  const [showUpdates, setShowUpdates] = useState(false);
  const [currentUser, setCurrentUser] = useState(UserService.getCurrentUser());
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [activeTab, setActiveTab] = useState('movies');

  const categories = [
    { id: 'recommended', name: 'For You' },
    { id: 'trending', name: 'Trending' },
    { id: 'popular', name: 'Popular' },
    { id: 'top_rated', name: 'Top Rated' },
    { id: 'now_playing', name: selectedContentType === 'series' ? 'On Air' : 'Now Playing' }
  ];

  const navigationItems = [
    { id: 'movies', name: 'Movies', icon: Film },
    { id: 'series', name: 'Series', icon: Tv },
    { id: 'anime', name: 'Anime', icon: Tv },
    { id: 'updates', name: 'Updates', icon: Plus },
    ...(currentUser ? [
      { id: 'history', name: 'History', icon: Calendar },
      { id: 'favorites', name: 'Favorites', icon: Star }
    ] : []),
    { id: 'settings', name: 'Settings', icon: Settings }
  ];

  // Check for secret access
  useEffect(() => {
    if (searchQuery.toLowerCase() === 'mickkoci') {
      setShowVoiceUpload(true);
      setSearchQuery('');
    }
  }, [searchQuery]);

  const fetchMovies = async (category: string, contentType: 'movies' | 'series' | 'anime', query?: string, page: number = 1, append: boolean = false) => {
    if (!append) setLoading(true);
    
    try {
      let response;
      
      if (query) {
        if (contentType === 'anime') {
          response = await AnimeService.searchAnime(query, page);
        } else if (contentType === 'series') {
          response = await SeriesService.searchSeries(query, page);
        } else {
          response = await tmdbApi.searchMovies(query, page);
        }
        
        // Update search preferences
        if (currentUser && response.results.length > 0) {
          response.results.forEach((item: any) => {
            RecommendationService.updatePreferences(item, 'search', 0.5);
          });
        }
      } else {
        switch (category) {
          case 'recommended':
            // Get personalized recommendations
            if (currentUser) {
              if (contentType === 'anime') {
                const animeResponse = await AnimeService.getPopularAnime();
                const recommended = await RecommendationService.getPersonalizedRecommendations(animeResponse.results);
                response = { ...animeResponse, results: recommended };
              } else if (contentType === 'series') {
                const seriesResponse = await SeriesService.getTrendingSeries();
                const recommended = await RecommendationService.getPersonalizedRecommendations(seriesResponse.results);
                response = { ...seriesResponse, results: recommended };
              } else {
                const moviesResponse = await tmdbApi.getTrending();
                const recommended = await RecommendationService.getPersonalizedRecommendations(moviesResponse.results);
                response = { ...moviesResponse, results: recommended };
              }
            } else {
              // Fallback to trending if not logged in
              if (contentType === 'anime') {
                response = await AnimeService.getPopularAnime();
              } else if (contentType === 'series') {
                response = await SeriesService.getTrendingSeries();
              } else {
                response = await tmdbApi.getTrending();
              }
            }
            break;
          case 'trending':
            if (contentType === 'anime') {
              response = await AnimeService.getPopularAnime();
            } else if (contentType === 'series') {
              response = await SeriesService.getTrendingSeries();
            } else {
              response = await tmdbApi.getTrending();
            }
            break;
          case 'popular':
            if (contentType === 'anime') {
              response = await AnimeService.getAnimeMovies(page);
            } else if (contentType === 'series') {
              response = await SeriesService.getPopularSeries(page);
            } else {
              response = await tmdbApi.getPopular(page);
            }
            break;
          case 'top_rated':
            if (contentType === 'series') {
              response = await SeriesService.getTopRatedSeries(page);
            } else {
              response = await tmdbApi.getTopRated(page);
            }
            break;
          case 'now_playing':
            if (contentType === 'series') {
              response = await SeriesService.getOnTheAirSeries(page);
            } else {
              response = await tmdbApi.getNowPlaying(page);
            }
            break;
          case 'history':
            const history = UserService.getWatchHistory();
            response = {
              results: history.map(item => ({
                id: item.movieId,
                title: item.title,
                poster_path: item.poster_path,
                overview: '',
                backdrop_path: '',
                release_date: '',
                vote_average: 0,
                vote_count: 0,
                genre_ids: [],
                adult: false,
                original_language: '',
                original_title: item.title,
                popularity: 0,
                video: false,
                name: item.title,
                first_air_date: ''
              })),
              total_pages: 1,
              page: 1
            };
            break;
          case 'favorites':
            const favorites = UserService.getFavorites();
            response = {
              results: favorites.map(item => ({
                id: item.movieId,
                title: item.title,
                poster_path: item.poster_path,
                overview: '',
                backdrop_path: '',
                release_date: item.release_date,
                vote_average: item.vote_average,
                vote_count: 0,
                genre_ids: [],
                adult: false,
                original_language: '',
                original_title: item.title,
                popularity: 0,
                video: false,
                name: item.title,
                first_air_date: item.release_date
              })),
              total_pages: 1,
              page: 1
            };
            break;
          default:
            if (contentType === 'anime') {
              response = await AnimeService.getPopularAnime();
            } else if (contentType === 'series') {
              response = await SeriesService.getTrendingSeries();
            } else {
              response = await tmdbApi.getTrending();
            }
        }
      }
      
      setTotalPages(response.total_pages || 1);
      setHasMore(page < (response.total_pages || 1));
      
      if (append) {
        setMovies(prev => [...prev, ...response.results]);
      } else {
        setMovies(response.results);
      }
    } catch (error) {
      console.error('Error fetching movies:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
    fetchMovies(selectedCategory, selectedContentType);
  }, [selectedCategory, selectedContentType]);

  useEffect(() => {
    if (searchQuery && searchQuery.toLowerCase() !== 'mickkoci') {
      const timeoutId = setTimeout(() => {
        setCurrentPage(1);
        fetchMovies(selectedCategory, selectedContentType, searchQuery);
      }, 500);
      return () => clearTimeout(timeoutId);
    } else if (searchQuery.toLowerCase() !== 'mickkoci') {
      setCurrentPage(1);
      fetchMovies(selectedCategory, selectedContentType);
    }
  }, [searchQuery, selectedCategory, selectedContentType]);

  const loadMore = () => {
    if (hasMore && !loading) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      fetchMovies(selectedCategory, selectedContentType, searchQuery, nextPage, true);
    }
  };

  const handleMovieClick = (movie: Movie) => {
    setSelectedMovie(movie);
    setShowMovieInfo(true);
  };

  const handleWatchMovie = (movie?: Movie) => {
    const movieToWatch = movie || selectedMovie;
    if (!movieToWatch) return;

    if (!currentUser) {
      setShowLogin(true);
      return;
    }
    
    // Update preferences based on watch action
    RecommendationService.updatePreferences(movieToWatch, 'watch', 1.0);
    
    UserService.addToHistory(movieToWatch, selectedContentType === 'series' ? 'series' : selectedContentType);
    
    setSelectedMovie(movieToWatch);
    setShowMovieInfo(false);
    setShowActorMovies(false);
    
    if (selectedContentType === 'series') {
      setShowSeriesPlayer(true);
    } else {
      setShowPlayer(true);
    }
  };

  const handleViewActor = (actorId: number) => {
    setSelectedActorId(actorId);
    setShowMovieInfo(false);
    setShowActorMovies(true);
  };

  const handleClosePlayer = () => {
    setShowPlayer(false);
    setShowSeriesPlayer(false);
    setSelectedMovie(null);
  };

  const handleCloseMovieInfo = () => {
    setShowMovieInfo(false);
    setSelectedMovie(null);
  };

  const handleCloseActorMovies = () => {
    setShowActorMovies(false);
    setSelectedActorId(null);
  };

  const handleLogin = (user: any) => {
    setCurrentUser(user);
  };

  const handleLogout = () => {
    UserService.logout();
    setCurrentUser(null);
    setSelectedCategory('trending');
  };

  const handleNavigation = (tab: string) => {
    setActiveTab(tab);
    setShowMobileNav(false);
    
    switch (tab) {
      case 'movies':
        setSelectedContentType('movies');
        setSelectedCategory(currentUser ? 'recommended' : 'trending');
        setShowSupport(false);
        setShowCompanyVideos(false);
        setShowVoiceUpload(false);
        setShowUpdates(false);
        setShowActorMovies(false);
        break;
      case 'series':
        setSelectedContentType('series');
        setSelectedCategory(currentUser ? 'recommended' : 'trending');
        setShowSupport(false);
        setShowCompanyVideos(false);
        setShowVoiceUpload(false);
        setShowUpdates(false);
        setShowActorMovies(false);
        break;
      case 'anime':
        setSelectedContentType('anime');
        setSelectedCategory(currentUser ? 'recommended' : 'trending');
        setShowSupport(false);
        setShowCompanyVideos(false);
        setShowVoiceUpload(false);
        setShowUpdates(false);
        setShowActorMovies(false);
        break;
      case 'history':
        setSelectedCategory('history');
        setShowSupport(false);
        setShowCompanyVideos(false);
        setShowVoiceUpload(false);
        setShowUpdates(false);
        setShowActorMovies(false);
        break;
      case 'favorites':
        setSelectedCategory('favorites');
        setShowSupport(false);
        setShowCompanyVideos(false);
        setShowVoiceUpload(false);
        setShowUpdates(false);
        setShowActorMovies(false);
        break;
      case 'settings':
        setShowSettings(true);
        break;
      case 'updates':
        setShowUpdates(true);
        setShowSupport(false);
        setShowCompanyVideos(false);
        setShowVoiceUpload(false);
        setShowActorMovies(false);
        break;
    }
  };

  if (showPlayer && selectedMovie) {
    return <VideoPlayer movie={selectedMovie} onClose={handleClosePlayer} contentType={selectedContentType} />;
  }

  if (showSeriesPlayer && selectedMovie) {
    return <SeriesPlayer series={selectedMovie} onClose={handleClosePlayer} />;
  }

  if (showMovieInfo && selectedMovie) {
    return (
      <MovieInfoPage 
        movie={selectedMovie} 
        onBack={handleCloseMovieInfo} 
        onWatch={() => handleWatchMovie(selectedMovie)}
        onViewActor={handleViewActor}
        contentType={selectedContentType}
      />
    );
  }

  if (showActorMovies && selectedActorId) {
    return (
      <ActorMoviesPage 
        actorId={selectedActorId}
        onBack={handleCloseActorMovies}
        onWatchMovie={handleWatchMovie}
      />
    );
  }

  if (showSupport) {
    return <SupportPage onBack={() => setShowSupport(false)} />;
  }

  if (showCompanyVideos) {
    return <CompanyVideosPage onBack={() => setShowCompanyVideos(false)} />;
  }

  if (showVoiceUpload) {
    return <VoiceUploadPage onBack={() => setShowVoiceUpload(false)} />;
  }

  if (showUpdates) {
    return <UpdatesPage onBack={() => setShowUpdates(false)} />;
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-black/95 backdrop-blur-sm border-b border-gray-800">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setShowMobileNav(true)}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors duration-300 lg:hidden"
            >
              <Menu className="w-6 h-6 text-yellow-400" />
            </button>

            {/* Desktop Close Button */}
            <button
              onClick={onBack}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors duration-300 hidden lg:block"
            >
              <X className="w-5 h-5 text-yellow-400" />
            </button>

            <div className="flex-1 max-w-md mx-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder={`Search ${selectedContentType}...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:border-yellow-400/50 focus:outline-none text-sm"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 bg-gray-900/50 border border-gray-700 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-md transition-colors duration-300 ${
                    viewMode === 'grid' ? 'bg-yellow-400 text-black' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded-md transition-colors duration-300 ${
                    viewMode === 'list' ? 'bg-yellow-400 text-black' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>

              {currentUser ? (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-300 hidden sm:block">{currentUser.name}</span>
                  <button 
                    onClick={handleLogout}
                    className="p-2 hover:bg-gray-800 rounded-lg transition-colors duration-300"
                  >
                    <LogOut className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => setShowLogin(true)}
                  className="p-2 hover:bg-gray-800 rounded-lg transition-colors duration-300"
                >
                  <User className="w-4 h-4 text-gray-400" />
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Overlay */}
      {showMobileNav && (
        <>
          <div 
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setShowMobileNav(false)}
          />
          <div className="fixed left-0 top-0 h-full w-64 bg-gray-900/95 backdrop-blur-sm border-r border-gray-700 z-50 lg:hidden">
            <div className="p-4">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-yellow-400 rounded-lg flex items-center justify-center">
                    <Film className="w-5 h-5 text-black" />
                  </div>
                  <span className="text-xl font-bold text-yellow-400 glow-text">DSH</span>
                </div>
                <button
                  onClick={() => setShowMobileNav(false)}
                  className="p-2 hover:bg-gray-800 rounded-lg transition-colors duration-300"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              <nav className="space-y-2">
                {navigationItems.map((item) => {
                  const IconComponent = item.icon;
                  const isActive = activeTab === item.id;
                  
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNavigation(item.id)}
                      className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-300 ${
                        isActive
                          ? 'text-yellow-400 bg-yellow-400/10 border border-yellow-400/20'
                          : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                      }`}
                    >
                      <IconComponent className={`w-6 h-6 ${isActive ? 'text-yellow-400' : ''}`} />
                      <span className="font-medium">{item.name}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>
        </>
      )}

      {/* Category Tabs */}
      {!['history', 'favorites'].includes(selectedCategory) && (
        <div className="px-4 py-4">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex-shrink-0 px-4 py-2 rounded-lg font-semibold transition-all duration-300 text-sm ${
                  selectedCategory === category.id
                    ? 'bg-yellow-400 text-black glow-button'
                    : 'bg-gray-900/50 border border-gray-700 text-white hover:border-yellow-400/50'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Content */}
      <div className="px-4 pb-24 lg:pb-8">
        {loading && currentPage === 1 ? (
          <div className={`grid gap-3 ${
            viewMode === 'grid' 
              ? 'grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7' 
              : 'grid-cols-1'
          }`}>
            {[...Array(21)].map((_, index) => (
              <div key={index} className="bg-gray-900 rounded-xl overflow-hidden border border-gray-800 animate-pulse">
                <div className={`${viewMode === 'grid' ? 'aspect-[2/3]' : 'h-20'} bg-gray-800`}></div>
                <div className="p-2">
                  <div className="h-3 bg-gray-800 rounded mb-1"></div>
                  <div className="h-2 bg-gray-800 rounded w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            <div className={`grid gap-3 ${
              viewMode === 'grid' 
                ? 'grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7' 
                : 'grid-cols-1'
            }`}>
              {movies.map((movie, index) => (
                <div 
                  key={movie.id}
                  className={`group relative bg-gray-900 rounded-xl overflow-hidden border border-gray-800 hover:border-yellow-400/50 transition-all duration-300 movie-card cursor-pointer ${
                    viewMode === 'list' ? 'flex' : ''
                  }`}
                  onClick={() => handleMovieClick(movie)}
                >
                  <div className={`relative overflow-hidden ${
                    viewMode === 'grid' ? 'aspect-[2/3]' : 'w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0'
                  }`}>
                    {movie.poster_path ? (
                      <img
                        src={selectedContentType === 'series' ? SeriesService.getImageUrl(movie.poster_path) : tmdbApi.getImageUrl(movie.poster_path)}
                        alt={movie.title || movie.name}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                        <Play className="w-4 h-4 text-gray-600" />
                      </div>
                    )}
                    
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                    
                    {movie.vote_average > 0 && (
                      <div className="absolute top-1 right-1 flex items-center gap-0.5 px-1 py-0.5 bg-black/70 rounded text-xs">
                        <Star className="w-2 h-2 text-yellow-400 fill-current" />
                        <span className="text-white text-xs">{movie.vote_average.toFixed(1)}</span>
                      </div>
                    )}

                    {/* Recommendation indicator */}
                    {selectedCategory === 'recommended' && currentUser && (movie as any).recommendationScore && index < 5 && (
                      <div className="absolute top-1 left-1 px-1 py-0.5 bg-yellow-400 text-black rounded text-xs font-bold">
                        #{index + 1}
                      </div>
                    )}
                  </div>

                  <div className={`p-2 ${viewMode === 'list' ? 'flex-1' : ''}`}>
                    <h3 className="font-semibold text-white text-xs mb-1 group-hover:text-yellow-400 transition-colors duration-300 line-clamp-2">
                      {movie.title || movie.name}
                    </h3>
                    
                    {(movie.release_date || movie.first_air_date) && (
                      <div className="flex items-center gap-1 text-xs text-gray-400 mb-1">
                        <Calendar className="w-2 h-2" />
                        <span>{new Date(movie.release_date || movie.first_air_date).getFullYear()}</span>
                      </div>
                    )}

                    {/* Show recommendation reasons for top recommendations */}
                    {selectedCategory === 'recommended' && currentUser && (movie as any).recommendationScore && index < 3 && (
                      <p className="text-xs text-yellow-400 mb-1 line-clamp-1">
                        {(movie as any).recommendationScore.reasons[0]}
                      </p>
                    )}

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleWatchMovie(movie);
                      }}
                      className="w-full px-2 py-1 bg-yellow-400 text-black font-semibold rounded text-xs hover:bg-yellow-300 transition-all duration-300"
                    >
                      Watch
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {hasMore && movies.length > 0 && !['history', 'favorites'].includes(selectedCategory) && (
              <div className="text-center mt-6">
                <button
                  onClick={loadMore}
                  disabled={loading}
                  className="px-6 py-2 bg-yellow-400 text-black font-semibold rounded-lg hover:bg-yellow-300 transition-all duration-300 disabled:opacity-50 text-sm"
                >
                  {loading ? 'Loading...' : 'Load More'}
                </button>
              </div>
            )}
          </>
        )}

        {movies.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">
              {selectedCategory === 'history' ? '📺' : selectedCategory === 'favorites' ? '❤️' : '🎬'}
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">
              {selectedCategory === 'history' ? 'No watch history' : 
               selectedCategory === 'favorites' ? 'No favorites yet' : 
               selectedCategory === 'recommended' ? 'Start watching to get recommendations' :
               `No ${selectedContentType} found`}
            </h3>
            <p className="text-gray-400 text-sm">
              {selectedCategory === 'history' ? `Start watching ${selectedContentType} to build your history` :
               selectedCategory === 'favorites' ? `Add ${selectedContentType} to your favorites` :
               selectedCategory === 'recommended' ? 'Watch some content to get personalized recommendations' :
               'Try adjusting your search terms'}
            </p>
          </div>
        )}
      </div>

      {/* Desktop Bottom Navigation */}
      <div className="hidden lg:block fixed bottom-0 left-0 right-0 bg-gray-900/95 backdrop-blur-sm border-t border-gray-700 z-30">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-center items-center py-3">
            <div className="flex gap-2">
              {navigationItems.map((item) => {
                const IconComponent = item.icon;
                const isActive = activeTab === item.id;
                
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavigation(item.id)}
                    className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-all duration-300 ${
                      isActive
                        ? 'text-yellow-400 bg-yellow-400/10'
                        : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                    }`}
                  >
                    <IconComponent className={`w-6 h-6 ${isActive ? 'text-yellow-400' : ''}`} />
                    <span className="text-sm font-medium">{item.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <LoginModal 
        isOpen={showLogin} 
        onClose={() => setShowLogin(false)} 
        onLogin={handleLogin} 
      />
      
      {currentUser && (
        <SettingsModal 
          isOpen={showSettings} 
          onClose={() => setShowSettings(false)} 
          currentUser={currentUser}
          onLogout={handleLogout}
        />
      )}
    </div>
  );
};

export default Dashboard;