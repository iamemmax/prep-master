import { TourProvider } from "./util/tour/TourContext";
import TourOverlay from "./components/tour/TourOverlay";
import WelcomeModal from "./components/tour/WelcomeModal";
import { SubscriptionProvider } from "./components/subscription/SubscriptionProvider";
import ContactSupportFab from "./components/support/ContactSupportFab";
import BottomTabNav from "./components/dashboard/BottomTabNav";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <TourProvider>
      <SubscriptionProvider>
        <div className="dashboard-scrollbar pb-16 md:pb-0">
          {children}
          <TourOverlay />
          <WelcomeModal />
          <ContactSupportFab />
          <BottomTabNav />
        </div>
      </SubscriptionProvider>
    </TourProvider>
  );
}
