import type { KnowledgeHubContent } from '../../contracts/data-contract.js'
import { ReformCandidateList } from './ReformCandidateList.js'

type KnowledgeHubContentViewProps = {
  content: KnowledgeHubContent
}

export function KnowledgeHubContentView({ content }: KnowledgeHubContentViewProps) {
  const candidates = content.candidates ?? []
  const modeLabel = content.extraction_mode_label ?? 'Candidate intake'
  const isFixtureDemo = content.extraction_mode === 'fixture-demo'

  return (
    <>
      <div className="knowledge-hub-intake-banner">
        <strong>Not an official reviewed policy database.</strong>
        <span>
          These items are deterministic source-extracted candidates. They remain unreviewed until a
          human owner verifies the source, policy interpretation, and database eligibility.
        </span>
        {isFixtureDemo ? (
          <span>
            Fixture/demo intake: this public artifact was generated from checked-in HTML fixtures
            for deterministic review and smoke testing, not from a live source fetch.
          </span>
        ) : (
          <span>{modeLabel}: this public artifact was generated from configured source URLs.</span>
        )}
      </div>
      <ReformCandidateList candidates={candidates} />
      {content.caveats && content.caveats.length > 0 ? (
        <section aria-labelledby="knowledge-hub-caveats-title" className="knowledge-hub-caveats">
          <h2 id="knowledge-hub-caveats-title">Intake caveats</h2>
          <ul>
            {content.caveats.map((caveat) => (
              <li key={caveat}>{caveat}</li>
            ))}
          </ul>
        </section>
      ) : null}
    </>
  )
}
