export interface QueryExplanation {
  section: string
  explanation: string
}

export interface Config {
  chartType: "bar" | "line" | "pie" | "donut"
  title: string
  categoryKey?: string
  valueKey?: string
  seriesKeys?: string[]
}
