function RecommendationCards({ recommendations }) {
  if (!recommendations || recommendations.length === 0) {
    return null;
  }

  return (
    <div className="recommendation-container">

      <h2 className="recommendation-title">
        🌟 Recommended Government Schemes
      </h2>

      <div className="recommendation-grid">

        {recommendations.map((item) => {

          const scheme = item.scheme;

          return (

            <div
              className="recommendation-card"
              key={scheme.id}
            >

              <div className="card-header">

                <h3>🌾{scheme.name}</h3>

                <span className="category-badge">
                  {scheme.category}
                </span>

              </div>

              <p className="description">
                {scheme.description}
              </p>
              <p className="score">
              ⭐ Match Score: {item.score}
              </p>

              <div className="card-section">

                <strong>🎁 Benefits</strong>

                <ul>
                  {scheme.benefits.map((benefit, index) => (
                    <li key={index}>✅ {benefit}</li>
                  ))}
                </ul>

              </div>

              <div className="card-section">

                <strong>📄 Required Documents</strong>

                <ul>
                  {scheme.documents.map((doc, index) => (
                    <li key={index}>📄 {doc}</li>
                  ))}
                </ul>

              </div>

              <a
                className="apply-btn"
                href={scheme.official_link}
                target="_blank"
                rel="noreferrer"
              >
                Apply / Official Website →
              </a>

            </div>

          );

        })}

      </div>

    </div>
  );
}

export default RecommendationCards;