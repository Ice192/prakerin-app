import { useEffect, useState } from 'react';
import PageHeader from '../components/PageHeader';
import { api, extractErrorMessage } from '../services/api';
import { formatPlacementStatus } from '../utils/localization';

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
            setError(extractErrorMessage(initError, 'Gagal memuat data penempatan.'));
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
                setMessage('Data penempatan berhasil diperbarui.');
            } else {
                await api.post('/placements', payload);
                setMessage('Data penempatan berhasil ditambahkan.');
            }

            resetForm();
            await loadPlacements();
        } catch (submitError) {
            setError(extractErrorMessage(submitError, 'Gagal menyimpan data penempatan.'));
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
        if (!window.confirm('Hapus data penempatan ini?')) {
            return;
        }

        setMessage('');
        setError('');

        try {
            await api.delete(`/placements/${id}`);
            setMessage('Data penempatan berhasil dihapus.');
            await loadPlacements();
        } catch (deleteError) {
            setError(extractErrorMessage(deleteError, 'Gagal menghapus data penempatan.'));
        }
    };

    return (
        <div>
            <PageHeader
                title="Penempatan Prakerin"
                description="Tetapkan siswa ke mitra industri dan guru pembimbing."
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
                >
                    <option value="">Pilih Industri</option>
                    {lookups.industries.map((industry) => (
                        <option key={industry.id} value={industry.id}>
                            {industry.name}
                        </option>
                    ))}
                </select>

                <select
                    className="form-control"
                    value={form.teacher_id}
                    onChange={(event) => setForm((prev) => ({ ...prev, teacher_id: event.target.value }))}
                    required
                >
                    <option value="">Pilih Guru</option>
                    {lookups.teachers.map((teacher) => (
                        <option key={teacher.id} value={teacher.id}>
                            {teacher.name}
                        </option>
                    ))}
                </select>

                <input
                    type="date"
                    className="form-control"
                    value={form.start_date}
                    onChange={(event) => setForm((prev) => ({ ...prev, start_date: event.target.value }))}
                    required
                />

                <input
                    type="date"
                    className="form-control"
                    value={form.end_date}
                    onChange={(event) => setForm((prev) => ({ ...prev, end_date: event.target.value }))}
                    required
                />

                <select
                    className="form-control"
                    value={form.status}
                    onChange={(event) => setForm((prev) => ({ ...prev, status: event.target.value }))}
                    required
                >
                    {lookups.placement_statuses.map((status) => (
                        <option key={status} value={status}>
                            {formatPlacementStatus(status)}
                        </option>
                    ))}
                </select>

                <div className="flex flex-wrap gap-2 lg:col-span-3">
                    <button
                        type="submit"
                        disabled={submitting}
                        className="btn-primary"
                    >
                        {submitting ? 'Menyimpan...' : editingId ? 'Perbarui Penempatan' : 'Tambah Penempatan'}
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

            <div className="table-shell fade-up">
                <table className="min-w-full divide-y divide-slate-200 text-sm">
                    <thead className="table-head">
                        <tr>
                            <th className="px-3 py-2">Siswa</th>
                            <th className="px-3 py-2">Industri</th>
                            <th className="px-3 py-2">Guru</th>
                            <th className="px-3 py-2">Tanggal Mulai</th>
                            <th className="px-3 py-2">Tanggal Selesai</th>
                            <th className="px-3 py-2">Status</th>
                            <th className="px-3 py-2">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {loading ? (
                            <tr>
                                <td colSpan={7} className="px-3 py-4 text-center text-slate-500">
                                    Memuat data penempatan...
                                </td>
                            </tr>
                        ) : placements.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="px-3 py-4 text-center text-slate-500">
                                    Belum ada data penempatan.
                                </td>
                            </tr>
                        ) : (
                            placements.map((placement) => (
                                <tr key={placement.id} className="table-row">
                                    <td className="px-3 py-2 text-slate-700">{placement.student_name}</td>
                                    <td className="px-3 py-2 text-slate-700">{placement.industry_name}</td>
                                    <td className="px-3 py-2 text-slate-700">{placement.supervising_teacher}</td>
                                    <td className="px-3 py-2 text-slate-700">
                                        {placement.internship_start_date}
                                    </td>
                                    <td className="px-3 py-2 text-slate-700">
                                        {placement.internship_end_date}
                                    </td>
                                    <td className="px-3 py-2 text-slate-700">
                                        {formatPlacementStatus(placement.status)}
                                    </td>
                                    <td className="px-3 py-2">
                                        <div className="flex gap-2">
                                            <button
                                                type="button"
                                                onClick={() => startEdit(placement)}
                                                className="btn-secondary btn-xs"
                                            >
                                                Ubah
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleDelete(placement.id)}
                                                className="btn-danger btn-xs"
                                            >
                                                Hapus
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
