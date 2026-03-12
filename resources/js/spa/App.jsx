import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import AppLayout from './components/AppLayout';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuth } from './context/AuthContext';
import DashboardPage from './pages/DashboardPage';
import EvaluationPage from './pages/EvaluationPage';
import IndustriesPage from './pages/IndustriesPage';
import JournalsPage from './pages/JournalsPage';
import LoginPage from './pages/LoginPage';
import PlacementsPage from './pages/PlacementsPage';
import ReportsPage from './pages/ReportsPage';
import StudentsPage from './pages/StudentsPage';

const LoginRoute = () => {
    const { loading, isAuthenticated } = useAuth();

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-100 text-sm text-slate-600">
                Loading session...
            </div>
        );
    }

    if (isAuthenticated) {
        return <Navigate to="/dashboard" replace />;
    }

    return <LoginPage />;
};

const App = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<LoginRoute />} />

                <Route
                    element={
                        <ProtectedRoute>
                            <AppLayout />
                        </ProtectedRoute>
                    }
                >
                    <Route index element={<Navigate to="/dashboard" replace />} />
                    <Route
                        path="/dashboard"
                        element={
                            <ProtectedRoute roles={['admin', 'student', 'industry']}>
                                <DashboardPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/students"
                        element={
                            <ProtectedRoute roles={['admin']}>
                                <StudentsPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/industries"
                        element={
                            <ProtectedRoute roles={['admin']}>
                                <IndustriesPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/placements"
                        element={
                            <ProtectedRoute roles={['admin']}>
                                <PlacementsPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/journals"
                        element={
                            <ProtectedRoute roles={['admin', 'student', 'industry']}>
                                <JournalsPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/evaluation"
                        element={
                            <ProtectedRoute roles={['admin', 'student', 'industry']}>
                                <EvaluationPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/reports"
                        element={
                            <ProtectedRoute roles={['admin']}>
                                <ReportsPage />
                            </ProtectedRoute>
                        }
                    />
                </Route>

                <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
        </BrowserRouter>
    );
};

export default App;
