import Breadcrumb from "@/components/Common/Breadcrumb";
import Faq from "@/components/Faq";
import PitchDeck from "@/components/PitchDeck";
import Pricing from "@/components/Pricing";
import { Metadata } from "next";

export const metadata: Metadata = {
  title:
    "Pitch Deck Page | Consuelo - AI-Powered Fit Technology",
  description: "This is Pitch Deck page description",
};

const PitchDeckPage = () => {
  return (
    <>
      <Breadcrumb pageName="Pitch Deck" />
      <PitchDeck />
     
    </>
  );
};

export default PitchDeckPage;
