import Breadcrumb from "@/components/Common/Breadcrumb";
import Contact from "@/components/Contact";
import { Metadata } from "next";

export const metadata: Metadata = {
  title:
    "Waitlist  | Consuelo is on the job.",
  description: "Join the waitlist for our Product Hunt Launch", // null
};

const ContactPage = () => {
  return (
    <>
      {/* <Breadcrumb pageName="Contact Page" /> */}

      <Contact />
    </>
  );
};

export default ContactPage;
