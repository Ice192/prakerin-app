const DONUT_COLORS = ['#16a34a', '#dc2626', '#0284c7', '#f59e0b', '#7c3aed'];

const normalizeData = (data) => {
    if (!Array.isArray(data)) {
        return [];
    }

    return data
        .map((item) => ({
            label: item?.label ?? '',
            value: Number(item?.value ?? 0),
        }))
        .filter((item) => item.label !== '');
};

const buildConicGradient = (data, total) => {
    if (total <= 0) {
        return '#e2e8f0';
    }

    let currentStop = 0;
    const slices = data.map((item, index) => {
        const percentage = (item.value / total) * 100;
        const nextStop = currentStop + percentage;
        const color = DONUT_COLORS[index % DONUT_COLORS.length];
        const slice = `${color} ${currentStop}% ${nextStop}%`;

        currentStop = nextStop;
        return slice;
    });

    return `conic-gradient(${slices.join(', ')})`;
};

const SimpleDonutChart = ({ data }) => {
    const normalized = normalizeData(data);
    const total = normalized.reduce((sum, item) => sum + item.value, 0);
    const chartBackground = buildConicGradient(normalized, total);

    if (normalized.length === 0) {
        return <p className="text-sm text-slate-500">Data grafik belum tersedia.</p>;
    }

    return (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center fade-up">
            <div
                className="relative h-36 w-36 rounded-full transition-transform duration-300 hover:scale-[1.02]"
                style={{ background: chartBackground }}
                aria-label="Grafik ringkasan jurnal"
            >
                <div className="absolute inset-[18px] flex items-center justify-center rounded-full bg-white text-sm font-semibold text-slate-900">
                    {total}
                </div>
            </div>

            <ul className="space-y-2 text-sm text-slate-700">
                {normalized.map((item, index) => (
                    <li key={item.label} className="flex items-center gap-2">
                        <span
                            className="inline-block h-2.5 w-2.5 rounded-full"
                            style={{ backgroundColor: DONUT_COLORS[index % DONUT_COLORS.length] }}
                        />
                        <span className="flex-1">{item.label}</span>
                        <span className="font-semibold text-slate-900">{item.value}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default SimpleDonutChart;
