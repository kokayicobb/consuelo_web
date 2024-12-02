import About from "@/components/About";
import Breadcrumb from "@/components/Common/Breadcrumb";
import Features from "@/components/Features";
import EquestrianHelmetPage from "@/components/Playground/components/Store";
import Team from "@/components/Team";
import { Metadata } from "next";

export const metadata: Metadata = {
  title:
    "About Us | Consuelo - AI-Powered Fit Technology",
  description: "This is About page description",
};

const Playground = () => {
  return (
    <main>
      <Breadcrumb pageName="Playground" />
      <EquestrianHelmetPage />
     
    </main>
  );
};

export default Playground;
