import {
  FaBriefcase,
  FaEdit,
  FaShieldAlt,
  FaTrashAlt,
  FaUsers,
} from 'react-icons/fa'
import { MetricCard } from '../../components/ui/MetricCard'
import { PanelHeader } from '../../components/ui/PanelHeader'
import { StatusPill } from '../../components/ui/StatusPill'
import { formatDate, formatMoney, formatNumber, initials } from '../../utils/formatters'
import { hasRole } from '../../utils/staff'

export function StaffView({ staffMembers, onEdit, onDelete }) {
  return (
    <>
      <div className="metrics-grid staff-metrics">
        <MetricCard
          label="Total Staff"
          value={formatNumber(staffMembers.length)}
          icon={FaUsers}
          tone="info"
        />
        <MetricCard
          label="Admins"
          value={formatNumber(
            staffMembers.filter((member) => hasRole(member, 'Admin')).length,
          )}
          icon={FaShieldAlt}
          tone="indigo"
        />
        <MetricCard
          label="Operations Staff"
          value={formatNumber(
            staffMembers.filter((member) => hasRole(member, 'Staff')).length,
          )}
          icon={FaBriefcase}
          tone="success"
        />
      </div>

      <section className="panel table-panel">
        <PanelHeader title="Staff Profile Management" action="Admin" />
        <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th>Staff</th>
                <th>Position</th>
                <th>Role</th>
                <th>Phone</th>
                <th>Salary</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {staffMembers.map((member) => (
                <tr key={member.staffId}>
                  <td>
                    <div className="person-cell">
                      <div className="avatar">{initials(member.email)}</div>
                      <div>
                        <strong>{member.email}</strong>
                        <span>ID: {member.staffId}</span>
                      </div>
                    </div>
                  </td>
                  <td>{member.position}</td>
                  <td>
                    <StatusPill status={member.roles?.[0] || 'Staff'} />
                  </td>
                  <td>{member.phoneNumber || 'Not set'}</td>
                  <td>{formatMoney(member.salary)}</td>
                  <td>{formatDate(member.joinedDate)}</td>
                  <td>
                    <div className="row-actions">
                      <button
                        className="icon-button small"
                        type="button"
                        title="Edit staff"
                        aria-label={`Edit ${member.email}`}
                        onClick={() => onEdit(member)}
                      >
                        <FaEdit size={16} />
                      </button>
                      <button
                        className="icon-button small danger"
                        type="button"
                        title="Delete staff"
                        aria-label={`Delete ${member.email}`}
                        onClick={() => onDelete(member.staffId)}
                      >
                        <FaTrashAlt size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  )
}
