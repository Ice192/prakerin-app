import { useEffect, useState } from 'react';
import PageHeader from '../components/PageHeader';
import StatCard from '../components/StatCard';
import { api, extractErrorMessage } from '../services/api';
import {
    formatJournalStatus,
    formatMonthYear,
    formatPlacementStatus,
    formatSummaryLabel,
} from '../utils/localization';

const ReportsPage = () => {
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchReport = async () => {
            setLoading(true);
            setError('');

            try {
                const response = await api.get('/reports');
                setReport(response.data?.data ?? null);
            } catch (fetchError) {
                setError(extractErrorMessage(fetchError, 'Gagal memuat laporan.'));
            } finally {
                setLoading(false);
            }
        };

        fetchReport();
    }, []);

    return (
        <div>
            <PageHeader
                title="Laporan"
                description="Ringkasan statistik dan analitik operasional prakerin."
            />

            {error ? (
                <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                    {error}
                </div>
            ) : null}

            {loading ? <p className="text-sm text-slate-600">Memuat laporan...</p> : null}

            {report?.summary ? (
                <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
                    {Object.entries(report.summary).map(([key, value]) => (
                        <StatCard key={key} label={formatSummaryLabel(key)} value={value} />
                    ))}
                </section>
            ) : null}

            {report?.placements_by_status?.length ? (
                <section className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
                    <div className="rounded-xl border border-slate-200 p-4">
                        <h3 className="mb-3 text-sm font-semibold text-slate-900">Penempatan per Status</h3>
                        <ul className="space-y-2 text-sm text-slate-700">
                            {report.placements_by_status.map((item) => (
                                <li key={item.status} className="flex items-center justify-between">
                                    <span>{formatPlacementStatus(item.status)}</span>
                                    <span className="font-semibold">{item.total}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="rounded-xl border border-slate-200 p-4">
                        <h3 className="mb-3 text-sm font-semibold text-slate-900">Jurnal per Status</h3>
                        <ul className="space-y-2 text-sm text-slate-700">
                            {report.journals_by_status.map((item) => (
                                <li key={item.status} className="flex items-center justify-between">
                                    <span>{formatJournalStatus(item.status)}</span>
                                    <span className="font-semibold">{item.total}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </section>
            ) : null}

            {report?.top_students?.length ? (
                <section className="mt-6">
                    <h3 className="mb-3 text-base font-semibold text-slate-900">Siswa Terbaik</h3>
                    <div className="overflow-x-auto rounded-xl border border-slate-200">
                        <table className="min-w-full divide-y divide-slate-200 text-sm">
                            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                                <tr>
                                    <th className="px-3 py-2">Siswa</th>
                                    <th className="px-3 py-2">Rata-rata Nilai</th>
                                    <th className="px-3 py-2">Jumlah Penilaian</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {report.top_students.map((student) => (
                                    <tr key={student.student_id}>
                                        <td className="px-3 py-2 text-slate-700">{student.student_name}</td>
                                        <td className="px-3 py-2 font-semibold text-slate-900">
                                            {student.average_score}
                                        </td>
                                        <td className="px-3 py-2 text-slate-700">
                                            {student.evaluation_count}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>
            ) : null}

            {report?.monthly_placements?.length ? (
                <section className="mt-6 rounded-xl border border-slate-200 p-4">
                    <h3 className="mb-3 text-sm font-semibold text-slate-900">
                        Penempatan Bulanan (6 Bulan)
                    </h3>
                    <ul className="space-y-2 text-sm text-slate-700">
                        {report.monthly_placements.map((item) => (
                            <li key={item.month} className="flex items-center justify-between">
                                <span>{formatMonthYear(item.month)}</span>
                                <span className="font-semibold">{item.total}</span>
                            </li>
                        ))}
                    </ul>
                </section>
            ) : null}
        </div>
    );
};

export default ReportsPage;
