import { supabase } from '../lib/supabase';
import { AuthService } from './authService';

export interface WatchHistoryItem {
  id: string;
  movie_id: number;
  title: string;
  poster_path: string | null;
  content_type: string;
  watched_at: string;
  progress: number;
}

export interface FavoriteItem {
  id: string;
  movie_id: number;
  title: string;
  poster_path: string | null;
  content_type: string;
  vote_average: number;
  release_date: string | null;
  added_at: string;
}

export class DatabaseService {
  // Watch History Methods
  static async addToWatchHistory(
    movieId: number,
    title: string,
    posterPath: string | null,
    contentType: string = 'movie',
    progress: number = 0
  ): Promise<boolean> {
    const user = AuthService.getCurrentUser();
    if (!user) return false;

    try {
      // Check if already exists
      const { data: existing } = await supabase
        .from('watch_history')
        .select('id')
        .eq('user_id', user.id)
        .eq('movie_id', movieId)
        .single();

      if (existing) {
        // Update existing entry
        const { error } = await supabase
          .from('watch_history')
          .update({
            watched_at: new Date().toISOString(),
            progress
          })
          .eq('id', existing.id);

        return !error;
      } else {
        // Insert new entry
        const { error } = await supabase
          .from('watch_history')
          .insert({
            user_id: user.id,
            movie_id: movieId,
            title,
            poster_path: posterPath,
            content_type: contentType,
            progress
          });

        return !error;
      }
    } catch (error) {
      console.error('Error adding to watch history:', error);
      return false;
    }
  }

  static async getWatchHistory(): Promise<WatchHistoryItem[]> {
    const user = AuthService.getCurrentUser();
    if (!user) return [];

    try {
      const { data, error } = await supabase
        .from('watch_history')
        .select('*')
        .eq('user_id', user.id)
        .order('watched_at', { ascending: false })
        .limit(50);

      if (error) return [];
      return data || [];
    } catch (error) {
      console.error('Error fetching watch history:', error);
      return [];
    }
  }

  static async clearWatchHistory(): Promise<boolean> {
    const user = AuthService.getCurrentUser();
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('watch_history')
        .delete()
        .eq('user_id', user.id);

      return !error;
    } catch (error) {
      console.error('Error clearing watch history:', error);
      return false;
    }
  }

  // Favorites Methods
  static async addToFavorites(
    movieId: number,
    title: string,
    posterPath: string | null,
    contentType: string = 'movie',
    voteAverage: number = 0,
    releaseDate: string | null = null
  ): Promise<boolean> {
    const user = AuthService.getCurrentUser();
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('favorites')
        .insert({
          user_id: user.id,
          movie_id: movieId,
          title,
          poster_path: posterPath,
          content_type: contentType,
          vote_average: voteAverage,
          release_date: releaseDate
        });

      return !error;
    } catch (error) {
      console.error('Error adding to favorites:', error);
      return false;
    }
  }

  static async removeFromFavorites(movieId: number): Promise<boolean> {
    const user = AuthService.getCurrentUser();
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('movie_id', movieId);

      return !error;
    } catch (error) {
      console.error('Error removing from favorites:', error);
      return false;
    }
  }

  static async getFavorites(): Promise<FavoriteItem[]> {
    const user = AuthService.getCurrentUser();
    if (!user) return [];

    try {
      const { data, error } = await supabase
        .from('favorites')
        .select('*')
        .eq('user_id', user.id)
        .order('added_at', { ascending: false });

      if (error) return [];
      return data || [];
    } catch (error) {
      console.error('Error fetching favorites:', error);
      return [];
    }
  }

  static async isFavorite(movieId: number): Promise<boolean> {
    const user = AuthService.getCurrentUser();
    if (!user) return false;

    try {
      const { data, error } = await supabase
        .from('favorites')
        .select('id')
        .eq('user_id', user.id)
        .eq('movie_id', movieId)
        .single();

      return !error && !!data;
    } catch (error) {
      return false;
    }
  }

  static async clearFavorites(): Promise<boolean> {
    const user = AuthService.getCurrentUser();
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', user.id);

      return !error;
    } catch (error) {
      console.error('Error clearing favorites:', error);
      return false;
    }
  }
}