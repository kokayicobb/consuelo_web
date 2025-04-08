import AuthRedirect from "@/components/Auth/Redirect";
import Breadcrumb from "@/components/Common/Breadcrumb";
import { Metadata } from "next";

export const metadata: Metadata = {
  title:
    "Redirect| Consuelo - AI-Powered Fit Technology",
};

const RedirectPage = () => {
  return (
    <>
      <Breadcrumb pageName="Sign In Page" />

      <AuthRedirect />
    </>
  );
};

export default RedirectPage;
