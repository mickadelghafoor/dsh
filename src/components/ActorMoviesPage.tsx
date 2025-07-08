import React, { useState, useEffect } from 'react';
import { ArrowLeft, Star, Calendar, Play, User } from 'lucide-react';
import { tmdbApi, Movie, Person } from '../services/tmdbApi';

interface ActorMoviesPageProps {
  actorId: number;
  onBack: () => void;
  onWatchMovie: (movie: Movie) => void;
}

const ActorMoviesPage: React.FC<ActorMoviesPageProps> = ({ actorId, onBack, onWatchMovie }) => {
  const [actor, setActor] = useState<Person | null>(null);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActorData = async () => {
      try {
        setLoading(true);
        const [actorDetails, movieCredits] = await Promise.all([
          tmdbApi.getPersonDetails(actorId),
          tmdbApi.getPersonMovieCredits(actorId)
        ]);
        
        setActor(actorDetails);
        // Sort movies by popularity and release date
        const sortedMovies = movieCredits.cast
          .filter(movie => movie.poster_path) // Only movies with posters
          .sort((a, b) => {
            // First sort by popularity, then by release date
            if (b.popularity !== a.popularity) {
              return b.popularity - a.popularity;
            }
            return new Date(b.release_date || '').getTime() - new Date(a.release_date || '').getTime();
          })
          .slice(0, 50); // Limit to 50 movies
        
        setMovies(sortedMovies);
      } catch (error) {
        console.error('Error fetching actor data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchActorData();
  }, [actorId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-yellow-400"></div>
      </div>
    );
  }

  if (!actor) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Actor not found</h2>
          <button
            onClick={onBack}
            className="px-6 py-3 bg-yellow-400 text-black font-semibold rounded-lg hover:bg-yellow-300 transition-all duration-300"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-black/95 backdrop-blur-sm border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center">
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors duration-300 mr-4"
          >
            <ArrowLeft className="w-6 h-6 text-yellow-400" />
          </button>
          <h1 className="text-xl font-bold text-white">{actor.name}</h1>
        </div>
      </div>

      {/* Actor Info Section */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8 mb-12">
          {/* Actor Photo */}
          <div className="flex-shrink-0">
            <div className="w-64 h-96 mx-auto lg:mx-0 rounded-xl overflow-hidden border-2 border-gray-700">
              {actor.profile_path ? (
                <img
                  src={tmdbApi.getImageUrl(actor.profile_path, 'w500')}
                  alt={actor.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                  <User className="w-16 h-16 text-gray-600" />
                </div>
              )}
            </div>
          </div>

          {/* Actor Details */}
          <div className="flex-1">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white">
              {actor.name}
            </h1>
            
            <div className="flex flex-wrap items-center gap-4 mb-6 text-sm">
              <div className="flex items-center gap-2 bg-yellow-400/20 px-3 py-1 rounded-lg">
                <span className="text-yellow-400 font-semibold">Known for:</span>
                <span className="text-white">{actor.known_for_department}</span>
              </div>
              
              {actor.birthday && (
                <div className="flex items-center gap-2 text-gray-300">
                  <Calendar className="w-4 h-4" />
                  <span>Born {new Date(actor.birthday).toLocaleDateString()}</span>
                </div>
              )}
              
              {actor.place_of_birth && (
                <div className="text-gray-300">
                  <span>{actor.place_of_birth}</span>
                </div>
              )}
            </div>

            {actor.biography && (
              <div className="mb-6">
                <h3 className="text-xl font-semibold mb-3 text-yellow-400">Biography</h3>
                <p className="text-gray-300 leading-relaxed">
                  {actor.biography.length > 500 
                    ? `${actor.biography.substring(0, 500)}...` 
                    : actor.biography
                  }
                </p>
              </div>
            )}

            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4 text-yellow-400">Career Stats</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-400 glow-text">
                    {movies.length}
                  </div>
                  <div className="text-sm text-gray-400">Movies</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-400 glow-text">
                    {actor.popularity.toFixed(0)}
                  </div>
                  <div className="text-sm text-gray-400">Popularity Score</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Movies Section */}
        <div>
          <h2 className="text-3xl font-bold mb-8 text-center">
            <span className="text-white">Movies featuring</span>{' '}
            <span className="text-yellow-400 glow-text">{actor.name}</span>
          </h2>

          {movies.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🎬</div>
              <h3 className="text-2xl font-semibold text-white mb-2">No movies found</h3>
              <p className="text-gray-400">This actor doesn't have any movies in our database yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-4">
              {movies.map((movie) => (
                <div 
                  key={movie.id}
                  className="group relative bg-gray-900 rounded-xl overflow-hidden border border-gray-800 hover:border-yellow-400/50 transition-all duration-300 movie-card cursor-pointer"
                  onClick={() => onWatchMovie(movie)}
                >
                  {/* Movie poster */}
                  <div className="aspect-[2/3] relative overflow-hidden">
                    {movie.poster_path ? (
                      <img
                        src={tmdbApi.getImageUrl(movie.poster_path)}
                        alt={movie.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                        <Play className="w-8 h-8 text-gray-600" />
                      </div>
                    )}
                    
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10"></div>
                    
                    {/* Play button overlay */}
                    <div className="absolute inset-0 flex items-center justify-center z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="p-3 bg-yellow-400/90 text-black rounded-full hover:bg-yellow-400 transition-colors duration-300 glow-button">
                        <Play className="w-5 h-5" />
                      </div>
                    </div>

                    {/* Rating badge */}
                    {movie.vote_average > 0 && (
                      <div className="absolute top-2 right-2 z-20 flex items-center gap-1 px-2 py-1 bg-black/70 rounded-lg backdrop-blur-sm">
                        <Star className="w-3 h-3 text-yellow-400 fill-current" />
                        <span className="text-xs font-semibold text-white">
                          {movie.vote_average.toFixed(1)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Movie info */}
                  <div className="p-3">
                    <h3 className="font-semibold text-white text-sm mb-2 group-hover:text-yellow-400 transition-colors duration-300 line-clamp-2">
                      {movie.title}
                    </h3>
                    
                    {movie.release_date && (
                      <div className="flex items-center gap-2 text-xs text-gray-400 mb-2">
                        <Calendar className="w-3 h-3" />
                        <span>{new Date(movie.release_date).getFullYear()}</span>
                      </div>
                    )}

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onWatchMovie(movie);
                      }}
                      className="w-full px-3 py-2 bg-yellow-400 text-black font-semibold rounded-lg hover:bg-yellow-300 transition-all duration-300 glow-button text-xs"
                    >
                      Watch
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ActorMoviesPage;