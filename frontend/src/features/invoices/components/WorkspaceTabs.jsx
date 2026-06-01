import { PANEL_KEYS } from "../constants";

function WorkspaceTabs({ mode, activePanel, onChange }) {
  if (mode === "purchase") {
    return null;
  }

  const tabs = [
    {
      key: PANEL_KEYS.SALES,
      label: "Sell Parts",
    },
    {
      key: PANEL_KEYS.EMAIL,
      label: "Email",
    },
  ];

  return (
    <div className="workspace-tabs" role="tablist" aria-label="Invoice tools">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          className={activePanel === tab.key ? "selected" : ""}
          onClick={() => onChange(tab.key)}
          type="button"
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

export default WorkspaceTabs;
