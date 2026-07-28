import type { Metadata } from "next";
import { SavedScreen } from "../SavedScreen";

export const metadata: Metadata = {
  title: "Saved fights — Fight List",
  description: "Your saved combat sports events on Fight List.",
};

export default function SavedPage() {
  return <SavedScreen />;
}
