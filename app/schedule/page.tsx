import type { Metadata } from "next";
import { FightTracker } from "../FightTracker";

export const metadata: Metadata = {
  title: "Schedule — Fight List",
  description: "Search and filter the full upcoming combat sports schedule.",
};

export default function SchedulePage() {
  return <FightTracker />;
}
