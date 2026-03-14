import { useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { formatRole } from '../utils/localization';

const NAV_ITEMS = [
    { label: 'Dasbor', path: '/dashboard', roles: ['admin', 'student', 'industry'] },
    { label: 'Manajemen Siswa', path: '/students', roles: ['admin'] },
    { label: 'Manajemen Industri', path: '/industries', roles: ['admin'] },
    { label: 'Penempatan Prakerin', path: '/placements', roles: ['admin'] },
    { label: 'Jurnal Siswa', path: '/journals', roles: ['admin', 'student', 'industry'] },
    { label: 'Penilaian', path: '/evaluation', roles: ['admin', 'student', 'industry'] },
    { label: 'Laporan', path: '/reports', roles: ['admin'] },
];

const AppLayout = () => {
    const { user, logout } = useAuth();
    const [showUserInfo, setShowUserInfo] = useState(false);
    const location = useLocation();
    const visibleNav = NAV_ITEMS.filter((item) => item.roles.includes(user?.role));
    const isDashboardPage = location.pathname === '/dashboard';

    return (
        <div className="app-shell">
            <div
                className={[
                    'mx-auto grid min-h-screen grid-cols-1 gap-6 px-4 py-6 lg:grid-cols-[260px_minmax(0,1fr)]',
                    isDashboardPage ? 'w-full max-w-none' : 'max-w-7xl',
                ].join(' ')}
            >
                <aside className="fade-up rounded-2xl border border-cyan-400/30 bg-gradient-to-b from-sky-700 via-cyan-700 to-teal-700 p-5 text-sky-50 shadow-xl shadow-cyan-900/20">
                    <div className="mb-6 border-b border-white/20 pb-4">
                        <p className="text-xs uppercase tracking-[0.2em] text-sky-100/85">
                            Manajemen Prakerin
                        </p>
                        <h1 className="mt-2 text-xl font-semibold">Portal Prakerin</h1>
                    </div>

                    <nav className="space-y-2">
                        {visibleNav.map((item) => (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                className={({ isActive }) =>
                                    [
                                        'app-nav-link',
                                        isActive ? 'app-nav-link-active font-medium' : '',
                                    ].join(' ')
                                }
                            >
                                {item.label}
                            </NavLink>
                        ))}
                    </nav>
                </aside>

                <div
                    className={[
                        'space-y-5 fade-up',
                        isDashboardPage ? 'flex min-h-[calc(100vh-3rem)] flex-col' : '',
                    ].join(' ')}
                >
                    <header className="surface-card px-5 py-4">
                        <div className="flex items-center justify-end">
                            <div className="relative">
                                <button
                                    type="button"
                                    onClick={() => setShowUserInfo((previous) => !previous)}
                                    className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-sky-200 bg-sky-50 text-sky-700 shadow-sm transition hover:bg-sky-100"
                                    aria-label="Tampilkan informasi pengguna"
                                    aria-expanded={showUserInfo}
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        className="h-5 w-5"
                                    >
                                        <path d="M20 21a8 8 0 0 0-16 0" />
                                        <circle cx="12" cy="8" r="4" />
                                    </svg>
                                </button>

                                {showUserInfo ? (
                                    <div className="absolute right-0 top-14 z-20 w-56 rounded-xl border border-slate-200 bg-white p-3 text-sm shadow-lg shadow-slate-900/10">
                                        <p className="text-xs uppercase tracking-wide text-slate-500">
                                            Nama Pengguna
                                        </p>
                                        <p className="mt-1 text-base font-semibold text-slate-900">
                                            {user?.name}
                                        </p>
                                        <p className="mt-1 text-xs uppercase tracking-wide text-slate-500">
                                            Peran: {formatRole(user?.role)}
                                        </p>
                                        <button
                                            type="button"
                                            onClick={logout}
                                            className="btn-secondary mt-3 w-full"
                                        >
                                            Keluar
                                        </button>
                                    </div>
                                ) : null}
                            </div>
                        </div>
                    </header>

                    <main className={['surface-card p-5', isDashboardPage ? 'flex-1' : ''].join(' ')}>
                        <Outlet />
                    </main>
                </div>
            </div>
        </div>
    );
};

export default AppLayout;
