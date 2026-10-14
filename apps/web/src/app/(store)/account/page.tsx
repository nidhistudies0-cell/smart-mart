import { Metadata } from "next";
import { ProfileClient } from "@/components/store/ProfileClient";

export const metadata: Metadata = {
  title: "My Account | SmartMart",
  description: "View and manage your account details, delivery address, and past orders.",
};

export default function AccountPage() {
  return <ProfileClient />;
}
