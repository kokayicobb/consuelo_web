"use client";
// File: pages/index.js
import React from "react"; 
import { useEffect } from "react";
import { DollarSign, ShoppingBag, Calculator, BarChart3 } from "lucide-react";
import CustomerSegmentsChart from "@/components/Unified Commerce Dashboard/ui/charts/customer-segment-chart";
import ProductsChart from "@/components/Unified Commerce Dashboard/ui/charts/products-chart";
import RevenueChart from "@/components/Unified Commerce Dashboard/ui/charts/revenue-chart";
import ConnectedPlatforms from "@/components/Unified Commerce Dashboard/tabs/connected-platforms";
import AiInsightsSection from "@/components/Unified Commerce Dashboard/tabs/insights-section";

import KpiCard from "@/components/Unified Commerce Dashboard/ui/kpi-card";
import MainLayout from "@/components/Unified Commerce Dashboard/layout/main-layout";
import InventoryStatus from "@/components/Unified Commerce Dashboard/tabs/inventory-status";
import RecentActivity from "@/components/Unified Commerce Dashboard/tabs/recent-activity";

export default function CommerceDashboard() {
  useEffect(() => {
    // Set custom attributes on the document body to hide both header and footer
    document.body.setAttribute("data-hide-header", "true");
    document.body.setAttribute("data-hide-footer", "true");

    // Clean up when component unmounts
    return () => {
      document.body.removeAttribute("data-hide-header");
      document.body.removeAttribute("data-hide-footer");
    };
  }, []);
  const kpis = [
    {
      title: "Total Revenue (30d)",
      value: "$124,392",
      change: 12.3,
      icon: <DollarSign size={24} />,
      color: "indigo",
    },
    {
      title: "Order Volume (30d)",
      value: "2,845",
      change: 5.7,
      icon: <ShoppingBag size={24} />,
      color: "green",
    },
    {
      title: "Average Order Value",
      value: "$43.72",
      change: 3.1,
      icon: <Calculator size={24} />,
      color: "yellow",
    },
    {
      title: "Channel Conversion",
      value: "3.57%",
      change: -0.4,
      icon: <BarChart3 size={24} />,
      color: "purple",
    },
  ];

  return (
    <MainLayout title="Dashboard Overview">
      {/* KPI Cards */}
      <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi, index) => (
          <KpiCard
            key={index}
            title={kpi.title}
            value={kpi.value}
            change={kpi.change}
            icon={kpi.icon}
            color={kpi.color}
          />
        ))}
      </div>

      {/* AI Insights */}
      <AiInsightsSection />

      {/* Charts & Graphs */}
      <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <RevenueChart />
        <ProductsChart />
      </div>

      {/* Inventory & Customer Data */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <InventoryStatus />
        <CustomerSegmentsChart />
        <RecentActivity />
      </div>

      {/* Connected Platforms */}
      <ConnectedPlatforms />
    </MainLayout>
  );
}
