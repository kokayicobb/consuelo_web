import React from "react";
import ResetPassword from "@/components/Auth/ResetPassword";
import Breadcrumb from "@/components/Common/Breadcrumb";
import { Metadata } from "next";
import ResetPasswordForm from "@/components/Auth/ResetPassword";

export const metadata: Metadata = {
  title: "Reset Password | Consuelo - AI-Powered Fit Technology",
};

const ResetPasswordPage = ({ params }: { params: { token: string } }) => {
  return (
    <>
      <Breadcrumb pageName="Reset Password" />
      <ResetPasswordForm />
    </>
  );
};

export default ResetPasswordPage;
