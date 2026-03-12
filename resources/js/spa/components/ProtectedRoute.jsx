import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ roles, children }) => {
    const auth = useAuth();
    const location = useLocation();

    if (auth.loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-100">
                <div className="rounded-lg border border-slate-200 bg-white px-5 py-3 text-sm text-slate-600 shadow-sm">
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
