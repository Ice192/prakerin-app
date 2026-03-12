import { useEffect, useState } from 'react';
import PageHeader from '../components/PageHeader';
import { useAuth } from '../context/AuthContext';
import { api, extractErrorMessage } from '../services/api';
import { formatJournalStatus } from '../utils/localization';

const INITIAL_FORM = {
    date: '',
    activity: '',
};

const JournalsPage = () => {
    const { user } = useAuth();
    const [journals, setJournals] = useState([]);
    const [form, setForm] = useState(INITIAL_FORM);
    const [editingId, setEditingId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const canEditJournal = user?.role === 'student';

    const loadJournals = async () => {
        setLoading(true);
        setError('');

        try {
            const response = await api.get('/journals');
            setJournals(response.data?.data ?? []);
        } catch (fetchError) {
            setError(extractErrorMessage(fetchError, 'Gagal memuat data jurnal.'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadJournals();
    }, []);

    const resetForm = () => {
        setForm(INITIAL_FORM);
        setEditingId(null);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!canEditJournal) {
            return;
        }

        setSubmitting(true);
        setMessage('');
        setError('');

        try {
            if (editingId) {
                await api.put(`/journals/${editingId}`, form);
                setMessage('Jurnal berhasil diperbarui.');
            } else {
                await api.post('/journals', form);
                setMessage('Jurnal berhasil ditambahkan.');
            }

            resetForm();
            await loadJournals();
        } catch (submitError) {
            setError(extractErrorMessage(submitError, 'Gagal menyimpan jurnal.'));
        } finally {
            setSubmitting(false);
        }
    };

    const startEdit = (journal) => {
        setEditingId(journal.id);
        setForm({
            date: journal.date ?? '',
            activity: journal.activity ?? '',
        });
    };

    const verifyJournal = async (journalId, status) => {
        setMessage('');
        setError('');

        try {
            await api.patch(`/journals/${journalId}/verify`, {
                verification_status: status,
            });
            setMessage(`Status jurnal berhasil diubah menjadi ${formatJournalStatus(status)}.`);
            await loadJournals();
        } catch (verifyError) {
            setError(extractErrorMessage(verifyError, 'Gagal memverifikasi jurnal.'));
        }
    };

    return (
        <div>
            <PageHeader
                title="Jurnal Siswa"
                description="Pantau aktivitas prakerin harian dan status verifikasi."
            />

            {error ? (
                <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                    {error}
                </div>
            ) : null}

            {message ? (
                <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                    {message}
                </div>
            ) : null}

            {canEditJournal ? (
                <form className="grid grid-cols-1 gap-3 rounded-xl border border-slate-200 p-4" onSubmit={handleSubmit}>
                    <input
                        type="date"
                        className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                        value={form.date}
                        onChange={(event) => setForm((prev) => ({ ...prev, date: event.target.value }))}
                        required
                    />
                    <textarea
                        rows={4}
                        placeholder="Tuliskan aktivitas prakerin Anda..."
                        className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                        value={form.activity}
                        onChange={(event) => setForm((prev) => ({ ...prev, activity: event.target.value }))}
                        required
                    />
                    <div className="flex flex-wrap gap-2">
                        <button
                            type="submit"
                            disabled={submitting}
                            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-60"
                    >
                            {submitting ? 'Menyimpan...' : editingId ? 'Perbarui Jurnal' : 'Tambah Jurnal'}
                        </button>
                        {editingId ? (
                            <button
                                type="button"
                                onClick={resetForm}
                                className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
                            >
                                Batal Edit
                            </button>
                        ) : null}
                    </div>
                </form>
            ) : (
                <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700">
                    Akun ini hanya dapat melihat jurnal. Fitur tambah dan ubah jurnal hanya untuk akun siswa.
                </div>
            )}

            <div className="mt-5 overflow-x-auto rounded-xl border border-slate-200">
                <table className="min-w-full divide-y divide-slate-200 text-sm">
                    <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                        <tr>
                            <th className="px-3 py-2">Tanggal</th>
                            <th className="px-3 py-2">Siswa</th>
                            <th className="px-3 py-2">Aktivitas</th>
                            <th className="px-3 py-2">Status</th>
                            <th className="px-3 py-2">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {loading ? (
                            <tr>
                                <td colSpan={5} className="px-3 py-4 text-center text-slate-500">
                                    Memuat data jurnal...
                                </td>
                            </tr>
                        ) : journals.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-3 py-4 text-center text-slate-500">
                                    Belum ada data jurnal.
                                </td>
                            </tr>
                        ) : (
                            journals.map((journal) => (
                                <tr key={journal.id}>
                                    <td className="px-3 py-2 text-slate-700">{journal.date}</td>
                                    <td className="px-3 py-2 text-slate-700">{journal.student_name}</td>
                                    <td className="px-3 py-2 text-slate-700">{journal.activity}</td>
                                    <td className="px-3 py-2 text-slate-700">
                                        {formatJournalStatus(journal.verification_status)}
                                    </td>
                                    <td className="px-3 py-2">
                                        <div className="flex flex-wrap gap-2">
                                            {canEditJournal ? (
                                                <button
                                                    type="button"
                                                    onClick={() => startEdit(journal)}
                                                    className="rounded border border-slate-300 px-2 py-1 text-xs text-slate-700 hover:bg-slate-100"
                                                >
                                                    Ubah
                                                </button>
                                            ) : null}

                                            {!canEditJournal && journal.verification_status === 'pending' ? (
                                                <>
                                                    <button
                                                        type="button"
                                                        onClick={() => verifyJournal(journal.id, 'verified')}
                                                        className="rounded border border-emerald-300 px-2 py-1 text-xs text-emerald-700 hover:bg-emerald-50"
                                                    >
                                                        Verifikasi
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => verifyJournal(journal.id, 'rejected')}
                                                        className="rounded border border-rose-300 px-2 py-1 text-xs text-rose-700 hover:bg-rose-50"
                                                    >
                                                        Tolak
                                                    </button>
                                                </>
                                            ) : null}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default JournalsPage;
