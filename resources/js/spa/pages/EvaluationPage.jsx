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
            setError(extractErrorMessage(initError, 'Failed to load evaluations.'));
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
                setMessage('Evaluation updated successfully.');
            } else {
                await api.post('/evaluations', payload);
                setMessage('Evaluation created successfully.');
            }

            resetForm();
            await loadEvaluations();
        } catch (submitError) {
            setError(extractErrorMessage(submitError, 'Failed to save evaluation.'));
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

        if (!window.confirm('Delete this evaluation?')) {
            return;
        }

        setMessage('');
        setError('');

        try {
            await api.delete(`/evaluations/${id}`);
            setMessage('Evaluation deleted successfully.');
            await loadEvaluations();
        } catch (deleteError) {
            setError(extractErrorMessage(deleteError, 'Failed to delete evaluation.'));
        }
    };

    return (
        <div>
            <PageHeader
                title="Evaluation"
                description="Record and track internship performance evaluations."
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

            {canManage ? (
                <form className="grid grid-cols-1 gap-3 rounded-xl border border-slate-200 p-4 md:grid-cols-2 lg:grid-cols-3" onSubmit={handleSubmit}>
                    <select
                        className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                        value={form.student_id}
                        onChange={(event) => setForm((prev) => ({ ...prev, student_id: event.target.value }))}
                        required
                    >
                        <option value="">Select Student</option>
                        {lookups.students.map((student) => (
                            <option key={student.id} value={student.id}>
                                {student.name}
                            </option>
                        ))}
                    </select>

                    <select
                        className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                        value={form.industry_id}
                        onChange={(event) => setForm((prev) => ({ ...prev, industry_id: event.target.value }))}
                        required
                        disabled={user?.role === 'industry'}
                    >
                        <option value="">Select Industry</option>
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
                        className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                        placeholder="Discipline Score"
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
                        className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                        placeholder="Teamwork Score"
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
                        className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                        placeholder="Skill Score"
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
                        className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                        placeholder="Responsibility Score"
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
                            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-60"
                        >
                            {submitting ? 'Saving...' : editingId ? 'Update Evaluation' : 'Add Evaluation'}
                        </button>
                        {editingId ? (
                            <button
                                type="button"
                                onClick={resetForm}
                                className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
                            >
                                Cancel Edit
                            </button>
                        ) : null}
                    </div>
                </form>
            ) : (
                <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700">
                    This account can only view evaluation results.
                </div>
            )}

            <div className="mt-5 overflow-x-auto rounded-xl border border-slate-200">
                <table className="min-w-full divide-y divide-slate-200 text-sm">
                    <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                        <tr>
                            <th className="px-3 py-2">Student</th>
                            <th className="px-3 py-2">Industry</th>
                            <th className="px-3 py-2">Discipline</th>
                            <th className="px-3 py-2">Teamwork</th>
                            <th className="px-3 py-2">Skill</th>
                            <th className="px-3 py-2">Responsibility</th>
                            <th className="px-3 py-2">Final Score</th>
                            <th className="px-3 py-2">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {loading ? (
                            <tr>
                                <td colSpan={8} className="px-3 py-4 text-center text-slate-500">
                                    Loading evaluations...
                                </td>
                            </tr>
                        ) : evaluations.length === 0 ? (
                            <tr>
                                <td colSpan={8} className="px-3 py-4 text-center text-slate-500">
                                    No evaluations available.
                                </td>
                            </tr>
                        ) : (
                            evaluations.map((evaluation) => (
                                <tr key={evaluation.id}>
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
                                                    className="rounded border border-slate-300 px-2 py-1 text-xs text-slate-700 hover:bg-slate-100"
                                                >
                                                    Edit
                                                </button>
                                            ) : null}
                                            {canDelete ? (
                                                <button
                                                    type="button"
                                                    onClick={() => handleDelete(evaluation.id)}
                                                    className="rounded border border-rose-300 px-2 py-1 text-xs text-rose-700 hover:bg-rose-50"
                                                >
                                                    Delete
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
