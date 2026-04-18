import type { MacroSnapshot } from '../../contracts/data-contract'
import { toMacroSnapshot } from '../adapters'
import { overviewV1Data } from '../mock/overview'
import { overviewLiveRawMock } from '../raw/overview-live'

export type OverviewDataMode = 'mock' | 'live'

function resolveOverviewDataMode(): OverviewDataMode {
  return import.meta.env.VITE_OVERVIEW_DATA_MODE === 'live' ? 'live' : 'mock'
}

export function getOverviewDataMode(): OverviewDataMode {
  return resolveOverviewDataMode()
}

export function getOverviewSnapshot(): MacroSnapshot {
  if (resolveOverviewDataMode() === 'live') {
    return toMacroSnapshot(overviewLiveRawMock)
  }

  return overviewV1Data
}

