// "use client"

// import type { Config } from "@/types/otf"
// import { BarChart, LineChart, PieChart, } from "recharts"
// import { AlertCircle } from "lucide-react"

// interface ChartVisualizationProps {
//   config: Config
//   data: any[]
// }

// export default function ChartVisualization({ config, data }: ChartVisualizationProps) {
//   // Process data according to chart type
//   const processedData = data.map((item) => {
//     const result: Record<string, any> = {}
//     if (config.categoryKey) {
//       result[config.categoryKey] = item[config.categoryKey]
//     }
//     if (config.valueKey) {
//       result[config.valueKey] = item[config.valueKey]
//     }
//     if (config.seriesKeys) {
//       config.seriesKeys.forEach((key) => {
//         result[key] = item[key]
//       })
//     }
//     return result
//   })

//   // Render the appropriate chart based on config
//   switch (config.chartType) {
//     case "bar":
//       return (
//         <div>
//           <h3 className="text-lg font-medium mb-4">{config.title}</h3>
//           <BarChart
//             data={processedData}
//             index={config.categoryKey}
//             categories={config.seriesKeys || [config.valueKey || ""]}
//             colors={["orange", "blue", "green", "red", "purple"]}
//             yAxisWidth={48}
//             showLegend={true}
//           />
//         </div>
//       )
//     case "line":
//       return (
//         <div>
//           <h3 className="text-lg font-medium mb-4">{config.title}</h3>
//           <LineChart
//             data={processedData}
//             index={config.categoryKey}
//             categories={config.seriesKeys || [config.valueKey || ""]}
//             colors={["orange", "blue", "green", "red", "purple"]}
//             yAxisWidth={48}
//             showLegend={true}
//           />
//         </div>
//       )
//     case "pie":
//       return (
//         <div>
//           <h3 className="text-lg font-medium mb-4">{config.title}</h3>
//           <PieChart
//             data={processedData}
//             index={config.categoryKey}
//             category={config.valueKey || ""}
//             colors={["orange", "blue", "green", "red", "purple", "amber", "indigo", "rose", "cyan", "emerald"]}
//           />
//         </div>
//       )
//     case "donut":
//       return (
//         <div>
//           <h3 className="text-lg font-medium mb-4">{config.title}</h3>
//           <DonutChart
//             data={processedData}
//             index={config.categoryKey}
//             category={config.valueKey || ""}
//             colors={["orange", "blue", "green", "red", "purple", "amber", "indigo", "rose", "cyan", "emerald"]}
//           />
//         </div>
//       )
//     default:
//       return <ChartError message="Unsupported chart type" />
//   }
// }

// export function ChartLoading() {
//   return (
//     <div className="flex flex-col items-center justify-center py-12">
//       <div className="mb-4 w-12 h-12 rounded-full border-4 border-orange-200 border-t-orange-500 animate-spin"></div>
//       <p className="text-gray-600">Generating visualization...</p>
//     </div>
//   )
// }

// export function ChartError({ message }: { message: string }) {
//   return (
//     <div className="flex flex-col items-center justify-center py-12 text-center">
//       <div className="mb-4 text-orange-500">
//         <AlertCircle size={48} />
//       </div>
//       <p className="text-gray-600 font-medium">{message}</p>
//       <p className="text-gray-500 text-sm mt-2">Try a different query or view the data in table format</p>
//     </div>
//   )
// }
