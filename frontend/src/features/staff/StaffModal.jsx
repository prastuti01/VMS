import { useState } from 'react'
import { FaCheckCircle, FaTimes } from 'react-icons/fa'
import { toInputDate } from '../../utils/formatters'

export function StaffModal({
  staff,
  errorMessage = '',
  isSaving = false,
  onClose,
  onSave,
}) {
  const isEditing = Boolean(staff.staffId)
  const [form, setForm] = useState({
    staffId: staff.staffId,
    userId: staff.userId,
    email: staff.email || '',
    password: '',
    phoneNumber: staff.phoneNumber || '',
    position: staff.position || '',
    salary: staff.salary || '',
    joinedDate: toInputDate(staff.joinedDate) || toInputDate(new Date()),
    role: staff.roles?.[0] || 'Staff',
  })

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <form
        className="modal"
        onMouseDown={(event) => event.stopPropagation()}
        onSubmit={(event) => {
          event.preventDefault()
          onSave(form)
        }}
      >
        <div className="modal-header">
          <div>
            <h2>{isEditing ? 'Edit Staff Profile' : 'Add Staff Profile'}</h2>
            {isEditing && <span>{staff.email}</span>}
          </div>
          <button
            className="ghost-icon"
            type="button"
            aria-label="Close"
            onClick={onClose}
          >
            <FaTimes size={18} />
          </button>
        </div>

        <div className="form-grid">
          {errorMessage && (
            <div className="form-alert" role="alert">
              {errorMessage}
            </div>
          )}
          <label>
            Email
            <input
              required
              type="email"
              value={form.email}
              onChange={(event) => updateField('email', event.target.value)}
            />
          </label>
          {!isEditing && (
            <label>
              Password
              <input
                required
                minLength={8}
                type="password"
                value={form.password}
                onChange={(event) => updateField('password', event.target.value)}
              />
            </label>
          )}
          <label>
            Phone
            <input
              value={form.phoneNumber}
              onChange={(event) => updateField('phoneNumber', event.target.value)}
            />
          </label>
          <label>
            Position
            <input
              required
              value={form.position}
              onChange={(event) => updateField('position', event.target.value)}
            />
          </label>
          <label>
            Salary
            <input
              min="0"
              type="number"
              value={form.salary}
              onChange={(event) => updateField('salary', event.target.value)}
            />
          </label>
          <label>
            Joined Date
            <input
              type="date"
              value={form.joinedDate}
              onChange={(event) => updateField('joinedDate', event.target.value)}
            />
          </label>
          <label>
            Role
            <select
              value={form.role}
              onChange={(event) => updateField('role', event.target.value)}
            >
              <option>Staff</option>
              <option>Admin</option>
            </select>
          </label>
        </div>

        <div className="modal-actions">
          <button className="secondary-button" type="button" onClick={onClose}>
            Cancel
          </button>
          <button className="primary-button" type="submit" disabled={isSaving}>
            <FaCheckCircle size={18} />
            {isSaving ? 'Saving...' : 'Save Profile'}
          </button>
        </div>
      </form>
    </div>
  )
}
