import Navbar from "../components/shared/navbar";
import Footer from "../components/shared/footer";
import { Hero, ExamCategories, StatsStrip, FeaturesGrid, UploadShowcase, HowItWorks, Testimonials, Pricing, ForSchools, FinalCta} from "../components/home";

export default function Home() {
  return (
    <>
      <Navbar />
      <Hero />
      <StatsStrip />
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
