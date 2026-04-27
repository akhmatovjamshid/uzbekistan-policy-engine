# Overview Exporter

`overview_source_snapshot.json` is a non-public draft scaffold. Do not generate or commit
`apps/policy-ui/public/data/overview.json` from it until every metric has:

- owner-accepted value,
- exact `source_reference` or release URL,
- completed arithmetic checks.

Additional export gates:

- USD/UZS MoM and YoY must reconcile with the level and previous values.
- Trade balance unit must be resolved to either USD million or USD billion.
