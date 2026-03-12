import { useEffect, useState } from 'react';
import PageHeader from '../components/PageHeader';
import { api, extractErrorMessage } from '../services/api';

const INITIAL_FORM = {
    student_id: '',
    industry_id: '',
    teacher_id: '',
    start_date: '',
    end_date: '',
    status: 'assigned',
};

const PlacementsPage = () => {
    const [placements, setPlacements] = useState([]);
    const [lookups, setLookups] = useState({
        students: [],
        industries: [],
        teachers: [],
        placement_statuses: ['assigned', 'active', 'completed', 'cancelled'],
    });
    const [form, setForm] = useState(INITIAL_FORM);
    const [editingId, setEditingId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const loadLookups = async () => {
        const response = await api.get('/lookups');
        setLookups((prev) => ({
            ...prev,
            ...(response.data?.data ?? {}),
        }));
    };

    const loadPlacements = async () => {
        const response = await api.get('/placements');
        setPlacements(response.data?.data ?? []);
    };

    const initialize = async () => {
        setLoading(true);
        setError('');

        try {
            await Promise.all([loadLookups(), loadPlacements()]);
        } catch (initError) {
            setError(extractErrorMessage(initError, 'Failed to load placements.'));
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
        setSubmitting(true);
        setMessage('');
        setError('');

        const payload = {
            student_id: Number(form.student_id),
            industry_id: Number(form.industry_id),
            teacher_id: Number(form.teacher_id),
            start_date: form.start_date,
            end_date: form.end_date,
            status: form.status,
        };

        try {
            if (editingId) {
                await api.put(`/placements/${editingId}`, payload);
                setMessage('Placement updated successfully.');
            } else {
                await api.post('/placements', payload);
                setMessage('Placement created successfully.');
            }

            resetForm();
            await loadPlacements();
        } catch (submitError) {
            setError(extractErrorMessage(submitError, 'Failed to save placement.'));
        } finally {
            setSubmitting(false);
        }
    };

    const startEdit = (placement) => {
        setEditingId(placement.id);
        setForm({
            student_id: String(placement.student_id ?? ''),
            industry_id: String(placement.industry_id ?? ''),
            teacher_id: String(placement.teacher_id ?? ''),
            start_date: placement.internship_start_date ?? '',
            end_date: placement.internship_end_date ?? '',
            status: placement.status ?? 'assigned',
        });
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this placement?')) {
            return;
        }

        setMessage('');
        setError('');

        try {
            await api.delete(`/placements/${id}`);
            setMessage('Placement deleted successfully.');
            await loadPlacements();
        } catch (deleteError) {
            setError(extractErrorMessage(deleteError, 'Failed to delete placement.'));
        }
    };

    return (
        <div>
            <PageHeader
                title="Internship Placements"
                description="Assign students to industry partners and supervising teachers."
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
                >
                    <option value="">Select Industry</option>
                    {lookups.industries.map((industry) => (
                        <option key={industry.id} value={industry.id}>
                            {industry.name}
                        </option>
                    ))}
                </select>

                <select
                    className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                    value={form.teacher_id}
                    onChange={(event) => setForm((prev) => ({ ...prev, teacher_id: event.target.value }))}
                    required
                >
                    <option value="">Select Teacher</option>
                    {lookups.teachers.map((teacher) => (
                        <option key={teacher.id} value={teacher.id}>
                            {teacher.name}
                        </option>
                    ))}
                </select>

                <input
                    type="date"
                    className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                    value={form.start_date}
                    onChange={(event) => setForm((prev) => ({ ...prev, start_date: event.target.value }))}
                    required
                />

                <input
                    type="date"
                    className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                    value={form.end_date}
                    onChange={(event) => setForm((prev) => ({ ...prev, end_date: event.target.value }))}
                    required
                />

                <select
                    className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                    value={form.status}
                    onChange={(event) => setForm((prev) => ({ ...prev, status: event.target.value }))}
                    required
                >
                    {lookups.placement_statuses.map((status) => (
                        <option key={status} value={status}>
                            {status}
                        </option>
                    ))}
                </select>

                <div className="flex flex-wrap gap-2 lg:col-span-3">
                    <button
                        type="submit"
                        disabled={submitting}
                        className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-60"
                    >
                        {submitting ? 'Saving...' : editingId ? 'Update Placement' : 'Add Placement'}
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

            <div className="mt-5 overflow-x-auto rounded-xl border border-slate-200">
                <table className="min-w-full divide-y divide-slate-200 text-sm">
                    <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                        <tr>
                            <th className="px-3 py-2">Student</th>
                            <th className="px-3 py-2">Industry</th>
                            <th className="px-3 py-2">Teacher</th>
                            <th className="px-3 py-2">Start Date</th>
                            <th className="px-3 py-2">End Date</th>
                            <th className="px-3 py-2">Status</th>
                            <th className="px-3 py-2">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {loading ? (
                            <tr>
                                <td colSpan={7} className="px-3 py-4 text-center text-slate-500">
                                    Loading placements...
                                </td>
                            </tr>
                        ) : placements.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="px-3 py-4 text-center text-slate-500">
                                    No placements available.
                                </td>
                            </tr>
                        ) : (
                            placements.map((placement) => (
                                <tr key={placement.id}>
                                    <td className="px-3 py-2 text-slate-700">{placement.student_name}</td>
                                    <td className="px-3 py-2 text-slate-700">{placement.industry_name}</td>
                                    <td className="px-3 py-2 text-slate-700">{placement.supervising_teacher}</td>
                                    <td className="px-3 py-2 text-slate-700">
                                        {placement.internship_start_date}
                                    </td>
                                    <td className="px-3 py-2 text-slate-700">
                                        {placement.internship_end_date}
                                    </td>
                                    <td className="px-3 py-2 text-slate-700">{placement.status}</td>
                                    <td className="px-3 py-2">
                                        <div className="flex gap-2">
                                            <button
                                                type="button"
                                                onClick={() => startEdit(placement)}
                                                className="rounded border border-slate-300 px-2 py-1 text-xs text-slate-700 hover:bg-slate-100"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleDelete(placement.id)}
                                                className="rounded border border-rose-300 px-2 py-1 text-xs text-rose-700 hover:bg-rose-50"
                                            >
                                                Delete
                                            </button>
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

export default PlacementsPage;
