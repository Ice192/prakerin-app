const ChartCard = ({ title, description, children }) => {
    return (
        <section className="surface-card p-4 hover-glow fade-up">
            <div className="mb-3">
                <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
                {description ? <p className="mt-1 text-xs text-slate-500">{description}</p> : null}
            </div>
            {children}
        </section>
    );
};

export default ChartCard;
