import {
  BridgeFetchError,
  fetchBridgeJson,
  resolveBridgeTimeoutMs,
  type BridgeTransportErrorKind,
  type FetchLike,
} from './bridge-fetch.js'
import { type IoValidationIssue, validateIoBridgePayload } from './io-guard.js'
import type { IoBridgePayload } from './io-types.js'

const DEFAULT_IO_TIMEOUT_MS = 10_000
const DEFAULT_IO_DATA_URL = '/data/io.json'

export type IoTransportErrorKind = BridgeTransportErrorKind

export class IoTransportError extends Error {
  kind: IoTransportErrorKind
  status: number | null
  constructor(
    kind: IoTransportErrorKind,
    message: string,
    options?: {
      status?: number | null
      cause?: unknown
    },
  ) {
    super(message, { cause: options?.cause })
    this.name = 'IoTransportError'
    this.kind = kind
    this.status = options?.status ?? null
  }
}

export class IoValidationError extends Error {
  issues: IoValidationIssue[]
  constructor(issues: IoValidationIssue[]) {
    super('IO bridge payload failed schema validation.')
    this.name = 'IoValidationError'
    this.issues = issues
  }
}

function readImportMetaEnv(): {
  dataUrl?: string
  timeoutMs?: string
} {
  const env = (import.meta as ImportMeta & { env?: Record<string, string | undefined> }).env
  return {
    dataUrl: env?.VITE_IO_DATA_URL,
    timeoutMs: env?.VITE_IO_TIMEOUT_MS,
  }
}

function readProcessEnv(): {
  dataUrl?: string
  timeoutMs?: string
} {
  const env = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env
  return {
    dataUrl: env?.VITE_IO_DATA_URL,
    timeoutMs: env?.VITE_IO_TIMEOUT_MS,
  }
}

export function resolveIoDataUrl(): string {
  const metaEnv = readImportMetaEnv()
  const processEnv = readProcessEnv()
  return metaEnv.dataUrl ?? processEnv.dataUrl ?? DEFAULT_IO_DATA_URL
}

export function resolveIoTimeoutMs(): number {
  const metaEnv = readImportMetaEnv()
  const processEnv = readProcessEnv()
  const rawTimeout = metaEnv.timeoutMs ?? processEnv.timeoutMs
  return resolveBridgeTimeoutMs(rawTimeout, DEFAULT_IO_TIMEOUT_MS)
}

export async function fetchIoBridgePayload(fetchImpl: FetchLike = fetch): Promise<IoBridgePayload> {
  const timeoutMs = resolveIoTimeoutMs()

  try {
    const rawPayload = await fetchBridgeJson({
      dataUrl: resolveIoDataUrl(),
      timeoutMs,
      bridgeLabel: 'IO',
      fetchImpl,
    })
    const validation = validateIoBridgePayload(rawPayload)
    if (!validation.ok || !validation.value) {
      throw new IoValidationError(validation.issues)
    }
    return validation.value
  } catch (error) {
    if (error instanceof IoTransportError || error instanceof IoValidationError) throw error

    if (error instanceof BridgeFetchError) {
      throw new IoTransportError(error.kind, error.message, {
        status: error.status,
        cause: error,
      })
    }

    throw new IoTransportError('network', 'IO bridge request failed due to a network error.', {
      cause: error,
    })
  }
}
