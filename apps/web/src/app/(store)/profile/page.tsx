import { Metadata } from "next";
import { ProfileClient } from "@/components/store/ProfileClient";

export const metadata: Metadata = {
  title: "My Profile | SmartMart",
  description: "View and manage your personal information, address and orders.",
};

export default function ProfilePage() {
  return <ProfileClient />;
}
