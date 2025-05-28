// File: components/dashboard/ProductsChart.jsx
"use client"
import React, { useEffect, useRef } from 'react';
import { Chart } from 'chart.js/auto';

const ProductsChart = () => {
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
        type: 'bar',
        data: {
          labels: ['Summer Breeze Dress', 'Urban Classic Jeans', 'Vintage Tee', 'Athleisure Set', 'Boho Blouse'],
          datasets: [
            {
              label: 'Revenue',
              data: [18500, 16200, 14800, 12700, 11400],
              backgroundColor: 'rgba(99, 102, 241, 0.8)',
              borderRadius: 4
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          indexAxis: 'y',
          plugins: {
            legend: {
              display: false
            }
          },
          scales: {
            x: {
              beginAtZero: true,
              grid: {
                display: false
              },
              ticks: {
                callback: function(value) {
                  return '$' + value;
                }
              }
            },
            y: {
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
        <h3 className="font-semibold text-gray-800">Top Performing Products</h3>
        <button className="text-sm text-indigo-600 font-medium">View All</button>
      </div>
      <div className="h-64">
        <canvas ref={chartRef} />
      </div>
    </div>
  );
};

export default ProductsChart;
