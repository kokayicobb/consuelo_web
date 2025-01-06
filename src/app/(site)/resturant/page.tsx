import Breadcrumb from "@/components/Common/Breadcrumb";
import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import { Metadata } from "next";

const RestaurantTrackerPage = dynamic(
  () => import("@/components/ResturantReview/resturant-tracker"),
  { ssr: false }
);

export const metadata: Metadata = {
  title: "Restaurant Tracker | Weekly Restaurant Reviews",
  description: "Track and share weekly restaurant experiences with friends",
};

const Restaurant = () => {
  return (
    <main>
      <Breadcrumb pageName="Restaurant Tracker" />
      <Suspense fallback={<div className="flex items-center justify-center min-h-[400px]">
        <div className="text-lg">Loading restaurant tracker...</div>
      </div>}>
        <RestaurantTrackerPage />
      </Suspense>
    </main>
  );
};

export default Restaurant;