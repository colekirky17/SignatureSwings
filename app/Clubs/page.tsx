import type { Metadata } from "next";
import { B2BLandingPage } from "../../components/b2b/b2b-landing-page";

export const metadata: Metadata = {
  title: "Custom Golf Tournament Gifts & Club Packages",
  description:
    "Custom golf accessories for tournaments, member gifts, corporate outings, club orders, and bulk event packages from Signature Swings.",
};

export default function ClubsPage() {
  return <B2BLandingPage />;
}
