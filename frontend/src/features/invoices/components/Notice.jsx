import { CheckCircle2 } from "lucide-react";

function Notice({ type, message, onDismiss }) {
  return (
    <div className={`notice ${type}`} role="status">
      <CheckCircle2 size={20} />
      <span>{message}</span>
      <button type="button" onClick={onDismiss} aria-label="Dismiss">
        x
      </button>
    </div>
  );
}

export default Notice;
