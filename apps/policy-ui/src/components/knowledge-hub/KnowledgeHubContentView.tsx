import type { KnowledgeHubContent } from '../../contracts/data-contract.js'
import { ReformCandidateList } from './ReformCandidateList.js'

type KnowledgeHubContentViewProps = {
  content: KnowledgeHubContent
}

export function KnowledgeHubContentView({ content }: KnowledgeHubContentViewProps) {
  const candidates = content.candidates ?? []

  return (
    <>
      <div className="knowledge-hub-intake-banner">
        <strong>Not an official reviewed policy database.</strong>
        <span>
          These items are deterministic source-extracted candidates. They remain unreviewed until a
          human owner verifies the source, policy interpretation, and database eligibility.
        </span>
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
