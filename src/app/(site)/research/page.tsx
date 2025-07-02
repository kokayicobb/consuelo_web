import RedditSearch from "@/components/Unified Commerce Dashboard/reddit-search";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Body Measurment | Consuelo - AI-Powered Fit Technology",
  description: "This is About page description",
};

const SalesAgent = () => {
  return (
    <main>
      <RedditSearch />
    </main>
  );
};

export default SalesAgent;
