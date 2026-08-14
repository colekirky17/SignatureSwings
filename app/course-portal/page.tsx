import type { Metadata } from "next";
import { B2BLandingPage } from "../../components/b2b/b2b-landing-page";

export const metadata: Metadata = {
  title: "Course Portal | Custom Golf Tournament Gifts",
  description:
    "Custom golf accessories and bulk event packages for tournaments, golf clubs, member gifts, and corporate outings from Signature Swings.",
};

export default function CoursePortalPage() {
  return <B2BLandingPage />;
}
