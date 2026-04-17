# Frontend Replatform Shared Data Contract (MVP Draft)

## Contract Principles

- One normalized UI contract across all model adapters.
- Versioned schema from day one.
- Explicit uncertainty, caveats, and source metadata.
- Backward compatibility for saved scenarios.

## Schema Version

- `schema_version`: string (example: `1.0.0`)

## Core Objects

## `Scenario`

- `scenario_id`: string
- `scenario_name`: string
- `scenario_type`: enum (`baseline` | `alternative` | `stress`)
- `tags`: string[]
- `description`: string
- `created_at`: ISO datetime string
- `updated_at`: ISO datetime string
- `created_by`: string
- `assumptions`: `Assumption[]`
- `model_ids`: string[]

## `Assumption`

- `key`: string
- `label`: string
- `value`: number | string | boolean
- `unit`: string
- `category`: enum (`macro` | `external` | `fiscal` | `trade` | `advanced`)
- `technical_variable`: string | null

## `HeadlineMetric`

- `metric_id`: string
- `label`: string
- `value`: number
- `unit`: string
- `period`: string
- `baseline_value`: number | null
- `delta_abs`: number | null
- `delta_pct`: number | null
- `direction`: enum (`up` | `down` | `flat`)
- `confidence`: enum (`high` | `medium` | `low`) | null
- `last_updated`: ISO datetime string
- `model_attribution`: `ModelAttribution[]`

## `ChartSpec`

- `chart_id`: string
- `title`: string
- `subtitle`: string
- `chart_type`: enum (`line` | `bar` | `area` | `combo`)
- `x`: `ChartAxis`
- `y`: `ChartAxis`
- `series`: `ChartSeries[]`
- `view_mode`: enum (`level` | `delta` | `risk`) | null
- `uncertainty`: `UncertaintyBand[]`
- `takeaway`: string
- `model_attribution`: `ModelAttribution[]`

## `ChartAxis`

- `label`: string
- `unit`: string
- `values`: (string | number)[]

## `ChartSeries`

- `series_id`: string
- `label`: string
- `semantic_role`: enum (`baseline` | `alternative` | `downside` | `upside` | `other`)
- `values`: number[]

## `UncertaintyBand`

- `series_id`: string
- `lower`: number[]
- `upper`: number[]
- `confidence_level`: number
- `methodology_label`: string
- `is_illustrative`: boolean

## `NarrativeBlock`

- `summary`: string
- `key_findings`: string[]
- `risks`: string[]
- `policy_implications`: string[]
- `recommendations`: string[]
- `uncertainty_note`: string
- `generated_at`: ISO datetime string
- `generation_mode`: enum (`template` | `assisted`)

## `Caveat`

- `caveat_id`: string
- `severity`: enum (`info` | `warning` | `critical`)
- `message`: string
- `affected_metrics`: string[]
- `affected_models`: string[]

## `ModelAttribution`

- `model_id`: string
- `model_name`: string
- `module`: string
- `version`: string
- `run_id`: string
- `data_version`: string
- `timestamp`: ISO datetime string

## Envelope Shapes

## `ScenarioResult`

- `scenario`: `Scenario`
- `headline_metrics`: `HeadlineMetric[]`
- `charts`: `ChartSpec[]`
- `tables`: object[]
- `narrative`: `NarrativeBlock`
- `caveats`: `Caveat[]`
- `references`: string[]

## `ApiError`

- `error_code`: string
- `message`: string
- `severity`: enum (`info` | `warning` | `error`)
- `recoverable`: boolean
- `affected_module`: string
- `suggested_action`: string | null

## Compatibility Rules

- Breaking changes require schema version increment and migration note.
- Saved scenario payloads from older versions must be migratable.
- Unknown fields should be safely ignored by UI readers when possible.
