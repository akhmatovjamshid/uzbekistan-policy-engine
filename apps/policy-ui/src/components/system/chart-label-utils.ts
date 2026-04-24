import type { ChartSpec, UncertaintyBand } from '../../contracts/data-contract.js'

export type BandMeta = {
  band: UncertaintyBand
  lowerKey: string
  upperKey: string
  name: string
  patternId: string
}

/**
 * Converts ASCII methodology labels to their Unicode-rendered form
 * for user-visible display. Raw ASCII is preserved in data flow
 * (diff-stable, byte-stable across bridge JSON updates); Unicode
 * rendering is a view-layer concern invoked at display sites.
 *
 * Platform convention: ChartSpec.uncertainty[*].methodology_label
 * carries ASCII throughout the data layer. ChartRenderer invokes
 * this helper at any site that surfaces the label to users
 * (tooltip, caption, legend). Other consumers (logs, debug output,
 * exports) hold ASCII.
 */
export function prettyPrintMethodologyLabel(raw: string): string {
  return raw
    .replace(/\bsqrt\(/g, '√(')
    .replace(/\bsigma\b/g, 'σ')
    .replace(/ \* /g, ' × ')
}

export function toBandMeta(spec: ChartSpec): BandMeta[] {
  return spec.uncertainty.map((band) => {
    const prettyLabel = prettyPrintMethodologyLabel(band.methodology_label)
    return {
      band,
      lowerKey: `band__${band.series_id}__${band.confidence_level}__lower`,
      upperKey: `band__${band.series_id}__${band.confidence_level}__upper`,
      name: band.is_illustrative
        ? `(illustrative) ${band.confidence_level}% ${prettyLabel}`
        : `${band.confidence_level}% ${prettyLabel}`,
      patternId: `band__${spec.chart_id}__${band.series_id}__illustrative`,
    }
  })
}
