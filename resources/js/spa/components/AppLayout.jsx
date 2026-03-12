import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NAV_ITEMS = [
    { label: 'Dashboard', path: '/dashboard', roles: ['admin', 'student', 'industry'] },
    { label: 'Students Management', path: '/students', roles: ['admin'] },
    { label: 'Industries Management', path: '/industries', roles: ['admin'] },
    { label: 'Internship Placements', path: '/placements', roles: ['admin'] },
    { label: 'Student Journals', path: '/journals', roles: ['admin', 'student', 'industry'] },
    { label: 'Evaluation', path: '/evaluation', roles: ['admin', 'student', 'industry'] },
    { label: 'Reports', path: '/reports', roles: ['admin'] },
];

const getRoleLabel = (role) => {
    if (!role) return '-';
    return role.charAt(0).toUpperCase() + role.slice(1);
};

const AppLayout = () => {
    const { user, logout } = useAuth();
    const visibleNav = NAV_ITEMS.filter((item) => item.roles.includes(user?.role));

    return (
        <div className="min-h-screen bg-slate-100">
            <div className="mx-auto grid min-h-screen max-w-7xl grid-cols-1 gap-6 px-4 py-6 lg:grid-cols-[260px_minmax(0,1fr)]">
                <aside className="rounded-2xl bg-slate-900 p-5 text-slate-100 shadow-xl">
                    <div className="mb-6 border-b border-slate-700 pb-4">
                        <p className="text-xs uppercase tracking-[0.2em] text-slate-300">
                            Internship Management
                        </p>
                        <h1 className="mt-2 text-xl font-semibold">IMS Portal</h1>
                    </div>

                    <nav className="space-y-2">
                        {visibleNav.map((item) => (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                className={({ isActive }) =>
                                    [
                                        'block rounded-lg px-3 py-2 text-sm transition',
                                        isActive
                                            ? 'bg-slate-100 font-medium text-slate-900'
                                            : 'text-slate-300 hover:bg-slate-800 hover:text-white',
                                    ].join(' ')
                                }
                            >
                                {item.label}
                            </NavLink>
                        ))}
                    </nav>
                </aside>

                <div className="space-y-5">
                    <header className="rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <p className="text-sm text-slate-500">Signed in as</p>
                                <h2 className="text-lg font-semibold text-slate-900">{user?.name}</h2>
                                <p className="text-xs uppercase tracking-wide text-slate-500">
                                    Role: {getRoleLabel(user?.role)}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={logout}
                                className="inline-flex items-center rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                            >
                                Logout
                            </button>
                        </div>
                    </header>

                    <main className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <Outlet />
                    </main>
                </div>
            </div>
        </div>
    );
};

export default AppLayout;
