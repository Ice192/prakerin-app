import { useEffect, useState } from 'react';
import PageHeader from '../components/PageHeader';
import { api, extractErrorMessage } from '../services/api';

const INITIAL_FORM = {
    name: '',
    email: '',
    password: '',
    nis: '',
    class: '',
    major: '',
};

const StudentsPage = () => {
    const [students, setStudents] = useState([]);
    const [form, setForm] = useState(INITIAL_FORM);
    const [editingId, setEditingId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const loadStudents = async () => {
        setLoading(true);
        setError('');

        try {
            const response = await api.get('/students');
            setStudents(response.data?.data ?? []);
        } catch (fetchError) {
            setError(extractErrorMessage(fetchError, 'Gagal memuat data siswa.'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadStudents();
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

        try {
            if (editingId) {
                const payload = { ...form };
                if (!payload.password) {
                    delete payload.password;
                }

                await api.put(`/students/${editingId}`, payload);
                setMessage('Data siswa berhasil diperbarui.');
            } else {
                await api.post('/students', form);
                setMessage('Data siswa berhasil ditambahkan.');
            }

            resetForm();
            await loadStudents();
        } catch (submitError) {
            setError(extractErrorMessage(submitError, 'Gagal menyimpan data siswa.'));
        } finally {
            setSubmitting(false);
        }
    };

    const startEdit = (student) => {
        setEditingId(student.id);
        setForm({
            name: student.name ?? '',
            email: student.email ?? '',
            password: '',
            nis: student.nis ?? '',
            class: student.class ?? '',
            major: student.major ?? '',
        });
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Hapus data siswa ini?')) {
            return;
        }

        setMessage('');
        setError('');

        try {
            await api.delete(`/students/${id}`);
            setMessage('Data siswa berhasil dihapus.');
            await loadStudents();
        } catch (deleteError) {
            setError(extractErrorMessage(deleteError, 'Gagal menghapus data siswa.'));
        }
    };

    return (
        <div>
            <PageHeader
                title="Manajemen Siswa"
                description="Tambah, ubah, dan hapus data siswa."
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

            <form className="form-card md:grid-cols-2 fade-up" onSubmit={handleSubmit}>
                <input
                    type="text"
                    placeholder="Nama Lengkap"
                    className="form-control"
                    value={form.name}
                    onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                    required
                />
                <input
                    type="email"
                    placeholder="Email"
                    className="form-control"
                    value={form.email}
                    onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
                    required
                />
                <input
                    type="password"
                    placeholder={editingId ? 'Kata Sandi (opsional)' : 'Kata Sandi'}
                    className="form-control"
                    value={form.password}
                    onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
                    required={!editingId}
                />
                <input
                    type="text"
                    placeholder="NIS"
                    className="form-control"
                    value={form.nis}
                    onChange={(event) => setForm((prev) => ({ ...prev, nis: event.target.value }))}
                    required
                />
                <input
                    type="text"
                    placeholder="Kelas"
                    className="form-control"
                    value={form.class}
                    onChange={(event) => setForm((prev) => ({ ...prev, class: event.target.value }))}
                    required
                />
                <input
                    type="text"
                    placeholder="Jurusan"
                    className="form-control"
                    value={form.major}
                    onChange={(event) => setForm((prev) => ({ ...prev, major: event.target.value }))}
                    required
                />

                <div className="md:col-span-2 flex flex-wrap gap-2">
                    <button
                        type="submit"
                        disabled={submitting}
                        className="btn-primary"
                    >
                        {submitting ? 'Menyimpan...' : editingId ? 'Perbarui Siswa' : 'Tambah Siswa'}
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
                            <th className="px-3 py-2">Nama</th>
                            <th className="px-3 py-2">Email</th>
                            <th className="px-3 py-2">NIS</th>
                            <th className="px-3 py-2">Kelas</th>
                            <th className="px-3 py-2">Jurusan</th>
                            <th className="px-3 py-2">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {loading ? (
                            <tr>
                                <td colSpan={6} className="px-3 py-4 text-center text-slate-500">
                                    Memuat data siswa...
                                </td>
                            </tr>
                        ) : students.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-3 py-4 text-center text-slate-500">
                                    Belum ada data siswa.
                                </td>
                            </tr>
                        ) : (
                            students.map((student) => (
                                <tr key={student.id} className="table-row">
                                    <td className="px-3 py-2 text-slate-700">{student.name}</td>
                                    <td className="px-3 py-2 text-slate-700">{student.email}</td>
                                    <td className="px-3 py-2 text-slate-700">{student.nis}</td>
                                    <td className="px-3 py-2 text-slate-700">{student.class}</td>
                                    <td className="px-3 py-2 text-slate-700">{student.major}</td>
                                    <td className="px-3 py-2">
                                        <div className="flex gap-2">
                                            <button
                                                type="button"
                                                onClick={() => startEdit(student)}
                                                className="btn-secondary btn-xs"
                                            >
                                                Ubah
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleDelete(student.id)}
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

export default StudentsPage;
