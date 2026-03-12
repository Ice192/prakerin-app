import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { extractErrorMessage } from '../services/api';

const LoginPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useAuth();

    const [form, setForm] = useState({
        email: '',
        password: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);
        setError('');

        try {
            await login(form);
            const redirectTo = location.state?.from?.pathname || '/dashboard';
            navigate(redirectTo, { replace: true });
        } catch (submitError) {
            setError(extractErrorMessage(submitError, 'Failed to login.'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 px-4 py-8">
            <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl">
                <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Internship Management</p>
                <h1 className="mt-2 text-2xl font-semibold text-slate-900">Login</h1>
                <p className="mt-1 text-sm text-slate-600">
                    Use your account to access the Internship Management System.
                </p>

                <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
                    <label className="block">
                        <span className="mb-1 block text-sm font-medium text-slate-700">Email</span>
                        <input
                            type="email"
                            value={form.email}
                            onChange={(event) =>
                                setForm((previous) => ({ ...previous, email: event.target.value }))
                            }
                            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none focus:ring-0"
                            placeholder="admin@mail.com"
                            required
                        />
                    </label>

                    <label className="block">
                        <span className="mb-1 block text-sm font-medium text-slate-700">Password</span>
                        <input
                            type="password"
                            value={form.password}
                            onChange={(event) =>
                                setForm((previous) => ({ ...previous, password: event.target.value }))
                            }
                            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none focus:ring-0"
                            placeholder="********"
                            required
                        />
                    </label>

                    {error ? (
                        <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                            {error}
                        </div>
                    ) : null}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default LoginPage;
