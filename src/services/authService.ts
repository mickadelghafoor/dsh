import { supabase } from '../lib/supabase';
import bcrypt from 'bcryptjs';

export interface User {
  id: string;
  email: string;
  name: string;
  is_admin: boolean;
  avatar_url?: string;
  created_at: string;
  last_login: string;
  active_days: number;
}

export interface AuthResponse {
  user: User | null;
  error: string | null;
}

export class AuthService {
  private static currentUser: User | null = null;

  // Initialize auth state
  static async initialize(): Promise<void> {
    const token = localStorage.getItem('deltasilicon_token');
    if (token) {
      try {
        const user = await this.validateToken(token);
        this.currentUser = user;
      } catch (error) {
        localStorage.removeItem('deltasilicon_token');
      }
    }
  }

  // Sign up new user
  static async signUp(email: string, name: string, password: string): Promise<AuthResponse> {
    try {
      // Check if user already exists
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .single();

      if (existingUser) {
        return { user: null, error: 'User already exists with this email' };
      }

      // Hash password
      const passwordHash = await bcrypt.hash(password, 10);

      // Create user
      const { data, error } = await supabase
        .from('users')
        .insert({
          email,
          name,
          password_hash: passwordHash,
          last_login: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        return { user: null, error: error.message };
      }

      const user: User = {
        id: data.id,
        email: data.email,
        name: data.name,
        is_admin: data.is_admin,
        avatar_url: data.avatar_url,
        created_at: data.created_at,
        last_login: data.last_login,
        active_days: data.active_days
      };

      // Store token
      const token = btoa(JSON.stringify({ userId: user.id, timestamp: Date.now() }));
      localStorage.setItem('deltasilicon_token', token);
      this.currentUser = user;

      return { user, error: null };
    } catch (error) {
      return { user: null, error: 'Failed to create account' };
    }
  }

  // Sign in user
  static async signIn(email: string, password: string): Promise<AuthResponse> {
    try {
      // Get user by email
      const { data: userData, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();

      if (error || !userData) {
        return { user: null, error: 'Invalid email or password' };
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, userData.password_hash);
      if (!isValidPassword) {
        return { user: null, error: 'Invalid email or password' };
      }

      // Update last login and active days
      const now = new Date();
      const lastLogin = new Date(userData.last_login);
      const daysDiff = Math.floor((now.getTime() - lastLogin.getTime()) / (1000 * 60 * 60 * 24));
      
      let activeDays = userData.active_days;
      if (daysDiff >= 1) {
        activeDays += 1;
      }

      await supabase
        .from('users')
        .update({
          last_login: now.toISOString(),
          active_days: activeDays
        })
        .eq('id', userData.id);

      const user: User = {
        id: userData.id,
        email: userData.email,
        name: userData.name,
        is_admin: userData.is_admin,
        avatar_url: userData.avatar_url,
        created_at: userData.created_at,
        last_login: now.toISOString(),
        active_days: activeDays
      };

      // Store token
      const token = btoa(JSON.stringify({ userId: user.id, timestamp: Date.now() }));
      localStorage.setItem('deltasilicon_token', token);
      this.currentUser = user;

      return { user, error: null };
    } catch (error) {
      return { user: null, error: 'Failed to sign in' };
    }
  }

  // Sign out user
  static signOut(): void {
    localStorage.removeItem('deltasilicon_token');
    this.currentUser = null;
  }

  // Get current user
  static getCurrentUser(): User | null {
    return this.currentUser;
  }

  // Check if user is logged in
  static isLoggedIn(): boolean {
    return this.currentUser !== null;
  }

  // Check if user is admin
  static isAdmin(): boolean {
    return this.currentUser?.is_admin || false;
  }

  // Validate token
  private static async validateToken(token: string): Promise<User> {
    try {
      const decoded = JSON.parse(atob(token));
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', decoded.userId)
        .single();

      if (error || !data) {
        throw new Error('Invalid token');
      }

      return {
        id: data.id,
        email: data.email,
        name: data.name,
        is_admin: data.is_admin,
        avatar_url: data.avatar_url,
        created_at: data.created_at,
        last_login: data.last_login,
        active_days: data.active_days
      };
    } catch (error) {
      throw new Error('Invalid token');
    }
  }

  // Update user profile
  static async updateProfile(updates: Partial<Pick<User, 'name' | 'avatar_url'>>): Promise<boolean> {
    if (!this.currentUser) return false;

    try {
      const { error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', this.currentUser.id);

      if (error) return false;

      // Update current user
      this.currentUser = { ...this.currentUser, ...updates };
      return true;
    } catch (error) {
      return false;
    }
  }
}