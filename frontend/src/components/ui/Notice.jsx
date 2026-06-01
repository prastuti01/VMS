import { FaTimes } from 'react-icons/fa'

export function Notice({ children, icon: Icon, tone = 'info', onDismiss }) {
  return (
    <div className={`notice ${tone}-notice`}>
      {Icon && <Icon size={18} />}
      <span>{children}</span>
      {onDismiss && (
        <button
          className="ghost-icon"
          type="button"
          aria-label="Dismiss message"
          onClick={onDismiss}
        >
          <FaTimes size={16} />
        </button>
      )}
    </div>
  )
}
