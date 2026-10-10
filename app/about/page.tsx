import type { Metadata } from "next";
import { AboutPage } from "@/components/about/AboutPage";

export const metadata: Metadata = {
  title: "About · VibeCheck",
  description:
    "VibeCheck turns the software you build with AI into the material you learn from. Found in your code is not the same as demonstrated knowledge."
};

export default function AboutRoute() {
  return <AboutPage />;
}
