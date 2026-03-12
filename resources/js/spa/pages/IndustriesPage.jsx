import { useEffect, useState } from 'react';
import PageHeader from '../components/PageHeader';
import { api, extractErrorMessage } from '../services/api';

const INITIAL_FORM = {
    name: '',
    address: '',
    contact_person: '',
    email: '',
};

const IndustriesPage = () => {
    const [industries, setIndustries] = useState([]);
    const [form, setForm] = useState(INITIAL_FORM);
    const [editingId, setEditingId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const loadIndustries = async () => {
        setLoading(true);
        setError('');

        try {
            const response = await api.get('/industries');
            setIndustries(response.data?.data ?? []);
        } catch (fetchError) {
            setError(extractErrorMessage(fetchError, 'Gagal memuat data industri.'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadIndustries();
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
                await api.put(`/industries/${editingId}`, form);
                setMessage('Data industri berhasil diperbarui.');
            } else {
                await api.post('/industries', form);
                setMessage('Data industri berhasil ditambahkan.');
            }

            resetForm();
            await loadIndustries();
        } catch (submitError) {
            setError(extractErrorMessage(submitError, 'Gagal menyimpan data industri.'));
        } finally {
            setSubmitting(false);
        }
    };

    const startEdit = (industry) => {
        setEditingId(industry.id);
        setForm({
            name: industry.name ?? '',
            address: industry.address ?? '',
            contact_person: industry.contact_person ?? '',
            email: industry.email ?? '',
        });
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Hapus data industri ini?')) {
            return;
        }

        setMessage('');
        setError('');

        try {
            await api.delete(`/industries/${id}`);
            setMessage('Data industri berhasil dihapus.');
            await loadIndustries();
        } catch (deleteError) {
            setError(extractErrorMessage(deleteError, 'Gagal menghapus data industri.'));
        }
    };

    return (
        <div>
            <PageHeader
                title="Manajemen Industri"
                description="Kelola mitra industri prakerin beserta detail kontaknya."
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

            <form className="grid grid-cols-1 gap-3 rounded-xl border border-slate-200 p-4 md:grid-cols-2" onSubmit={handleSubmit}>
                <input
                    type="text"
                    placeholder="Nama Industri"
                    className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                    value={form.name}
                    onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                    required
                />
                <input
                    type="email"
                    placeholder="Email"
                    className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                    value={form.email}
                    onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
                    required
                />
                <input
                    type="text"
                    placeholder="Narahubung"
                    className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                    value={form.contact_person}
                    onChange={(event) =>
                        setForm((prev) => ({ ...prev, contact_person: event.target.value }))
                    }
                    required
                />
                <input
                    type="text"
                    placeholder="Alamat"
                    className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                    value={form.address}
                    onChange={(event) => setForm((prev) => ({ ...prev, address: event.target.value }))}
                    required
                />

                <div className="flex flex-wrap gap-2 md:col-span-2">
                    <button
                        type="submit"
                        disabled={submitting}
                        className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-60"
                    >
                        {submitting ? 'Menyimpan...' : editingId ? 'Perbarui Industri' : 'Tambah Industri'}
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

            <div className="mt-5 overflow-x-auto rounded-xl border border-slate-200">
                <table className="min-w-full divide-y divide-slate-200 text-sm">
                    <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                        <tr>
                            <th className="px-3 py-2">Nama</th>
                            <th className="px-3 py-2">Kontak</th>
                            <th className="px-3 py-2">Email</th>
                            <th className="px-3 py-2">Alamat</th>
                            <th className="px-3 py-2">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {loading ? (
                            <tr>
                                <td colSpan={5} className="px-3 py-4 text-center text-slate-500">
                                    Memuat data industri...
                                </td>
                            </tr>
                        ) : industries.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-3 py-4 text-center text-slate-500">
                                    Belum ada data industri.
                                </td>
                            </tr>
                        ) : (
                            industries.map((industry) => (
                                <tr key={industry.id}>
                                    <td className="px-3 py-2 text-slate-700">{industry.name}</td>
                                    <td className="px-3 py-2 text-slate-700">{industry.contact_person}</td>
                                    <td className="px-3 py-2 text-slate-700">{industry.email}</td>
                                    <td className="px-3 py-2 text-slate-700">{industry.address}</td>
                                    <td className="px-3 py-2">
                                        <div className="flex gap-2">
                                            <button
                                                type="button"
                                                onClick={() => startEdit(industry)}
                                                className="rounded border border-slate-300 px-2 py-1 text-xs text-slate-700 hover:bg-slate-100"
                                            >
                                                Ubah
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleDelete(industry.id)}
                                                className="rounded border border-rose-300 px-2 py-1 text-xs text-rose-700 hover:bg-rose-50"
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

export default IndustriesPage;
