import { Link } from 'react-router-dom'
import type { OverviewAnalysisAction } from '../../contracts/data-contract'

type QuickActionsProps = {
  actions: OverviewAnalysisAction[]
}

export function QuickActions({ actions }: QuickActionsProps) {
  return (
    <section className="overview-actions-section" aria-labelledby="overview-actions-title">
      <div className="overview-section-head page-section-head">
        <h2 id="overview-actions-title">Quick actions</h2>
        <p>Direct entry points from monitoring to scenario analysis.</p>
      </div>

      <div className="overview-actions-grid">
        {actions.length === 0 ? (
          <p className="empty-state">No quick actions are configured for this snapshot.</p>
        ) : (
          actions.map((action) => (
            <Link
              key={action.action_id}
              className="overview-action-card"
              to={`/scenario-lab?${action.scenario_query}`}
            >
              <span className="overview-action-card__title">{action.title}</span>
              <small className="overview-action-card__summary">{action.summary}</small>
            </Link>
          ))
        )}
      </div>
    </section>
  )
}
