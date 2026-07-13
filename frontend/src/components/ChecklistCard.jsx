function ChecklistCard({ data }) {

    if (!data || data.error) return null;

    return (
        <div className="checklist-card">

            <h3>{data.service}</h3>

            <h4>Required Documents</h4>

            <ul>
                {data.documents.map((doc, index) => (
                    <li key={index}>✅ {doc}</li>
                ))}
            </ul>

            <p><strong>Fees:</strong> {data.fees}</p>

            <p><strong>Processing Time:</strong> {data.processing_time}</p>

            <a
                href={data.official_website}
                target="_blank"
                rel="noreferrer"
            >
                Visit Official Website
            </a>

        </div>
    );
}

export default ChecklistCard;