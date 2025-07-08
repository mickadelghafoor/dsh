import React, { useState, useEffect } from 'react';
import { ArrowLeft, Play, Star, Calendar, Clock, Globe, Heart, Share2, Download, Info, User } from 'lucide-react';
import { tmdbApi, Movie, CastMember, CrewMember } from '../services/tmdbApi';
import { UserService } from '../services/userService';

interface MovieInfoPageProps {
  movie: Movie;
  onBack: () => void;
  onWatch: () => void;
  onViewActor?: (actorId: number) => void;
  contentType?: 'movie' | 'series' | 'anime';
}

const MovieInfoPage: React.FC<MovieInfoPageProps> = ({ 
  movie, 
  onBack, 
  onWatch, 
  onViewActor,
  contentType = 'movie' 
}) => {
  const [movieDetails, setMovieDetails] = useState<any>(null);
  const [cast, setCast] = useState<CastMember[]>([]);
  const [crew, setCrew] = useState<CrewMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    const fetchMovieDetails = async () => {
      try {
        setLoading(true);
        const [details, credits] = await Promise.all([
          tmdbApi.getMovieDetails(movie.id),
          tmdbApi.getMovieCredits(movie.id)
        ]);
        
        setMovieDetails(details);
        setCast(credits.cast.slice(0, 20)); // Show top 20 cast members
        setCrew(credits.crew.filter(member => 
          ['Director', 'Producer', 'Writer', 'Screenplay'].includes(member.job)
        ).slice(0, 10)); // Show key crew members
        setIsFavorite(UserService.isFavorite(movie.id));
      } catch (error) {
        console.error('Error fetching movie details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMovieDetails();
  }, [movie.id]);

  const toggleFavorite = () => {
    if (!UserService.isLoggedIn()) {
      alert('Please login to add favorites');
      return;
    }

    if (isFavorite) {
      UserService.removeFromFavorites(movie.id);
      setIsFavorite(false);
    } else {
      UserService.addToFavorites(movie, contentType);
      setIsFavorite(true);
    }
  };

  const formatRuntime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const handleActorClick = (actorId: number) => {
    if (onViewActor) {
      onViewActor(actorId);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-yellow-400"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-black/95 backdrop-blur-sm border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors duration-300"
          >
            <ArrowLeft className="w-6 h-6 text-yellow-400" />
          </button>
          
          <div className="flex items-center gap-2">
            <button
              onClick={toggleFavorite}
              className={`p-2 rounded-lg transition-colors duration-300 ${
                isFavorite ? 'bg-red-500 text-white' : 'bg-gray-800 text-gray-300 hover:text-red-400'
              }`}
            >
              <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
            </button>
            
            <button className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors duration-300">
              <Share2 className="w-5 h-5 text-gray-300" />
            </button>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="relative">
        {movieDetails?.backdrop_path && (
          <div className="relative h-64 sm:h-80 md:h-96 lg:h-[500px]">
            <img
              src={tmdbApi.getBackdropUrl(movieDetails.backdrop_path)}
              alt={movie.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
          </div>
        )}
        
        <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
              {/* Poster */}
              <div className="flex-shrink-0">
                <div className="w-32 h-48 sm:w-40 sm:h-60 md:w-48 md:h-72 lg:w-56 lg:h-80 rounded-xl overflow-hidden border-2 border-gray-700">
                  {movie.poster_path ? (
                    <img
                      src={tmdbApi.getImageUrl(movie.poster_path)}
                      alt={movie.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                      <Play className="w-8 h-8 text-gray-600" />
                    </div>
                  )}
                </div>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-2 sm:mb-4">
                  {movie.title || movie.name}
                </h1>
                
                <div className="flex flex-wrap items-center gap-2 sm:gap-4 mb-4 text-sm sm:text-base">
                  {movie.vote_average > 0 && (
                    <div className="flex items-center gap-1 bg-yellow-400/20 px-2 py-1 rounded-lg">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="text-yellow-400 font-semibold">
                        {movie.vote_average.toFixed(1)}
                      </span>
                    </div>
                  )}
                  
                  {(movie.release_date || movie.first_air_date) && (
                    <div className="flex items-center gap-1 text-gray-300">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(movie.release_date || movie.first_air_date).getFullYear()}</span>
                    </div>
                  )}
                  
                  {movieDetails?.runtime && (
                    <div className="flex items-center gap-1 text-gray-300">
                      <Clock className="w-4 h-4" />
                      <span>{formatRuntime(movieDetails.runtime)}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-1 text-gray-300">
                    <Globe className="w-4 h-4" />
                    <span className="uppercase">{movie.original_language}</span>
                  </div>
                </div>

                {/* Genres */}
                {movieDetails?.genres && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {movieDetails.genres.map((genre: any) => (
                      <span
                        key={genre.id}
                        className="px-3 py-1 bg-gray-800/80 border border-gray-600 rounded-full text-sm text-gray-300"
                      >
                        {genre.name}
                      </span>
                    ))}
                  </div>
                )}

                {/* Overview */}
                <p className="text-gray-300 leading-relaxed mb-6 text-sm sm:text-base">
                  {movie.overview}
                </p>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={onWatch}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-yellow-400 text-black font-semibold rounded-lg hover:bg-yellow-300 transition-all duration-300 glow-button"
                  >
                    <Play className="w-5 h-5" />
                    Watch Now
                  </button>
                  
                  <button className="flex items-center justify-center gap-2 px-6 py-3 border border-gray-600 text-gray-300 font-semibold rounded-lg hover:bg-gray-800 transition-all duration-300">
                    <Download className="w-5 h-5" />
                    Download
                  </button>
                  
                  <button className="flex items-center justify-center gap-2 px-6 py-3 border border-gray-600 text-gray-300 font-semibold rounded-lg hover:bg-gray-800 transition-all duration-300">
                    <Info className="w-5 h-5" />
                    More Info
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Sections */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Cast Section */}
            {cast.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold mb-6 text-white">Cast</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {cast.map((actor) => (
                    <div 
                      key={actor.id}
                      className="group cursor-pointer bg-gray-900/50 border border-gray-800 rounded-xl overflow-hidden hover:border-yellow-400/50 transition-all duration-300"
                      onClick={() => handleActorClick(actor.id)}
                    >
                      <div className="aspect-[3/4] relative overflow-hidden">
                        {actor.profile_path ? (
                          <img
                            src={tmdbApi.getImageUrl(actor.profile_path, 'w300')}
                            alt={actor.name}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                            <User className="w-8 h-8 text-gray-600" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                      </div>
                      
                      <div className="p-3">
                        <h3 className="font-semibold text-white text-sm mb-1 group-hover:text-yellow-400 transition-colors duration-300 line-clamp-2">
                          {actor.name}
                        </h3>
                        <p className="text-xs text-gray-400 line-clamp-2">
                          {actor.character}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Crew Section */}
            {crew.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold mb-6 text-white">Key Crew</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {crew.map((member) => (
                    <div 
                      key={`${member.id}-${member.job}`}
                      className="flex items-center gap-4 p-4 bg-gray-900/50 border border-gray-800 rounded-xl hover:border-yellow-400/50 transition-all duration-300"
                    >
                      <div className="w-16 h-16 rounded-full overflow-hidden flex-shrink-0">
                        {member.profile_path ? (
                          <img
                            src={tmdbApi.getImageUrl(member.profile_path, 'w200')}
                            alt={member.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                            <User className="w-6 h-6 text-gray-600" />
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-white text-sm mb-1">
                          {member.name}
                        </h3>
                        <p className="text-xs text-yellow-400">
                          {member.job}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* About Section */}
            <div>
              <h2 className="text-2xl font-bold mb-4">About this {contentType}</h2>
              <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
                <p className="text-gray-300 leading-relaxed mb-6">
                  {movie.overview}
                </p>
                
                {movieDetails?.production_companies && movieDetails.production_companies.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Production Companies</h3>
                    <div className="flex flex-wrap gap-4">
                      {movieDetails.production_companies.map((company: any) => (
                        <div key={company.id} className="text-sm text-gray-400">
                          {company.name}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4">Details</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Type:</span>
                  <span className="text-white capitalize">{contentType}</span>
                </div>
                
                {movieDetails?.runtime && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Runtime:</span>
                    <span className="text-white">{formatRuntime(movieDetails.runtime)}</span>
                  </div>
                )}
                
                <div className="flex justify-between">
                  <span className="text-gray-400">Language:</span>
                  <span className="text-white uppercase">{movie.original_language}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-400">Rating:</span>
                  <span className="text-white">{movie.vote_average.toFixed(1)}/10</span>
                </div>
                
                {movieDetails?.budget && movieDetails.budget > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Budget:</span>
                    <span className="text-white">${(movieDetails.budget / 1000000).toFixed(1)}M</span>
                  </div>
                )}
              </div>
            </div>

            {/* Features */}
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4">Available Features</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-gray-300">Multiple Language Captions</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-gray-300">HD Quality Streaming</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-gray-300">Multiple Streaming Sources</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-gray-300">Cross-Device Sync</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieInfoPage;