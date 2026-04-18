import type { OverviewRisk } from '../../contracts/data-contract'

type RiskPanelProps = {
  risks: OverviewRisk[]
}

export function RiskPanel({ risks }: RiskPanelProps) {
  return (
    <section className="overview-panel overview-panel--companion" aria-labelledby="overview-risks-title">
      <div className="overview-section-head page-section-head">
        <h2 id="overview-risks-title">Top Risks to Monitor</h2>
        <p>Three near-term risks that most affect baseline interpretation.</p>
      </div>

      <div className="overview-risk-list">
        {risks.length === 0 ? (
          <p className="empty-state">No active risks are flagged for this snapshot.</p>
        ) : (
          risks.map((risk) => (
            <article key={risk.risk_id} className="overview-risk-card">
              <h3>{risk.title}</h3>
              <p>{risk.why_it_matters}</p>
              <dl>
                <div>
                  <dt>Impact channel</dt>
                  <dd>{risk.impact_channel}</dd>
                </div>
                <div>
                  <dt>Suggested test</dt>
                  <dd>{risk.suggested_scenario}</dd>
                </div>
              </dl>
            </article>
          ))
        )}
      </div>
    </section>
  )
}
