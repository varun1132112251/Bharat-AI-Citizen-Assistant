const actions = [
  { icon: "🌾", label: "Farmer", query: "I am a farmer" },
  { icon: "🎓", label: "Student", query: "I am a student" },
  { icon: "🏥", label: "Health", query: "Health schemes" },
  { icon: "👩", label: "Women", query: "Schemes for women" },
  { icon: "🏠", label: "Housing", query: "Housing schemes" },
  { icon: "💼", label: "Employment", query: "Employment schemes" },
  { icon: "📄", label: "Certificates", query: "Required certificates" },
  { icon: "🏢", label: "Business", query: "Business schemes" },
];

function QuickActions({ onSelect }) {
  return (
    <div className="quick-actions">

      <h3>⚡ Quick Actions</h3>

      <div className="quick-grid">

        {actions.map((action) => (
          <button
            key={action.label}
            className="quick-card"
            onClick={() => onSelect(action.query)}
          >
            <span className="icon">{action.icon}</span>

            <span className="label">{action.label}</span>

          </button>
        ))}

      </div>

    </div>
  );
}

export default QuickActions;