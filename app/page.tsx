import { Suspense } from "react";
import Navbar from "../components/shared/navbar";
import Footer from "../components/shared/footer";
import { Hero, ExamCategories, FeaturesGrid, UploadShowcase, HowItWorks, Testimonials, Pricing, ForSchools, FinalCta} from "../components/home";
import PaymentVerification from "../components/home/payment-verification";

export default function Home() {
  return (
    <>
      {/* Catches the Paystack return URL — `?referenceId=…` triggers an
          overlay that verifies the payment server-side and routes the user
          on to the dashboard. Suspense satisfies useSearchParams' boundary
          requirement during static rendering. */}
      <Suspense fallback={null}>
        <PaymentVerification />
      </Suspense>
      <Navbar />
      <Hero />
      {/* <StatsStrip /> */}
      <FeaturesGrid />
      <UploadShowcase />
      <ExamCategories />
      <HowItWorks />
      <Testimonials />
      <Pricing />
      <ForSchools />
      <FinalCta />
      <Footer />
    </>
  );
}
