import type { Metadata } from "next";
import { B2BLandingPage } from "../../components/b2b/b2b-landing-page";

export const metadata: Metadata = {
  title: "Tournament Gifts & Bulk Golf Event Packages",
  description:
    "Explore bulk custom golf gifts and event packages for tournaments, golf clubs, member events, and corporate outings.",
};

export default function TournamentGiftsPage() {
  return <B2BLandingPage />;
}
