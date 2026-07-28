import type { Metadata } from "next";
import { SettingsScreen } from "../SettingsScreen";

export const metadata: Metadata = {
  title: "Settings — Fight List",
  description: "Personalize Fight List on this device.",
};

export default function SettingsPage() {
  return <SettingsScreen />;
}
