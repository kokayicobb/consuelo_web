'use client';

import { Config } from '@/types/otf';
import React from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';


interface ChartVisualizationProps {
  config: Config;
  data: Record<string, any>[];
}

/**
 * Component that dynamically renders different chart types based on config
 */
export default function ChartVisualization({ config, data }: ChartVisualizationProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
        <p className="text-gray-500">No data available for visualization</p>
      </div>
    );
  }

  // Chart description and insights
  const ChartInfo = () => (
    <div className="mb-6">
      <h3 className="text-lg font-medium mb-2">{config.title}</h3>
      <p className="text-sm text-gray-600 mb-3">{config.description}</p>
      <div className="bg-orange-50 p-3 rounded-md border border-orange-100">
        <h4 className="text-sm font-medium text-orange-800 mb-1">Key Takeaway</h4>
        <p className="text-sm text-orange-700">{config.takeaway}</p>
      </div>
    </div>
  );

  // Render the appropriate chart based on config.type
  return (
    <div className="w-full">
      <ChartInfo />
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <React.Fragment>
            {/* Bar Chart */}
            {config.type === 'bar' && (
              <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey={config.xKey} />
                <YAxis />
                <Tooltip />
                {config.legend && <Legend />}
                {config.yKeys.map((key, index) => (
                  <Bar
                    key={key}
                    dataKey={key}
                    name={key}
                    fill={config.colors?.[key] || `#${Math.floor(Math.random() * 16777215).toString(16)}`}
                  />
                ))}
              </BarChart>
            )}

            {/* Line Chart */}
            {config.type === 'line' && (
              <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey={config.xKey} />
                <YAxis />
                <Tooltip />
                {config.legend && <Legend />}
                {config.yKeys.map((key) => (
                  <Line
                    key={key}
                    type="monotone"
                    dataKey={key}
                    name={key}
                    stroke={config.colors?.[key] || `#${Math.floor(Math.random() * 16777215).toString(16)}`}
                    activeDot={{ r: 8 }}
                  />
                ))}
              </LineChart>
            )}

            {/* Area Chart */}
            {config.type === 'area' && (
              <AreaChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey={config.xKey} />
                <YAxis />
                <Tooltip />
                {config.legend && <Legend />}
                {config.yKeys.map((key) => (
                  <Area
                    key={key}
                    type="monotone"
                    dataKey={key}
                    name={key}
                    fill={config.colors?.[key] || `#${Math.floor(Math.random() * 16777215).toString(16)}`}
                    stroke={config.colors?.[key] || `#${Math.floor(Math.random() * 16777215).toString(16)}`}
                  />
                ))}
              </AreaChart>
            )}

            {/* Pie Chart */}
            {config.type === 'pie' && (
              <PieChart>
                <Tooltip />
                {config.legend && <Legend />}
                <Pie
                  data={data}
                  dataKey={config.yKeys[0]}
                  nameKey={config.xKey}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                >
                  {data.map((entry, index) => {
                    const colorKey = entry[config.xKey];
                    const color = config.colors?.[colorKey] || 
                      `#${Math.floor(Math.random() * 16777215).toString(16)}`;
                    return <Cell key={`cell-${index}`} fill={color} />;
                  })}
                </Pie>
              </PieChart>
            )}
          </React.Fragment>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

/**
 * Helper component for displaying a loading state when chart is being generated
 */
export function ChartLoading() {
  return (
    <div className="flex flex-col items-center justify-center h-80 bg-gray-50 rounded-lg">
      <div className="w-12 h-12 rounded-full border-4 border-orange-200 border-t-orange-500 animate-spin mb-4"></div>
      <p className="text-gray-500">Generating chart visualization...</p>
    </div>
  );
}

/**
 * Helper component for error states
 */
export function ChartError({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-80 bg-red-50 rounded-lg border border-red-100">
      <svg className="w-12 h-12 text-red-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
      </svg>
      <p className="text-red-500">{message}</p>
    </div>
  );
}