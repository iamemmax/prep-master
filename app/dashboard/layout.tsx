import { TourProvider } from "./util/tour/TourContext";
import TourOverlay from "./components/tour/TourOverlay";
import WelcomeModal from "./components/tour/WelcomeModal";
import { SubscriptionProvider } from "./components/subscription/SubscriptionProvider";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <TourProvider>
      <SubscriptionProvider>
        <div className="dashboard-scrollbar">
          {children}
          <TourOverlay />
          <WelcomeModal />
        </div>
      </SubscriptionProvider>
    </TourProvider>
  );
}
