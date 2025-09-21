import { useState, useEffect } from 'react';
import { authService } from '../services/authService';

interface User {
  id: string;
  email: string;
  username: string;
  is_staff: boolean;
}

interface AuthState {
  user: User | null;
  loading: boolean;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true,
  });

  useEffect(() => {
    // Check if user is already authenticated
    const checkAuth = async () => {
      if (authService.isAuthenticated()) {
        try {
          const user = await authService.getCurrentUser();
          setAuthState({
            user,
            loading: false,
          });
        } catch (error) {
          setAuthState({
            user: null,
            loading: false,
          });
        }
      } else {
        setAuthState({
          user: null,
          loading: false,
        });
      }
    };

    checkAuth();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      await authService.login(email, password);
      const user = await authService.getCurrentUser();
      setAuthState({
        user,
        loading: false,
      });
      return { data: { user }, error: null };
    } catch (error) {
      return { data: null, error: { message: 'Login failed' } };
    }
  };

  const signUp = async (email: string, password: string) => {
    // For now, redirect to admin to create users
    return { data: null, error: { message: 'Please contact admin to create account' } };
  };

  const signOut = async () => {
    authService.logout();
    setAuthState({
      user: null,
      loading: false,
    });
    return { error: null };
  };

  const checkAdminRole = async () => {
    if (!authState.user) return false;
    return authState.user.is_staff;
  };

  return {
    ...authState,
    signIn,
    signUp,
    signOut,
    checkAdminRole,
  };
}