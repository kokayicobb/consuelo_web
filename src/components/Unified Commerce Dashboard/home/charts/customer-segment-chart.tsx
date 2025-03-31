"use client"
// File: components/dashboard/CustomerSegmentsChart.jsx
import React, { useEffect, useRef } from 'react';
import { Chart } from 'chart.js/auto';

const CustomerSegmentsChart = () => {
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
        type: 'doughnut',
        data: {
          labels: ['Fashion Enthusiasts', 'Budget Shoppers', 'Seasonal Buyers', 'Trend Followers', 'Loyal Customers'],
          datasets: [
            {
              data: [35, 25, 15, 15, 10],
              backgroundColor: [
                'rgba(99, 102, 241, 0.8)',
                'rgba(236, 72, 153, 0.8)',
                'rgba(139, 92, 246, 0.8)',
                'rgba(16, 185, 129, 0.8)',
                'rgba(245, 158, 11, 0.8)'
              ],
              borderWidth: 0
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                boxWidth: 12,
                padding: 15
              }
            }
          },
          cutout: '70%'
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
        <h3 className="font-semibold text-gray-800">Customer Segments</h3>
        <button className="text-sm text-indigo-600 font-medium">View All</button>
      </div>
      <div className="h-64">
        <canvas ref={chartRef} />
      </div>
    </div>
  );
};

export default CustomerSegmentsChart;
