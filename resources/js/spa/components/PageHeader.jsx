const PageHeader = ({ title, description }) => {
    return (
        <div className="mb-5">
            <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
            {description ? <p className="mt-1 text-sm text-slate-600">{description}</p> : null}
        </div>
    );
};

export default PageHeader;
