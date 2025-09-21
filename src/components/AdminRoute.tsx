import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface AdminRouteProps {
  children: React.ReactNode;
}

const AdminRoute = ({ children }: AdminRouteProps) => {
  console.log('🔐 AdminRoute component rendered');
  const { user, loading, checkAdminRole } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const location = useLocation();

  useEffect(() => {
    const verifyAdmin = async () => {
      console.log('🔍 AdminRoute verifyAdmin - user:', user);
      if (user) {
        console.log('🔍 AdminRoute calling checkAdminRole for user');
        const adminStatus = await checkAdminRole();
        console.log('👤 AdminRoute admin status:', adminStatus);
        setIsAdmin(adminStatus);
      } else {
        console.log('❌ AdminRoute no user or session');
        setIsAdmin(false);
      }
    };

    console.log('⏳ AdminRoute useEffect - loading:', loading, 'user:', user?.email);
    if (!loading) {
      verifyAdmin();
    }
  }, [user, loading, checkAdminRole]);

  console.log('🎯 AdminRoute render check - loading:', loading, 'isAdmin:', isAdmin, 'user:', user);
  
  if (loading || isAdmin === null) {
    console.log('⏳ AdminRoute showing loading spinner');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    console.log('🚫 AdminRoute redirecting to auth - no user');
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  if (!isAdmin) {
    console.log('🚫 AdminRoute redirecting to home - not admin');
    return <Navigate to="/" replace />;
  }

  console.log('✅ AdminRoute rendering children:', children);
  return <>{children}</>;
};

export default AdminRoute;
