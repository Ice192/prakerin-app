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
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);
        setError('');

        try {
            await login(form);
            const redirectTo = location.state?.from?.pathname || '/dashboard';
            navigate(redirectTo, { replace: true });
        } catch (submitError) {
            setError(extractErrorMessage(submitError, 'Gagal masuk.'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="app-shell flex min-h-screen items-center justify-center bg-gradient-to-br from-sky-700 via-cyan-700 to-teal-700 px-4 py-8">
            <div className="w-full max-w-md rounded-2xl border border-white/30 bg-white/95 p-8 shadow-2xl shadow-slate-900/20 fade-up">
                <p className="text-xs uppercase tracking-[0.25em] text-sky-700">Manajemen Prakerin</p>
                <h1 className="mt-2 text-[1.85rem] font-semibold leading-tight text-slate-900">Masuk</h1>
                <p className="mt-2 text-[0.98rem] leading-relaxed text-slate-600">
                    Gunakan akun Anda untuk mengakses Sistem Manajemen Prakerin.
                </p>

                <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
                    <label className="block">
                        <span className="mb-1 block text-[0.94rem] font-medium text-slate-700">Email</span>
                        <input
                            type="email"
                            value={form.email}
                            onChange={(event) =>
                                setForm((previous) => ({ ...previous, email: event.target.value }))
                            }
                            className="form-control"
                            placeholder="Masukkan Email Anda"
                            required
                        />
                    </label>

                    <label className="block">
                        <span className="mb-1 block text-[0.94rem] font-medium text-slate-700">Kata Sandi</span>
                        <div className="relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={form.password}
                                onChange={(event) =>
                                    setForm((previous) => ({ ...previous, password: event.target.value }))
                                }
                                className="form-control pr-11"
                                placeholder="Password"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword((previous) => !previous)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 transition-colors hover: hover:text-sky-700"
                                aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                                aria-pressed={showPassword}
                            >
                                {showPassword ? (
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        className="h-5 w-5"
                                    >
                                        <path d="M3 3l18 18" />
                                        <path d="M10.6 10.6a3 3 0 0 0 4.24 4.24" />
                                        <path d="M9.9 5.1A10.6 10.6 0 0 1 12 5c5.5 0 9.5 4.5 10 7-.2 1-1 2.6-2.3 4" />
                                        <path d="M6.6 6.6C4.6 8 3.3 9.9 3 12c.3 1.8 2.3 5 6.1 6.4" />
                                    </svg>
                                ) : (
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        className="h-5 w-5"
                                    >
                                        <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
                                        <circle cx="12" cy="12" r="3" />
                                    </svg>
                                )}
                            </button>
                        </div>
                    </label>

                    {error ? (
                        <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                            {error}
                        </div>
                    ) : null}

                    <button
                        type="submit"
                        disabled={loading}
                        className="btn-primary w-full"
                    >
                        {loading ? 'Sedang masuk...' : 'Masuk'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default LoginPage;
