import { useEffect, useState } from 'react';
import ChartCard from '../components/ChartCard';
import PageHeader from '../components/PageHeader';
import SimpleBarChart from '../components/SimpleBarChart';
import SimpleDonutChart from '../components/SimpleDonutChart';
import StatCard from '../components/StatCard';
import { api, extractErrorMessage } from '../services/api';

const DashboardPage = () => {
    const [dashboard, setDashboard] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchDashboard = async () => {
            setLoading(true);
            setError('');

            try {
                const response = await api.get('/dashboard');
                setDashboard(response.data?.data ?? null);
            } catch (fetchError) {
                setError(extractErrorMessage(fetchError, 'Failed to load dashboard.'));
            } finally {
                setLoading(false);
            }
        };

        fetchDashboard();
    }, []);

    if (loading) {
        return <p className="text-sm text-slate-600">Loading dashboard...</p>;
    }

    const isAdminDashboard = dashboard?.role === 'admin';

    return (
        <div>
            <PageHeader
                title="Dashboard"
                description="Role-based overview of internship management activities."
            />

            {error ? (
                <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                    {error}
                </div>
            ) : null}

            {dashboard?.cards?.length ? (
                <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {dashboard.cards.map((item) => (
                        <StatCard key={item.label} label={item.label} value={item.value} />
                    ))}
                </section>
            ) : null}

            {isAdminDashboard ? (
                <section className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
                    <ChartCard
                        title="Internship Overview"
                        description={`Snapshot as of ${dashboard?.today ?? 'today'}`}
                    >
                        <SimpleBarChart data={dashboard?.charts?.internship_overview ?? []} />
                    </ChartCard>

                    <ChartCard
                        title="Journal Submission Today"
                        description="Comparison between submitted and missing journals for active internship students."
                    >
                        <SimpleDonutChart data={dashboard?.charts?.journal_today_overview ?? []} />
                    </ChartCard>
                </section>
            ) : null}

            {dashboard?.recent_placements?.length ? (
                <section className="mt-6">
                    <h3 className="mb-3 text-base font-semibold text-slate-900">Recent Placements</h3>
                    <div className="overflow-x-auto rounded-lg border border-slate-200">
                        <table className="min-w-full divide-y divide-slate-200 text-sm">
                            <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
                                <tr>
                                    <th className="px-3 py-2">Student</th>
                                    <th className="px-3 py-2">Industry</th>
                                    <th className="px-3 py-2">Status</th>
                                    <th className="px-3 py-2">Start Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {dashboard.recent_placements.map((item) => (
                                    <tr key={item.id}>
                                        <td className="px-3 py-2 text-slate-700">{item.student_name}</td>
                                        <td className="px-3 py-2 text-slate-700">{item.industry_name}</td>
                                        <td className="px-3 py-2 text-slate-700">{item.status}</td>
                                        <td className="px-3 py-2 text-slate-700">{item.start_date}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>
            ) : null}

            {dashboard?.recent_journals?.length ? (
                <section className="mt-6">
                    <h3 className="mb-3 text-base font-semibold text-slate-900">Recent Journals</h3>
                    <div className="space-y-3">
                        {dashboard.recent_journals.map((journal) => (
                            <article key={journal.id} className="rounded-lg border border-slate-200 p-3">
                                <p className="text-xs uppercase tracking-wide text-slate-500">{journal.date}</p>
                                <p className="mt-1 text-sm text-slate-800">{journal.activity}</p>
                                <p className="mt-1 text-xs text-slate-600">
                                    Status: {journal.verification_status}
                                </p>
                            </article>
                        ))}
                    </div>
                </section>
            ) : null}

            {dashboard?.recent_students?.length ? (
                <section className="mt-6">
                    <h3 className="mb-3 text-base font-semibold text-slate-900">Recent Assigned Students</h3>
                    <div className="overflow-x-auto rounded-lg border border-slate-200">
                        <table className="min-w-full divide-y divide-slate-200 text-sm">
                            <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
                                <tr>
                                    <th className="px-3 py-2">Student</th>
                                    <th className="px-3 py-2">Status</th>
                                    <th className="px-3 py-2">Start</th>
                                    <th className="px-3 py-2">End</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {dashboard.recent_students.map((item) => (
                                    <tr key={item.id}>
                                        <td className="px-3 py-2 text-slate-700">{item.student_name}</td>
                                        <td className="px-3 py-2 text-slate-700">{item.status}</td>
                                        <td className="px-3 py-2 text-slate-700">{item.start_date}</td>
                                        <td className="px-3 py-2 text-slate-700">{item.end_date}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>
            ) : null}
        </div>
    );
};

export default DashboardPage;
