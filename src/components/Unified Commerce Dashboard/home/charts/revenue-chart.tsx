// File: components/dashboard/RevenueChart.jsx
"use client"
import React, { useEffect, useRef } from 'react';
import { Chart } from 'chart.js/auto';


const RevenueChart = () => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    if (chartRef.current) {
      // Destroy existing chart if it exists
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }

      const ctx = chartRef.current.getContext('2d');
      chartInstance.current = new Chart(ctx, {
        type: 'line',
        data: {
          labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
          datasets: [
            {
              label: 'Shopify',
              data: [3200, 4100, 3800, 5200, 4800, 5900, 6800],
              borderColor: 'rgb(99, 102, 241)',
              backgroundColor: 'rgba(99, 102, 241, 0.1)',
              tension: 0.3,
              fill: true
            },
            {
              label: 'TikTok Shop',
              data: [1800, 2200, 2400, 2600, 3100, 3400, 3900],
              borderColor: 'rgb(236, 72, 153)',
              backgroundColor: 'rgba(236, 72, 153, 0.1)',
              tension: 0.3,
              fill: true
            },
            {
              label: 'Instagram Shop',
              data: [1200, 1400, 1300, 1500, 1700, 1900, 2100],
              borderColor: 'rgb(139, 92, 246)',
              backgroundColor: 'rgba(139, 92, 246, 0.1)',
              tension: 0.3,
              fill: true
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'top',
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              grid: {},
              ticks: {
                callback: function(value) {
                  return '$' + value;
                }
              }
            },
            x: {
              grid: {
                display: false
              }
            }
          }
        }
      });
    }

    // Cleanup function
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, []);

  return (
    <div className="bg-white rounded-lg shadow p-5">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-gray-800">Revenue by Channel</h3>
        <div className="flex text-sm">
          <button className="text-indigo-600 font-medium">Weekly</button>
          <button className="ml-3 text-gray-400">Monthly</button>
          <button className="ml-3 text-gray-400">Quarterly</button>
        </div>
      </div>
      <div className="h-64">
        <canvas ref={chartRef} />
      </div>
    </div>
  );
};

export default RevenueChart;
