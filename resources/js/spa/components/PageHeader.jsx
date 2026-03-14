const PageHeader = ({ title, description }) => {
    return (
        <div className="mb-5 fade-up">
            <h2 className="page-title">{title}</h2>
            {description ? <p className="page-subtitle">{description}</p> : null}
        </div>
    );
};

export default PageHeader;
