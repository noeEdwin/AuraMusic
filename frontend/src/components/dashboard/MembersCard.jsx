import { members } from '../../data/dashboardData'
import { Icon } from '../ui/Icon'

export function MembersCard() {
  return (
    <section className="panel info-panel">
      <h3>
        <Icon type="user" />
        Integrantes
      </h3>

      <div className="member-list">
        {members.map((member) => (
          <div key={member.name} className="member-item">
            <div className={`member-avatar${member.highlight ? ' highlighted' : ''}`}>{member.initials}</div>
            <div className="member-copy">
              <span className="member-name">{member.name}</span>
              <span className="member-role">{member.role}</span>
            </div>
            <span className={`member-status${member.online ? ' online' : ''}`}>{member.status}</span>
          </div>
        ))}
      </div>
    </section>
  )
}
