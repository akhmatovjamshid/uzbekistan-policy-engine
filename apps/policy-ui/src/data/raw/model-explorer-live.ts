import type { RawModelExplorerPayload } from '../adapters'
import { modelExplorerWorkspaceMock } from '../mock/model-explorer.js'

export const modelExplorerLiveRawMock: RawModelExplorerPayload = {
  workspaceId: 'model-explorer-live-2026q2',
  generatedAt: modelExplorerWorkspaceMock.generated_at,
  defaultModelId: modelExplorerWorkspaceMock.default_model_id,
  catalog: modelExplorerWorkspaceMock.models.map((model) => ({
    id: model.model_id,
    name: model.model_name,
    type: model.model_type,
    frequency: model.frequency,
    status: model.status,
    summary: model.summary,
  })),
  metadataByModelId: Object.fromEntries(
    Object.entries(modelExplorerWorkspaceMock.details_by_model_id).map(([modelId, detail]) => [
      modelId,
      {
        modelId: detail.model_id,
        overview: detail.overview,
        assumptions: detail.assumptions.map((item) => ({
          id: item.assumption_id,
          label: item.label,
          value: item.value,
          rationale: item.rationale,
        })),
        equations: detail.equations.map((item) => ({
          id: item.equation_id,
          title: item.title,
          expression: item.expression,
          explanation: item.explanation,
        })),
        caveats: detail.caveats.map((item) => ({
          id: item.caveat_id,
          severity: item.severity,
          message: item.message,
          implication: item.implication,
        })),
        dataSources: detail.data_sources.map((item) => ({
          id: item.source_id,
          name: item.name,
          provider: item.provider,
          frequency: item.frequency,
          vintage: item.vintage,
          note: item.note,
        })),
      },
    ]),
  ),
}
