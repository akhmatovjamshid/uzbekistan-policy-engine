import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { renderToStaticMarkup } from 'react-dom/server'
import { AttributionBadge } from '../../../src/components/system/AttributionBadge.js'

describe('AttributionBadge', () => {
  it('normalizes model identifiers into compact uppercase codes', () => {
    const qpmMarkup = renderToStaticMarkup(<AttributionBadge modelId="QPM" />)
    const slugMarkup = renderToStaticMarkup(<AttributionBadge modelId="scenario-lab-mock-engine" />)
    const snakeMarkup = renderToStaticMarkup(<AttributionBadge modelId="dfm_nowcast" />)

    assert.match(qpmMarkup, />QPM</)
    assert.match(slugMarkup, />SCENARIO</)
    assert.match(snakeMarkup, />DFM</)
  })
})
