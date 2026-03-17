import { Header } from "@/components/landing/Header";
import { Hero } from "@/components/landing/Hero";
import { Services } from "@/components/landing/Services";
import { Destinations } from "@/components/landing/Destinations";
import { CTA } from "@/components/landing/CTA";
import { Footer } from "@/components/landing/Footer";

export default function LandingPage() {
  return (
    <>
      <Header />
      <Hero />
      <Services />
      <Destinations />
      <CTA />
      <Footer />
    </>
  );
}
