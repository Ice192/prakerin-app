import { useEffect, useState } from 'react';
import PageHeader from '../components/PageHeader';
import { useAuth } from '../context/AuthContext';
import { api, extractErrorMessage } from '../services/api';

const INITIAL_FORM = {
    student_id: '',
    industry_id: '',
    discipline_score: 75,
    teamwork_score: 75,
    skill_score: 75,
    responsibility_score: 75,
};

const EvaluationPage = () => {
    const { user } = useAuth();
    const [evaluations, setEvaluations] = useState([]);
    const [lookups, setLookups] = useState({
        students: [],
        industries: [],
    });
    const [form, setForm] = useState(INITIAL_FORM);
    const [editingId, setEditingId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const canManage = user?.role === 'admin' || user?.role === 'industry';
    const canDelete = user?.role === 'admin';

    const loadLookups = async () => {
        const response = await api.get('/lookups');
        setLookups({
            students: response.data?.data?.students ?? [],
            industries: response.data?.data?.industries ?? [],
        });
    };

    const loadEvaluations = async () => {
        const response = await api.get('/evaluations');
        setEvaluations(response.data?.data ?? []);
    };

    const initialize = async () => {
        setLoading(true);
        setError('');

        try {
            await Promise.all([loadLookups(), loadEvaluations()]);
        } catch (initError) {
            setError(extractErrorMessage(initError, 'Gagal memuat data penilaian.'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        initialize();
    }, []);

    const resetForm = () => {
        setForm(INITIAL_FORM);
        setEditingId(null);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!canManage) {
            return;
        }

        setSubmitting(true);
        setMessage('');
        setError('');

        const payload = {
            student_id: Number(form.student_id),
            discipline_score: Number(form.discipline_score),
            teamwork_score: Number(form.teamwork_score),
            skill_score: Number(form.skill_score),
            responsibility_score: Number(form.responsibility_score),
        };

        if (user?.role === 'admin') {
            payload.industry_id = Number(form.industry_id);
        }

        try {
            if (editingId) {
                await api.put(`/evaluations/${editingId}`, payload);
                setMessage('Penilaian berhasil diperbarui.');
            } else {
                await api.post('/evaluations', payload);
                setMessage('Penilaian berhasil ditambahkan.');
            }

            resetForm();
            await loadEvaluations();
        } catch (submitError) {
            setError(extractErrorMessage(submitError, 'Gagal menyimpan penilaian.'));
        } finally {
            setSubmitting(false);
        }
    };

    const startEdit = (evaluation) => {
        setEditingId(evaluation.id);
        setForm({
            student_id: String(evaluation.student_id ?? ''),
            industry_id: String(evaluation.industry_id ?? ''),
            discipline_score: evaluation.discipline_score ?? 75,
            teamwork_score: evaluation.teamwork_score ?? 75,
            skill_score: evaluation.skill_score ?? 75,
            responsibility_score: evaluation.responsibility_score ?? 75,
        });
    };

    const handleDelete = async (id) => {
        if (!canDelete) {
            return;
        }

        if (!window.confirm('Hapus data penilaian ini?')) {
            return;
        }

        setMessage('');
        setError('');

        try {
            await api.delete(`/evaluations/${id}`);
            setMessage('Penilaian berhasil dihapus.');
            await loadEvaluations();
        } catch (deleteError) {
            setError(extractErrorMessage(deleteError, 'Gagal menghapus penilaian.'));
        }
    };

    return (
        <div>
            <PageHeader
                title="Penilaian"
                description="Catat dan pantau penilaian performa prakerin."
            />

            {error ? (
                <div className="alert-error">
                    {error}
                </div>
            ) : null}

            {message ? (
                <div className="alert-success">
                    {message}
                </div>
            ) : null}

            {canManage ? (
                <form className="form-card md:grid-cols-2 lg:grid-cols-3 fade-up" onSubmit={handleSubmit}>
                    <select
                        className="form-control"
                        value={form.student_id}
                        onChange={(event) => setForm((prev) => ({ ...prev, student_id: event.target.value }))}
                        required
                    >
                        <option value="">Pilih Siswa</option>
                        {lookups.students.map((student) => (
                            <option key={student.id} value={student.id}>
                                {student.name}
                            </option>
                        ))}
                    </select>

                    <select
                        className="form-control"
                        value={form.industry_id}
                        onChange={(event) => setForm((prev) => ({ ...prev, industry_id: event.target.value }))}
                        required
                        disabled={user?.role === 'industry'}
                    >
                        <option value="">Pilih Industri</option>
                        {lookups.industries.map((industry) => (
                            <option key={industry.id} value={industry.id}>
                                {industry.name}
                            </option>
                        ))}
                    </select>

                    <input
                        type="number"
                        min={0}
                        max={100}
                        className="form-control"
                        placeholder="Nilai Disiplin"
                        value={form.discipline_score}
                        onChange={(event) =>
                            setForm((prev) => ({ ...prev, discipline_score: event.target.value }))
                        }
                        required
                    />

                    <input
                        type="number"
                        min={0}
                        max={100}
                        className="form-control"
                        placeholder="Nilai Kerja Sama"
                        value={form.teamwork_score}
                        onChange={(event) =>
                            setForm((prev) => ({ ...prev, teamwork_score: event.target.value }))
                        }
                        required
                    />

                    <input
                        type="number"
                        min={0}
                        max={100}
                        className="form-control"
                        placeholder="Nilai Keterampilan"
                        value={form.skill_score}
                        onChange={(event) =>
                            setForm((prev) => ({ ...prev, skill_score: event.target.value }))
                        }
                        required
                    />

                    <input
                        type="number"
                        min={0}
                        max={100}
                        className="form-control"
                        placeholder="Nilai Tanggung Jawab"
                        value={form.responsibility_score}
                        onChange={(event) =>
                            setForm((prev) => ({ ...prev, responsibility_score: event.target.value }))
                        }
                        required
                    />

                    <div className="flex flex-wrap gap-2 lg:col-span-3">
                        <button
                            type="submit"
                            disabled={submitting}
                            className="btn-primary"
                        >
                            {submitting ? 'Menyimpan...' : editingId ? 'Perbarui Penilaian' : 'Tambah Penilaian'}
                        </button>
                        {editingId ? (
                            <button
                                type="button"
                                onClick={resetForm}
                                className="btn-secondary"
                            >
                                Batal Edit
                            </button>
                        ) : null}
                    </div>
                </form>
            ) : (
                <div className="alert-warning">
                    Akun ini hanya dapat melihat hasil penilaian.
                </div>
            )}

            <div className="table-shell fade-up">
                <table className="min-w-full divide-y divide-slate-200 text-sm">
                    <thead className="table-head">
                        <tr>
                            <th className="px-3 py-2">Siswa</th>
                            <th className="px-3 py-2">Industri</th>
                            <th className="px-3 py-2">Disiplin</th>
                            <th className="px-3 py-2">Kerja Sama</th>
                            <th className="px-3 py-2">Keterampilan</th>
                            <th className="px-3 py-2">Tanggung Jawab</th>
                            <th className="px-3 py-2">Nilai Akhir</th>
                            <th className="px-3 py-2">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {loading ? (
                            <tr>
                                <td colSpan={8} className="px-3 py-4 text-center text-slate-500">
                                    Memuat data penilaian...
                                </td>
                            </tr>
                        ) : evaluations.length === 0 ? (
                            <tr>
                                <td colSpan={8} className="px-3 py-4 text-center text-slate-500">
                                    Belum ada data penilaian.
                                </td>
                            </tr>
                        ) : (
                            evaluations.map((evaluation) => (
                                <tr key={evaluation.id} className="table-row">
                                    <td className="px-3 py-2 text-slate-700">{evaluation.student_name}</td>
                                    <td className="px-3 py-2 text-slate-700">{evaluation.industry_name}</td>
                                    <td className="px-3 py-2 text-slate-700">{evaluation.discipline_score}</td>
                                    <td className="px-3 py-2 text-slate-700">{evaluation.teamwork_score}</td>
                                    <td className="px-3 py-2 text-slate-700">{evaluation.skill_score}</td>
                                    <td className="px-3 py-2 text-slate-700">
                                        {evaluation.responsibility_score}
                                    </td>
                                    <td className="px-3 py-2 font-semibold text-slate-900">
                                        {evaluation.final_score}
                                    </td>
                                    <td className="px-3 py-2">
                                        <div className="flex flex-wrap gap-2">
                                            {canManage ? (
                                                <button
                                                    type="button"
                                                    onClick={() => startEdit(evaluation)}
                                                    className="btn-secondary btn-xs"
                                                >
                                                    Ubah
                                                </button>
                                            ) : null}
                                            {canDelete ? (
                                                <button
                                                    type="button"
                                                    onClick={() => handleDelete(evaluation.id)}
                                                    className="btn-danger btn-xs"
                                                >
                                                    Hapus
                                                </button>
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

export default EvaluationPage;
