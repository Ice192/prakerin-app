const BAR_COLORS = ['#0f766e', '#0284c7', '#f97316', '#ef4444', '#7c3aed'];

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

const SimpleBarChart = ({ data }) => {
    const normalized = normalizeData(data);
    const maxValue = Math.max(...normalized.map((item) => item.value), 1);

    if (normalized.length === 0) {
        return <p className="text-sm text-slate-500">No chart data available.</p>;
    }

    return (
        <div className="space-y-3">
            {normalized.map((item, index) => (
                <div key={item.label} className="space-y-1">
                    <div className="flex items-center justify-between text-xs text-slate-600">
                        <span>{item.label}</span>
                        <span className="font-semibold text-slate-900">{item.value}</span>
                    </div>
                    <div className="h-2.5 rounded-full bg-slate-100">
                        <div
                            className="h-2.5 rounded-full"
                            style={{
                                width: `${Math.max((item.value / maxValue) * 100, 0)}%`,
                                backgroundColor: BAR_COLORS[index % BAR_COLORS.length],
                            }}
                        />
                    </div>
                </div>
            ))}
        </div>
    );
};

export default SimpleBarChart;
