function RecommendationSummary({ summary }) {
  if (!summary) return null;

  return (
    <div className="summary-card">
      <div className="summary-header">
        🤖 <h3>AI Recommendation Summary</h3>
      </div>

      <p>{summary}</p>
    </div>
  );
}

export default RecommendationSummary;