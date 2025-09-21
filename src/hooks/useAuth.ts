import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { djangoAPI } from '@/lib/django-api';
import { jwtDecode } from 'jwt-decode';

interface AuthContextType {
  user: any;
  loading: boolean;
  login: (credentials: any) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            try {
                const decodedUser = jwtDecode(token);
                setUser(decodedUser);
                djangoAPI.setToken(token);
            } catch (error) {
                console.error('Invalid token');
                localStorage.removeItem('accessToken');
            }
        }
        setLoading(false);
    }, []);

    const login = async (credentials: any) => {
        const response = await djangoAPI.login(credentials);
        // @ts-ignore
        const { access, refresh } = response;
        localStorage.setItem('accessToken', access);
        localStorage.setItem('refreshToken', refresh);
        const decodedUser = jwtDecode(access);
        setUser(decodedUser);
        djangoAPI.setToken(access);
    };

    const logout = () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        setUser(null);
        djangoAPI.setToken('');
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};