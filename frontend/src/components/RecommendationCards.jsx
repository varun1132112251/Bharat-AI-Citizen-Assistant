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

                <div>
                  <h3>🌾 {scheme.name}</h3>

                  <p className="scheme-category">
                      {scheme.category}
                  </p>
                </div>

                <div className="score-badge">
                  ⭐ {item.score}
                </div>

              </div>
              <p className="description">
                {scheme.description}
              </p>

              <div className="card-section">

                <strong>🎁 Benefits</strong>

                <ul>
                  {scheme.benefits.slice(0,3).map((benefit, index) => (
                    <li key={index}>✅ {benefit}</li>
                  ))}
                </ul>

              </div>

              <div className="card-section">
                <strong>📄 Documents Required</strong>

                <p className="doc-count">
                  {scheme.documents.length} document(s)
                </p>
              </div>

              <a
                className="apply-btn"
                href={scheme.official_link}
                target="_blank"
                rel="noreferrer"
              >
                🌐 Visit Official Website
              </a>

            </div>

          );

        })}

      </div>

    </div>
  );
}

export default RecommendationCards;