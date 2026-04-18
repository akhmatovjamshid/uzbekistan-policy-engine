import type { MacroSnapshot } from '../../contracts/data-contract'
import {
  toMacroSnapshot,
  validateRawOverviewPayload,
  type OverviewValidationIssue,
} from '../adapters'
import { overviewV1Data } from '../mock/overview'
import { overviewLiveRawMock } from '../raw/overview-live'

export type OverviewDataMode = 'mock' | 'live'
export type OverviewSourceStatus = 'loading' | 'ready' | 'error'

export type OverviewSourceState = {
  status: OverviewSourceStatus
  mode: OverviewDataMode
  snapshot: MacroSnapshot | null
  error: string | null
  canRetry: boolean
  warnings: OverviewValidationIssue[]
}

function resolveOverviewDataMode(): OverviewDataMode {
  return import.meta.env.VITE_OVERVIEW_DATA_MODE === 'live' ? 'live' : 'mock'
}

export function getOverviewDataMode(): OverviewDataMode {
  return resolveOverviewDataMode()
}

function buildReadyState(
  mode: OverviewDataMode,
  snapshot: MacroSnapshot,
  warnings: OverviewValidationIssue[] = [],
): OverviewSourceState {
  return {
    status: 'ready',
    mode,
    snapshot,
    error: null,
    canRetry: mode === 'live',
    warnings,
  }
}

function buildErrorState(
  mode: OverviewDataMode,
  error: string,
  warnings: OverviewValidationIssue[] = [],
): OverviewSourceState {
  return {
    status: 'error',
    mode,
    snapshot: null,
    error,
    canRetry: true,
    warnings,
  }
}

export function getInitialOverviewSourceState(): OverviewSourceState {
  return {
    status: 'loading',
    mode: resolveOverviewDataMode(),
    snapshot: null,
    error: null,
    canRetry: false,
    warnings: [],
  }
}

async function getRawOverviewPayload(): Promise<unknown> {
  return overviewLiveRawMock
}

export async function loadOverviewSourceState(): Promise<OverviewSourceState> {
  const mode = resolveOverviewDataMode()
  if (mode === 'mock') {
    return buildReadyState(mode, overviewV1Data)
  }

  try {
    const rawPayload = await getRawOverviewPayload()
    const validation = validateRawOverviewPayload(rawPayload)
    if (!validation.ok) {
      const firstError = validation.issues.find((issue) => issue.severity === 'error')
      return buildErrorState(mode, firstError?.message ?? 'Invalid overview payload.', validation.issues)
    }

    const snapshot = toMacroSnapshot(validation.value)
    return buildReadyState(mode, snapshot, validation.issues)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to load overview payload.'
    return buildErrorState(mode, message)
  }
}

export async function retryOverviewSourceState(): Promise<OverviewSourceState> {
  return loadOverviewSourceState()
}
