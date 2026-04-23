import { TourProvider } from "./util/tour/TourContext";
import TourOverlay from "./components/tour/TourOverlay";
import WelcomeModal from "./components/tour/WelcomeModal";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <TourProvider>
      {children}
      <TourOverlay />
      <WelcomeModal />
    </TourProvider>
  );
}
