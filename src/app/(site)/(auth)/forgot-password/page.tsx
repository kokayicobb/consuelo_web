import React from "react";
import ForgotPassword from "@/components/Auth/ForgotPassword";
import Breadcrumb from "@/components/Common/Breadcrumb";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Forgot Password | Consuelo - AI-Powered Fit Technology",
};

const ForgotPasswordPage = () => {
  return (
    <>
      <Breadcrumb pageName="Forget Password" />
      <ForgotPassword />
    </>
  );
};

export default ForgotPasswordPage;
