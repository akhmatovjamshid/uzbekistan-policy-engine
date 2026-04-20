import type { ChartSpec } from '../../contracts/data-contract'
import { ChartRenderer } from '../system/ChartRenderer'

type NowcastForecastBlockProps = {
  chart: ChartSpec
}

export function NowcastForecastBlock({ chart }: NowcastForecastBlockProps) {
  return (
    <section className="overview-panel overview-panel--primary" aria-label="Nowcast and forecast">
      <ChartRenderer
        spec={chart}
        ariaLabel={`${chart.title}. ${chart.takeaway}`}
      />

      <div className="sr-only">
        <table className="overview-nowcast-series">
          <caption>{chart.title}</caption>
          <thead>
            <tr>
              <th scope="col">Period</th>
              {chart.series.map((series) => (
                <th key={series.series_id} scope="col">
                  {series.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {chart.x.values.map((period, index) => {
              return (
                <tr key={period.toString()}>
                  <th scope="row">{period}</th>
                  {chart.series.map((series) => {
                    const value = series.values[index]
                    return <td key={`${series.series_id}-${period}`}>{Number.isFinite(value) ? `${value.toFixed(1)}%` : 'n/a'}</td>
                  })}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </section>
  )
}
