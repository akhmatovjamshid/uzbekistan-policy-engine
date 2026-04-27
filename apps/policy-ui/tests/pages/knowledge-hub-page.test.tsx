import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { describe, it } from 'node:test'
import { fileURLToPath } from 'node:url'

const KNOWLEDGE_HUB_PAGE_SOURCE = fileURLToPath(
  new URL('../../../src/pages/KnowledgeHubPage.tsx', import.meta.url),
)

describe('Knowledge Hub page', () => {
  it('routes the page through PendingSurface instead of static reform and brief cards', () => {
    const source = readFileSync(KNOWLEDGE_HUB_PAGE_SOURCE, 'utf8')

    assert.match(source, /<PendingSurface/)
    assert.match(source, /knowledgeHub\.pending\.message/)
    assert.match(source, /knowledgeHub\.pending\.reason/)
    assert.doesNotMatch(source, /KnowledgeHubContentView/)
    assert.doesNotMatch(source, /loadKnowledgeHubSourceState/)
    assert.doesNotMatch(source, /TrustStateLabel/)
  })
})
