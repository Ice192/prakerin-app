import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ roles, children }) => {
    const auth = useAuth();
    const location = useLocation();

    if (auth.loading) {
        return (
            <div className="app-shell flex min-h-screen items-center justify-center">
                <div className="surface-card px-5 py-3 text-sm text-slate-600 fade-up">
                    Memuat sesi...
                </div>
            </div>
        );
    }

    if (!auth.isAuthenticated) {
        return <Navigate to="/login" replace state={{ from: location }} />;
    }

    if (roles && !roles.includes(auth.user?.role)) {
        return <Navigate to="/dashboard" replace />;
    }

    return children;
};

export default ProtectedRoute;
