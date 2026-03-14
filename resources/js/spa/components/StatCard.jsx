const StatCard = ({ label, value }) => {
    return (
        <article className="surface-card hover-glow p-4 fade-up">
            <p className="text-xs uppercase tracking-wide text-sky-700">{label}</p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">{value}</p>
        </article>
    );
};

export default StatCard;
