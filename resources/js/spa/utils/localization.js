const ROLE_LABELS = {
    admin: 'Admin',
    student: 'Siswa',
    industry: 'Industri',
};

const PLACEMENT_STATUS_LABELS = {
    assigned: 'Ditugaskan',
    active: 'Aktif',
    completed: 'Selesai',
    cancelled: 'Dibatalkan',
};

const JOURNAL_STATUS_LABELS = {
    pending: 'Menunggu',
    verified: 'Terverifikasi',
    rejected: 'Ditolak',
};

const SUMMARY_LABELS = {
    students: 'Siswa',
    industries: 'Industri',
    placements: 'Penempatan',
    journals: 'Jurnal',
    evaluations: 'Penilaian',
};

const TEXT_LABELS = {
    'Total Students in Internship': 'Total Siswa Prakerin',
    'Total Industries': 'Total Industri',
    'Students Submitted Journal Today': 'Siswa Mengumpulkan Jurnal Hari Ini',
    'Students Missing Journal Today': 'Siswa Belum Mengumpulkan Jurnal Hari Ini',
    'Students in Internship': 'Siswa Sedang Prakerin',
    'Submitted Today': 'Terkumpul Hari Ini',
    'Missing Today': 'Belum Terkumpul Hari Ini',
    Placements: 'Penempatan',
    'Total Journals': 'Total Jurnal',
    'Verified Journals': 'Jurnal Terverifikasi',
    'Average Evaluation': 'Rata-rata Penilaian',
    'Assigned Students': 'Siswa Ditugaskan',
    'Active Placements': 'Penempatan Aktif',
    'Evaluations Submitted': 'Penilaian Dikirim',
};

const toLabel = (value) => {
    if (typeof value !== 'string') {
        return '-';
    }

    return value.trim();
};

export const translateText = (value) => {
    const normalized = toLabel(value);

    return TEXT_LABELS[normalized] ?? normalized;
};

export const formatRole = (role) => {
    const normalized = toLabel(role).toLowerCase();

    return ROLE_LABELS[normalized] ?? toLabel(role);
};

export const formatPlacementStatus = (status) => {
    const normalized = toLabel(status).toLowerCase();

    return PLACEMENT_STATUS_LABELS[normalized] ?? toLabel(status);
};

export const formatJournalStatus = (status) => {
    const normalized = toLabel(status).toLowerCase();

    return JOURNAL_STATUS_LABELS[normalized] ?? toLabel(status);
};

export const formatSummaryLabel = (key) => {
    const normalized = toLabel(key).toLowerCase();

    return SUMMARY_LABELS[normalized] ?? toLabel(key);
};

export const formatMonthYear = (value) => {
    const normalized = toLabel(value);
    const match = normalized.match(/^(\d{4})-(\d{2})$/);

    if (!match) {
        return normalized;
    }

    const date = new Date(`${match[1]}-${match[2]}-01T00:00:00Z`);

    if (Number.isNaN(date.getTime())) {
        return normalized;
    }

    return new Intl.DateTimeFormat('id-ID', {
        month: 'long',
        year: 'numeric',
        timeZone: 'UTC',
    }).format(date);
};
