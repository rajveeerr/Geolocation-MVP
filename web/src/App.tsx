import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { SignUpPage } from './pages/SignUpPage';
import { AuthCallbackPage } from './pages/AuthCallbackPage';
import React, { Suspense } from 'react';
import { AboutPage } from './pages/AboutPage';
import { ForBusinessesPage } from './pages/ForBusinessesPage';
import { PrivacyPage } from './pages/PrivacyPage';
import { TermsPage } from './pages/TermsPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { MerchantLayout } from './components/layout/MerchantLayout';
import { AdminLayout } from './components/layout/AdminLayout';
import { AdminProtectedRoute } from './routing/AdminProtectedRoute';
import { ProtectedRoute } from './routing/ProtectedRoute';
import { PATHS } from './routing/paths';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from './context/AuthContext';
import { RedirectProvider } from './context/RedirectContext';
import { ModalProvider } from './context/ModalContext';
import { CityProvider } from './context/CityContext';
import { AllDealsPage } from './pages/AllDealsPage';

const ProfilePage = React.lazy(() =>
  import('./pages/ProfilePage').then((m) => ({ default: m.ProfilePage })),
);
const MerchantOnboardingPage = React.lazy(() =>
  import('./pages/merchant/MerchantOnboardingPage').then((m) => ({
    default: m.MerchantOnboardingPage,
  })),
);
const MerchantDashboardPage = React.lazy(() =>
  import('./pages/merchant/MerchantDashboardPage').then((m) => ({
    default: m.MerchantDashboardPage,
  })),
);
const MerchantBusinessPage = React.lazy(() =>
  import('./pages/merchant/MerchantBusinessPage').then((m) => ({
    default: m.MerchantBusinessPage,
  })),
);
const MerchantAnalyticsPage = React.lazy(() =>
  import('./pages/merchant/MerchantAnalyticsPage').then((m) => ({
    default: m.MerchantAnalyticsPage,
  })),
);
const MerchantCheckInGamesPage = React.lazy(() =>
  import('./pages/merchant/MerchantCheckInGamesPage').then((m) => ({
    default: m.MerchantCheckInGamesPage,
  })),
);
const CreateDealPage = React.lazy(() =>
  import('./pages/merchant/DealCreatePage').then((m) => ({
    default: m.CreateDealPage,
  })),
);
const DealEditPage = React.lazy(() =>
  import('./pages/merchant/DealEditPage').then((m) => ({
    default: m.DealEditPage,
  })),
);
const DealDetailPage = React.lazy(() =>
  import('./pages/DealDetailPage').then((m) => ({ default: m.DealDetailPage })),
);
const EventDetailPage = React.lazy(() =>
  import('./pages/EventDetailPage').then((m) => ({ default: m.EventDetailPage })),
);
const MenuDetailPage = React.lazy(() =>
  import('./pages/MenuDetailPage').then((m) => ({ default: m.MenuDetailPage })),
);
const HiddenDealPage = React.lazy(() =>
  import('./pages/HiddenDealPage').then((module) => ({ default: module.HiddenDealPage })),
);
const AdminLoginPage = React.lazy(() =>
  import('./pages/admin/AdminLoginPage').then((m) => ({ default: m.AdminLoginPage })),
);
const AdminDashboardPage = React.lazy(() =>
  import('./pages/admin/AdminDashboardPage').then((m) => ({ default: m.AdminDashboardPage })),
);
const AdminRealTimeAnalyticsPage = React.lazy(() =>
  import('./pages/admin/AdminRealTimeAnalyticsPage').then((m) => ({ default: m.AdminRealTimeAnalyticsPage })),
);
const CustomerCRMPage = React.lazy(() =>
  import('./pages/admin/CustomerCRMPage').then((m) => ({ default: m.CustomerCRMPage })),
);
const MerchantApprovalDashboard = React.lazy(() =>
  import('./pages/admin/MerchantApprovalDashboard').then((m) => ({ default: m.MerchantApprovalDashboard })),
);
const CityAnalyticsDashboard = React.lazy(() =>
  import('./pages/admin/CityAnalyticsDashboard').then((m) => ({ default: m.CityAnalyticsDashboard })),
);
const CityManagementDashboard = React.lazy(() =>
  import('./pages/admin/CityManagementDashboard').then((m) => ({ default: m.CityManagementDashboard })),
);
const CustomerManagementPage = React.lazy(() =>
  import('./pages/admin/CustomerManagementPage').then((m) => ({ default: m.CustomerManagementPage })),
);
const CustomerDetailPage = React.lazy(() =>
  import('./pages/admin/CustomerDetailPage').then((m) => ({ default: m.CustomerDetailPage })),
);
const LeaderboardPage = React.lazy(() =>
  import('./pages/LeaderboardPage').then((m) => ({
    default: m.LeaderboardPage,
  })),
);
const ComprehensiveLeaderboardPage = React.lazy(() =>
  import('./pages/ComprehensiveLeaderboardPage').then((m) => ({
    default: m.ComprehensiveLeaderboardPage,
  })),
);
const ReferralPage = React.lazy(() =>
  import('./pages/ReferralPage').then((m) => ({ default: m.ReferralPage })),
);
const GamificationPage = React.lazy(() =>
  import('./pages/GamificationPage').then((m) => ({ default: m.GamificationPage })),
);
const StreakLeaderboardPage = React.lazy(() =>
  import('./pages/StreakLeaderboard').then((m) => ({ default: m.StreakLeaderboardPage })),
);
const HeistHistoryPage = React.lazy(() =>
  import('./pages/HeistHistoryPage').then((m) => ({ default: m.HeistHistoryPage })),
);
const HeistNotificationsPage = React.lazy(() =>
  import('./pages/HeistNotificationsPage').then((m) => ({ default: m.HeistNotificationsPage })),
);
const HeistItemShopPage = React.lazy(() =>
  import('./pages/HeistItemShopPage').then((m) => ({ default: m.HeistItemShopPage })),
);
const KickbackEarningsPage = React.lazy(() =>
  import('./pages/merchant/KickbackEarningsPage').then((m) => ({ default: m.KickbackEarningsPage })),
);
const StoreManagementPage = React.lazy(() =>
  import('./pages/merchant/StoreManagementPage').then((m) => ({ default: m.StoreManagementPage })),
);
const StoreFormPage = React.lazy(() =>
  import('./pages/merchant/StoreFormPage').then((m) => ({ default: m.StoreFormPage })),
);
const MenuManagementPage = React.lazy(() =>
  import('./pages/merchant/MenuManagementPageV2'),
);
const MenuItemFormPage = React.lazy(() =>
  import('./pages/merchant/MenuItemFormPage').then((m) => ({ default: m.MenuItemFormPage })),
);
const MenuItemDetailPage = React.lazy(() =>
  import('./pages/merchant/MenuItemDetailPage').then((m) => ({ default: m.MenuItemDetailPage })),
);
const MenuCollectionsPage = React.lazy(() =>
  import('./components/merchant/menu-collections/MenuCollectionsPage').then((m) => ({ default: m.MenuCollectionsPage })),
);
const InventoryPage = React.lazy(() => import('./pages/merchant/InventoryPage'));
const BlogListPage = React.lazy(() => import('./pages/merchant/BlogListPage'));
const BlogPostFormPage = React.lazy(() => import('./pages/merchant/BlogPostFormPage'));
const BlogCategoriesPage = React.lazy(() => import('./pages/merchant/BlogCategoriesPage'));
const MerchantBlogPage = React.lazy(() => import('./pages/public/MerchantBlogPage'));
const BlogPostPage = React.lazy(() => import('./pages/public/BlogPostPage'));
const StoreDetailPage = React.lazy(() =>
  import('./pages/merchant/StoreDetailPage').then((m) => ({ default: m.StoreDetailPage })),
);
const MerchantMyDealsPage = React.lazy(() =>
  import('./pages/merchant/MerchantMyDealsPage').then((m) => ({ default: m.MerchantMyDealsPage })),
);
const MerchantMyEventsPage = React.lazy(() =>
  import('./pages/merchant/MerchantMyEventsPage').then((m) => ({ default: m.MerchantMyEventsPage })),
);
const CreateEventPage = React.lazy(() =>
  import('./pages/merchant/EventCreatePage').then((m) => ({ default: m.CreateEventPage })),
);
const EventManagePage = React.lazy(() =>
  import('./pages/merchant/EventManagePage').then((m) => ({ default: m.EventManagePage })),
);
const EventCheckInPage = React.lazy(() =>
  import('./pages/merchant/EventCheckInPage').then((m) => ({ default: m.EventCheckInPage })),
);
const MyTicketsPage = React.lazy(() =>
  import('./pages/MyTicketsPage').then((m) => ({ default: m.MyTicketsPage })),
);
const NotificationsPage = React.lazy(() =>
  import('./pages/NotificationsPage').then((m) => ({ default: m.NotificationsPage })),
);
const DiscoverEventsPage = React.lazy(() =>
  import('./pages/DiscoverEventsPage').then((m) => ({ default: m.DiscoverEventsPage })),
);
const DiscoverServicesPage = React.lazy(() =>
  import('./pages/DiscoverServicesPage').then((m) => ({ default: m.DiscoverServicesPage })),
);
const CityGuidePage = React.lazy(() =>
  import('./pages/CityGuidePage').then((m) => ({ default: m.CityGuidePage })),
);
const ServiceDetailPage = React.lazy(() =>
  import('./pages/ServiceDetailPage').then((m) => ({ default: m.ServiceDetailPage })),
);
const MyServiceBookingsPage = React.lazy(() =>
  import('./pages/MyServiceBookingsPage').then((m) => ({ default: m.MyServiceBookingsPage })),
);
const MerchantTrucksPage = React.lazy(() =>
  import('./pages/merchant/MerchantTrucksPage').then((m) => ({ default: m.MerchantTrucksPage })),
);
const MerchantHiddenDealsPage = React.lazy(() =>
  import('./pages/merchant/MerchantHiddenDealsPage').then((m) => ({ default: m.MerchantHiddenDealsPage })),
);
const MerchantBountyDealsPage = React.lazy(() =>
  import('./pages/merchant/MerchantBountyDealsPage').then((m) => ({ default: m.MerchantBountyDealsPage })),
);
const MerchantReferralsPage = React.lazy(() =>
  import('./pages/merchant/MerchantReferralsPage').then((m) => ({ default: m.MerchantReferralsPage })),
);
const MerchantReferralDealsPage = React.lazy(() =>
  import('./pages/merchant/MerchantReferralDealsPage').then((m) => ({ default: m.MerchantReferralDealsPage })),
);
const MerchantMembershipTiersPage = React.lazy(() =>
  import('./pages/merchant/MerchantMembershipTiersPage').then((m) => ({ default: m.MerchantMembershipTiersPage })),
);
const MerchantTruckCreatePage = React.lazy(() =>
  import('./pages/merchant/MerchantTruckCreatePage').then((m) => ({ default: m.MerchantTruckCreatePage })),
);
const MerchantCateringPage = React.lazy(() =>
  import('./pages/merchant/MerchantCateringPage').then((m) => ({ default: m.MerchantCateringPage })),
);
const MerchantCateringFormPage = React.lazy(() =>
  import('./pages/merchant/MerchantCateringFormPage').then((m) => ({ default: m.MerchantCateringFormPage })),
);
const MerchantCateringOrdersPage = React.lazy(() =>
  import('./pages/merchant/MerchantCateringOrdersPage').then((m) => ({ default: m.MerchantCateringOrdersPage })),
);
const MerchantCateringOrderDetailPage = React.lazy(() =>
  import('./pages/merchant/MerchantCateringOrderDetailPage').then((m) => ({ default: m.MerchantCateringOrderDetailPage })),
);
const MerchantTruckSchedulePage = React.lazy(() =>
  import('./pages/merchant/MerchantTruckSchedulePage').then((m) => ({ default: m.MerchantTruckSchedulePage })),
);
const FoodTrucksPage = React.lazy(() =>
  import('./pages/FoodTrucksPage').then((m) => ({ default: m.FoodTrucksPage })),
);
const CateringMenuPage = React.lazy(() =>
  import('./pages/CateringMenuPage').then((m) => ({ default: m.CateringMenuPage })),
);
const CateringOrderConfirmationPage = React.lazy(() =>
  import('./pages/CateringOrderConfirmationPage').then((m) => ({ default: m.CateringOrderConfirmationPage })),
);
const MyCateringOrdersPage = React.lazy(() =>
  import('./pages/MyCateringOrdersPage').then((m) => ({ default: m.MyCateringOrdersPage })),
);
const MerchantMyServicesPage = React.lazy(() =>
  import('./pages/merchant/MerchantMyServicesPage').then((m) => ({ default: m.MerchantMyServicesPage })),
);
const ServiceCreatePage = React.lazy(() =>
  import('./pages/merchant/ServiceCreatePage').then((m) => ({ default: m.ServiceCreatePage })),
);
const ServiceManagePage = React.lazy(() =>
  import('./pages/merchant/ServiceManagePage').then((m) => ({ default: m.ServiceManagePage })),
);
const ServiceCheckInPage = React.lazy(() =>
  import('./pages/merchant/ServiceCheckInPage').then((m) => ({ default: m.ServiceCheckInPage })),
);
const MerchantMySurprisesPage = React.lazy(() =>
  import('./pages/merchant/MerchantMySurprisesPage').then((m) => ({ default: m.MerchantMySurprisesPage })),
);
const SurpriseCreatePage = React.lazy(() =>
  import('./pages/merchant/SurpriseCreatePage').then((m) => ({ default: m.SurpriseCreatePage })),
);
const SurpriseAnalyticsPage = React.lazy(() =>
  import('./pages/merchant/SurpriseAnalyticsPage').then((m) => ({ default: m.SurpriseAnalyticsPage })),
);
const SurprisesPage = React.lazy(() =>
  import('./pages/SurprisesPage').then((m) => ({ default: m.SurprisesPage })),
);
const MyRevealHistoryPage = React.lazy(() =>
  import('./pages/MyRevealHistoryPage').then((m) => ({ default: m.MyRevealHistoryPage })),
);
import { LoadingOverlay } from '@/components/ui/LoadingOverlay';
import { ScrollToTop } from '@/components/common/ScrollToTop';
import { PaymentSuccessPage } from './pages/PaymentSuccessPage';
import { PaymentCancelPage } from './pages/PaymentCancelPage';
import { NudgeToast } from '@/components/nudges/NudgeToast';
const LoyaltyHistoryPage = React.lazy(() =>
  import('./pages/LoyaltyHistoryPage').then((m) => ({ default: m.LoyaltyHistoryPage }))
);
const MerchantLoyaltySetupPage = React.lazy(() =>
  import('./pages/merchant/loyalty/MerchantLoyaltySetupPage').then((m) => ({ default: m.MerchantLoyaltySetupPage }))
);
const MerchantLoyaltyProgramPage = React.lazy(() =>
  import('./pages/merchant/loyalty/MerchantLoyaltyProgramPage').then((m) => ({ default: m.MerchantLoyaltyProgramPage }))
);
const MerchantLoyaltyAnalyticsPage = React.lazy(() =>
  import('./pages/merchant/loyalty/MerchantLoyaltyAnalyticsPage').then((m) => ({ default: m.MerchantLoyaltyAnalyticsPage }))
);
const MerchantLoyaltyCustomersPage = React.lazy(() =>
  import('./pages/merchant/loyalty/MerchantLoyaltyCustomersPage').then((m) => ({ default: m.MerchantLoyaltyCustomersPage }))
);
const MerchantLoyaltyTransactionsPage = React.lazy(() =>
  import('./pages/merchant/loyalty/MerchantLoyaltyTransactionsPage').then((m) => ({ default: m.MerchantLoyaltyTransactionsPage }))
);
const AdminNudgesPage = React.lazy(() =>
  import('./pages/admin/AdminNudgesPage').then((m) => ({ default: m.AdminNudgesPage }))
);
const AdminGamesPage = React.lazy(() =>
  import('./pages/admin/AdminGamesPage').then((m) => ({ default: m.AdminGamesPage }))
);
const NudgeHistoryPage = React.lazy(() =>
  import('./pages/NudgeHistoryPage').then((m) => ({ default: m.NudgeHistoryPage }))
);

const DefaultLayout = () => {
  return (
    <>
      <Header />
      <main>
        <Outlet />
      </main>
      <Footer />
    </>
  );
};

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <RedirectProvider>
        <AuthProvider>
          <CityProvider>
            <ModalProvider>
              <Routes>
                <Route element={<DefaultLayout />}>
                  <Route path={PATHS.HOME} element={<HomePage />} />
                  <Route path="/auth/callback" element={<AuthCallbackPage />} />
                  <Route path={PATHS.LOGIN} element={<LoginPage />} />
                  <Route path={PATHS.SIGNUP} element={<SignUpPage />} />
                  <Route
                    path={PATHS.PROFILE}
                    element={
                      <ProtectedRoute>
                        <Suspense fallback={<LoadingOverlay />}>
                          <ProfilePage />
                        </Suspense>
                      </ProtectedRoute>
                    }
                  />
                  <Route path={PATHS.ABOUT} element={<AboutPage />} />
                  <Route
                    path={PATHS.STREAK_LEADERBOARD}
                    element={
                      <Suspense fallback={<LoadingOverlay />}>
                        <StreakLeaderboardPage />
                      </Suspense>
                    }
                  />
                  <Route
                    path={PATHS.LEADERBOARD}
                    element={
                      <Suspense fallback={<LoadingOverlay />}>
                        <LeaderboardPage />
                      </Suspense>
                    }
                  />
                  <Route
                    path={PATHS.LEADERBOARD_COMPREHENSIVE}
                    element={
                      <Suspense fallback={<LoadingOverlay />}>
                        <ComprehensiveLeaderboardPage />
                      </Suspense>
                    }
                  />
                  <Route path={PATHS.ALL_DEALS} element={<AllDealsPage />} />
                  <Route
                    path={PATHS.LOYALTY_HISTORY}
                    element={
                      <ProtectedRoute>
                        <Suspense fallback={<LoadingOverlay />}>
                          <LoyaltyHistoryPage />
                        </Suspense>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path={PATHS.REFERRALS}
                    element={
                      <ProtectedRoute>
                        <Suspense fallback={<LoadingOverlay />}>
                          <ReferralPage />
                        </Suspense>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path={PATHS.GAMIFICATION}
                    element={
                      <ProtectedRoute>
                        <Suspense fallback={<LoadingOverlay />}>
                          <GamificationPage />
                        </Suspense>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path={PATHS.HEIST_HISTORY}
                    element={
                      <ProtectedRoute>
                        <Suspense fallback={<LoadingOverlay />}>
                          <HeistHistoryPage />
                        </Suspense>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path={PATHS.HEIST_NOTIFICATIONS}
                    element={
                      <ProtectedRoute>
                        <Suspense fallback={<LoadingOverlay />}>
                          <HeistNotificationsPage />
                        </Suspense>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path={PATHS.HEIST_ITEM_SHOP}
                    element={
                      <ProtectedRoute>
                        <Suspense fallback={<LoadingOverlay />}>
                          <HeistItemShopPage />
                        </Suspense>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path={PATHS.DEAL_DETAIL}
                    element={
                      <Suspense fallback={<LoadingOverlay />}>
                        <DealDetailPage />
                      </Suspense>
                    }
                  />
                  <Route
                    path={PATHS.EVENT_DETAIL}
                    element={
                      <Suspense fallback={<LoadingOverlay />}>
                        <EventDetailPage />
                      </Suspense>
                    }
                  />
                  <Route
                    path={PATHS.DISCOVER_EVENTS}
                    element={
                      <Suspense fallback={<LoadingOverlay />}>
                        <DiscoverEventsPage />
                      </Suspense>
                    }
                  />
                  <Route
                    path={PATHS.DISCOVER_SERVICES}
                    element={
                      <Suspense fallback={<LoadingOverlay />}>
                        <DiscoverServicesPage />
                      </Suspense>
                    }
                  />
                  <Route
                    path={PATHS.CITY_GUIDE}
                    element={
                      <ProtectedRoute>
                        <Suspense fallback={<LoadingOverlay />}>
                          <CityGuidePage />
                        </Suspense>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path={PATHS.FOOD_TRUCKS}
                    element={
                      <Suspense fallback={<LoadingOverlay />}>
                        <FoodTrucksPage />
                      </Suspense>
                    }
                  />
                  <Route
                    path={PATHS.CATERING_MENU}
                    element={
                      <Suspense fallback={<LoadingOverlay />}>
                        <CateringMenuPage />
                      </Suspense>
                    }
                  />
                  <Route
                    path={PATHS.CATERING_ORDER_CONFIRMATION}
                    element={
                      <ProtectedRoute>
                        <Suspense fallback={<LoadingOverlay />}>
                          <CateringOrderConfirmationPage />
                        </Suspense>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path={PATHS.MY_CATERING_ORDERS}
                    element={
                      <Suspense fallback={<LoadingOverlay />}>
                        <MyCateringOrdersPage />
                      </Suspense>
                    }
                  />
                  <Route
                    path={PATHS.SERVICE_DETAIL}
                    element={
                      <Suspense fallback={<LoadingOverlay />}>
                        <ServiceDetailPage />
                      </Suspense>
                    }
                  />
                  <Route
                    path={PATHS.MY_TICKETS}
                    element={
                      <ProtectedRoute>
                        <Suspense fallback={<LoadingOverlay />}>
                          <MyTicketsPage />
                        </Suspense>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path={PATHS.MY_SERVICE_BOOKINGS}
                    element={
                      <ProtectedRoute>
                        <Suspense fallback={<LoadingOverlay />}>
                          <MyServiceBookingsPage />
                        </Suspense>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path={PATHS.NOTIFICATIONS}
                    element={
                      <ProtectedRoute>
                        <Suspense fallback={<LoadingOverlay />}>
                          <NotificationsPage />
                        </Suspense>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/deals/:dealId/menu/:itemId"
                    element={
                      <Suspense fallback={<LoadingOverlay />}>
                        <MenuDetailPage />
                      </Suspense>
                    }
                  />
                  <Route
                    path="/deals/hidden/:code"
                    element={
                      <Suspense fallback={<LoadingOverlay />}>
                        <HiddenDealPage />
                      </Suspense>
                    }
                  />
                  <Route
                    path={PATHS.FOR_BUSINESSES}
                    element={<ForBusinessesPage />}
                  />
                  {/* Public blog routes */}
                  <Route
                    path="/merchants/:merchantId/blog"
                    element={
                      <Suspense fallback={<LoadingOverlay />}>
                        <MerchantBlogPage />
                      </Suspense>
                    }
                  />
                  <Route
                    path="/blog/:merchantId/:slug"
                    element={
                      <Suspense fallback={<LoadingOverlay />}>
                        <BlogPostPage />
                      </Suspense>
                    }
                  />

                  <Route path={PATHS.PRIVACY} element={<PrivacyPage />} />
                  <Route path={PATHS.TERMS} element={<TermsPage />} />
                  <Route path={PATHS.PAYMENT_SUCCESS} element={<PaymentSuccessPage />} />
                  <Route path={PATHS.PAYMENT_CANCEL} element={<PaymentCancelPage />} />
                </Route>

                <Route
                  path={PATHS.MERCHANT_BUSINESS}
                  element={
                    <ProtectedRoute>
                      <MerchantLayout>
                        <Suspense fallback={<LoadingOverlay />}>
                          <MerchantBusinessPage />
                        </Suspense>
                      </MerchantLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path={PATHS.MERCHANT_DASHBOARD}
                  element={
                    <ProtectedRoute>
                      <MerchantLayout>
                        <Suspense fallback={<LoadingOverlay />}>
                          <MerchantDashboardPage />
                        </Suspense>
                      </MerchantLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path={PATHS.MERCHANT_DEALS}
                  element={
                    <ProtectedRoute>
                      <MerchantLayout>
                        <Suspense fallback={<LoadingOverlay />}>
                          <MerchantMyDealsPage />
                        </Suspense>
                      </MerchantLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path={PATHS.MERCHANT_DEALS_HIDDEN}
                  element={
                    <ProtectedRoute>
                      <MerchantLayout>
                        <Suspense fallback={<LoadingOverlay />}>
                          <MerchantHiddenDealsPage />
                        </Suspense>
                      </MerchantLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path={PATHS.MERCHANT_DEALS_BOUNTIES}
                  element={
                    <ProtectedRoute>
                      <MerchantLayout>
                        <Suspense fallback={<LoadingOverlay />}>
                          <MerchantBountyDealsPage />
                        </Suspense>
                      </MerchantLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path={PATHS.MERCHANT_REFERRALS}
                  element={
                    <ProtectedRoute>
                      <MerchantLayout>
                        <Suspense fallback={<LoadingOverlay />}>
                          <MerchantReferralsPage />
                        </Suspense>
                      </MerchantLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path={PATHS.MERCHANT_REFERRAL_DEALS}
                  element={
                    <ProtectedRoute>
                      <MerchantLayout>
                        <Suspense fallback={<LoadingOverlay />}>
                          <MerchantReferralDealsPage />
                        </Suspense>
                      </MerchantLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path={PATHS.MERCHANT_MEMBERSHIP_TIERS}
                  element={
                    <ProtectedRoute>
                      <MerchantLayout>
                        <Suspense fallback={<LoadingOverlay />}>
                          <MerchantMembershipTiersPage />
                        </Suspense>
                      </MerchantLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/merchant/deals/create/*"
                  element={
                    <ProtectedRoute>
                      <MerchantLayout>
                        <Suspense fallback={<LoadingOverlay />}>
                          <CreateDealPage />
                        </Suspense>
                      </MerchantLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/merchant/deals/:dealId/edit"
                  element={
                    <ProtectedRoute>
                      <MerchantLayout>
                        <Suspense fallback={<LoadingOverlay />}>
                          <DealEditPage />
                        </Suspense>
                      </MerchantLayout>
                    </ProtectedRoute>
                  }
                />
                {/* Merchant Events */}
                <Route
                  path={PATHS.MERCHANT_EVENTS}
                  element={
                    <ProtectedRoute>
                      <MerchantLayout>
                        <Suspense fallback={<LoadingOverlay />}>
                          <MerchantMyEventsPage />
                        </Suspense>
                      </MerchantLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path={PATHS.MERCHANT_EVENTS_CREATE}
                  element={
                    <ProtectedRoute>
                      <MerchantLayout>
                        <Suspense fallback={<LoadingOverlay />}>
                          <CreateEventPage />
                        </Suspense>
                      </MerchantLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path={PATHS.MERCHANT_EVENTS_MANAGE}
                  element={
                    <ProtectedRoute>
                      <MerchantLayout>
                        <Suspense fallback={<LoadingOverlay />}>
                          <EventManagePage />
                        </Suspense>
                      </MerchantLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path={PATHS.MERCHANT_EVENTS_CHECKIN}
                  element={
                    <ProtectedRoute>
                      <MerchantLayout>
                        <Suspense fallback={<LoadingOverlay />}>
                          <EventCheckInPage />
                        </Suspense>
                      </MerchantLayout>
                    </ProtectedRoute>
                  }
                />
                {/* Merchant Services */}
                <Route
                  path={PATHS.MERCHANT_SERVICES}
                  element={
                    <ProtectedRoute>
                      <MerchantLayout>
                        <Suspense fallback={<LoadingOverlay />}>
                          <MerchantMyServicesPage />
                        </Suspense>
                      </MerchantLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path={PATHS.MERCHANT_SERVICES_CREATE}
                  element={
                    <ProtectedRoute>
                      <MerchantLayout>
                        <Suspense fallback={<LoadingOverlay />}>
                          <ServiceCreatePage />
                        </Suspense>
                      </MerchantLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path={PATHS.MERCHANT_SERVICES_MANAGE}
                  element={
                    <ProtectedRoute>
                      <MerchantLayout>
                        <Suspense fallback={<LoadingOverlay />}>
                          <ServiceManagePage />
                        </Suspense>
                      </MerchantLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path={PATHS.MERCHANT_SERVICES_CHECKIN}
                  element={
                    <ProtectedRoute>
                      <MerchantLayout>
                        <Suspense fallback={<LoadingOverlay />}>
                          <ServiceCheckInPage />
                        </Suspense>
                      </MerchantLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/merchant/onboarding/*"
                  element={
                    <ProtectedRoute>
                      <MerchantLayout>
                        <Suspense fallback={<LoadingOverlay />}>
                          <MerchantOnboardingPage />
                        </Suspense>
                      </MerchantLayout>
                    </ProtectedRoute>
                  }
                />

                {/* Merchant Food Trucks */}
                <Route
                  path={PATHS.MERCHANT_TRUCKS}
                  element={
                    <ProtectedRoute>
                      <MerchantLayout>
                        <Suspense fallback={<LoadingOverlay />}>
                          <MerchantTrucksPage />
                        </Suspense>
                      </MerchantLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path={PATHS.MERCHANT_TRUCKS_CREATE}
                  element={
                    <ProtectedRoute>
                      <MerchantLayout>
                        <Suspense fallback={<LoadingOverlay />}>
                          <MerchantTruckCreatePage />
                        </Suspense>
                      </MerchantLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path={PATHS.MERCHANT_TRUCK_SCHEDULE}
                  element={
                    <ProtectedRoute>
                      <MerchantLayout>
                        <Suspense fallback={<LoadingOverlay />}>
                          <MerchantTruckSchedulePage />
                        </Suspense>
                      </MerchantLayout>
                    </ProtectedRoute>
                  }
                />

                {/* Merchant Catering */}
                <Route
                  path={PATHS.MERCHANT_CATERING}
                  element={
                    <ProtectedRoute>
                      <MerchantLayout>
                        <Suspense fallback={<LoadingOverlay />}>
                          <MerchantCateringPage />
                        </Suspense>
                      </MerchantLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path={PATHS.MERCHANT_CATERING_CREATE}
                  element={
                    <ProtectedRoute>
                      <MerchantLayout>
                        <Suspense fallback={<LoadingOverlay />}>
                          <MerchantCateringFormPage />
                        </Suspense>
                      </MerchantLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path={PATHS.MERCHANT_CATERING_ORDERS}
                  element={
                    <ProtectedRoute>
                      <MerchantLayout>
                        <Suspense fallback={<LoadingOverlay />}>
                          <MerchantCateringOrdersPage />
                        </Suspense>
                      </MerchantLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path={PATHS.MERCHANT_CATERING_ORDER_DETAIL}
                  element={
                    <ProtectedRoute>
                      <MerchantLayout>
                        <Suspense fallback={<LoadingOverlay />}>
                          <MerchantCateringOrderDetailPage />
                        </Suspense>
                      </MerchantLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path={PATHS.MERCHANT_CATERING_EDIT}
                  element={
                    <ProtectedRoute>
                      <MerchantLayout>
                        <Suspense fallback={<LoadingOverlay />}>
                          <MerchantCateringFormPage />
                        </Suspense>
                      </MerchantLayout>
                    </ProtectedRoute>
                  }
                />

                <Route
                  path={PATHS.MERCHANT_KICKBACKS}
                  element={
                    <ProtectedRoute>
                      <MerchantLayout>
                        <Suspense fallback={<LoadingOverlay />}>
                          <KickbackEarningsPage />
                        </Suspense>
                      </MerchantLayout>
                    </ProtectedRoute>
                  }
                />

                <Route
                  path={PATHS.MERCHANT_STORES}
                  element={
                    <ProtectedRoute>
                      <MerchantLayout>
                        <Suspense fallback={<LoadingOverlay />}>
                          <StoreManagementPage />
                        </Suspense>
                      </MerchantLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path={PATHS.MERCHANT_STORES_CREATE}
                  element={
                    <ProtectedRoute>
                      <MerchantLayout>
                        <Suspense fallback={<LoadingOverlay />}>
                          <StoreFormPage />
                        </Suspense>
                      </MerchantLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/merchant/stores/:storeId/edit"
                  element={
                    <ProtectedRoute>
                      <MerchantLayout>
                        <Suspense fallback={<LoadingOverlay />}>
                          <StoreFormPage />
                        </Suspense>
                      </MerchantLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/merchant/stores/:storeId"
                  element={
                    <ProtectedRoute>
                      <MerchantLayout>
                        <Suspense fallback={<LoadingOverlay />}>
                          <StoreDetailPage />
                        </Suspense>
                      </MerchantLayout>
                    </ProtectedRoute>
                  }
                />

                <Route
                  path={PATHS.MERCHANT_MENU}
                  element={
                    <ProtectedRoute>
                      <MerchantLayout>
                        <Suspense fallback={<LoadingOverlay />}>
                          <MenuManagementPage />
                        </Suspense>
                      </MerchantLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path={PATHS.MERCHANT_MENU_CREATE}
                  element={
                    <ProtectedRoute>
                      <MerchantLayout>
                        <Suspense fallback={<LoadingOverlay />}>
                          <MenuItemFormPage />
                        </Suspense>
                      </MerchantLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/merchant/menu/:itemId/edit"
                  element={
                    <ProtectedRoute>
                      <MerchantLayout>
                        <Suspense fallback={<LoadingOverlay />}>
                          <MenuItemFormPage />
                        </Suspense>
                      </MerchantLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/merchant/menu/:itemId"
                  element={
                    <ProtectedRoute>
                      <MerchantLayout>
                        <Suspense fallback={<LoadingOverlay />}>
                          <MenuItemDetailPage />
                        </Suspense>
                      </MerchantLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path={PATHS.MERCHANT_MENU_COLLECTIONS}
                  element={
                    <ProtectedRoute>
                      <MerchantLayout>
                        <Suspense fallback={<LoadingOverlay />}>
                          <MenuCollectionsPage />
                        </Suspense>
                      </MerchantLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path={PATHS.MERCHANT_INVENTORY}
                  element={
                    <ProtectedRoute>
                      <MerchantLayout>
                        <Suspense fallback={<LoadingOverlay />}>
                          <InventoryPage />
                        </Suspense>
                      </MerchantLayout>
                    </ProtectedRoute>
                  }
                />

                {/* Blog routes */}
                <Route
                  path={PATHS.MERCHANT_BLOG}
                  element={
                    <ProtectedRoute>
                      <MerchantLayout>
                        <Suspense fallback={<LoadingOverlay />}>
                          <BlogListPage />
                        </Suspense>
                      </MerchantLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path={PATHS.MERCHANT_BLOG_CREATE}
                  element={
                    <ProtectedRoute>
                      <MerchantLayout>
                        <Suspense fallback={<LoadingOverlay />}>
                          <BlogPostFormPage />
                        </Suspense>
                      </MerchantLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path={PATHS.MERCHANT_BLOG_EDIT}
                  element={
                    <ProtectedRoute>
                      <MerchantLayout>
                        <Suspense fallback={<LoadingOverlay />}>
                          <BlogPostFormPage />
                        </Suspense>
                      </MerchantLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path={PATHS.MERCHANT_BLOG_CATEGORIES}
                  element={
                    <ProtectedRoute>
                      <MerchantLayout>
                        <Suspense fallback={<LoadingOverlay />}>
                          <BlogCategoriesPage />
                        </Suspense>
                      </MerchantLayout>
                    </ProtectedRoute>
                  }
                />

                <Route
                  path={PATHS.MERCHANT_ANALYTICS}
                  element={
                    <ProtectedRoute>
                      <MerchantLayout>
                        <Suspense fallback={<LoadingOverlay />}>
                          <MerchantAnalyticsPage />
                        </Suspense>
                      </MerchantLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path={PATHS.MERCHANT_CHECKIN_GAMES}
                  element={
                    <ProtectedRoute>
                      <MerchantLayout>
                        <Suspense fallback={<LoadingOverlay />}>
                          <MerchantCheckInGamesPage />
                        </Suspense>
                      </MerchantLayout>
                    </ProtectedRoute>
                  }
                />

                {/* Merchant Loyalty */}
                <Route
                  path={PATHS.MERCHANT_LOYALTY_SETUP}
                  element={
                    <ProtectedRoute>
                      <MerchantLayout>
                        <Suspense fallback={<LoadingOverlay />}>
                          <MerchantLoyaltySetupPage />
                        </Suspense>
                      </MerchantLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path={PATHS.MERCHANT_LOYALTY_PROGRAM}
                  element={
                    <ProtectedRoute>
                      <MerchantLayout>
                        <Suspense fallback={<LoadingOverlay />}>
                          <MerchantLoyaltyProgramPage />
                        </Suspense>
                      </MerchantLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path={PATHS.MERCHANT_LOYALTY_ANALYTICS}
                  element={
                    <ProtectedRoute>
                      <MerchantLayout>
                        <Suspense fallback={<LoadingOverlay />}>
                          <MerchantLoyaltyAnalyticsPage />
                        </Suspense>
                      </MerchantLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path={PATHS.MERCHANT_LOYALTY_CUSTOMERS}
                  element={
                    <ProtectedRoute>
                      <MerchantLayout>
                        <Suspense fallback={<LoadingOverlay />}>
                          <MerchantLoyaltyCustomersPage />
                        </Suspense>
                      </MerchantLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path={PATHS.MERCHANT_LOYALTY_TRANSACTIONS}
                  element={
                    <ProtectedRoute>
                      <MerchantLayout>
                        <Suspense fallback={<LoadingOverlay />}>
                          <MerchantLoyaltyTransactionsPage />
                        </Suspense>
                      </MerchantLayout>
                    </ProtectedRoute>
                  }
                />

                <Route
                  path={PATHS.ADMIN_LOGIN}
                  element={
                    <Suspense fallback={<LoadingOverlay />}>
                      <AdminLoginPage />
                    </Suspense>
                  }
                />

                <Route
                  path={PATHS.ADMIN_DASHBOARD}
                  element={
                    <AdminProtectedRoute>
                      <AdminLayout />
                    </AdminProtectedRoute>
                  }
                >
                  <Route
                    index
                    element={
                      <Suspense fallback={<LoadingOverlay />}>
                        <AdminDashboardPage />
                      </Suspense>
                    }
                  />
                  <Route
                    path="/admin/real-time"
                    element={
                      <Suspense fallback={<LoadingOverlay />}>
                        <AdminRealTimeAnalyticsPage />
                      </Suspense>
                    }
                  />
                  <Route
                    path="/admin/crm"
                    element={
                      <Suspense fallback={<LoadingOverlay />}>
                        <CustomerCRMPage />
                      </Suspense>
                    }
                  />
                  <Route
                    path={PATHS.ADMIN_MERCHANTS}
                    element={
                      <Suspense fallback={<LoadingOverlay />}>
                        <MerchantApprovalDashboard />
                      </Suspense>
                    }
                  />
                  <Route
                    path={PATHS.ADMIN_CITIES}
                    element={
                      <Suspense fallback={<LoadingOverlay />}>
                        <CityManagementDashboard />
                      </Suspense>
                    }
                  />
                  <Route
                    path="/admin/city-analytics"
                    element={
                      <Suspense fallback={<LoadingOverlay />}>
                        <CityAnalyticsDashboard />
                      </Suspense>
                    }
                  />
                  <Route
                    path={PATHS.ADMIN_CUSTOMERS}
                    element={
                      <Suspense fallback={<LoadingOverlay />}>
                        <CustomerManagementPage />
                      </Suspense>
                    }
                  />
                  <Route
                    path="/admin/customers/:customerId"
                    element={
                      <Suspense fallback={<LoadingOverlay />}>
                        <CustomerDetailPage />
                      </Suspense>
                    }
                  />
                  <Route
                    path="/admin/analytics"
                    element={
                      <Suspense fallback={<LoadingOverlay />}>
                        <AdminDashboardPage />
                      </Suspense>
                    }
                  />
                  <Route
                    path="/admin/master-data"
                    element={
                      <Suspense fallback={<LoadingOverlay />}>
                        <AdminDashboardPage />
                      </Suspense>
                    }
                  />
                  <Route
                    path={PATHS.ADMIN_NUDGES}
                    element={
                      <Suspense fallback={<LoadingOverlay />}>
                        <AdminNudgesPage />
                      </Suspense>
                    }
                  />
                  <Route
                    path={PATHS.ADMIN_GAMES}
                    element={
                      <Suspense fallback={<LoadingOverlay />}>
                        <AdminGamesPage />
                      </Suspense>
                    }
                  />
                </Route>

                {/* Consumer Surprises */}
                <Route element={<DefaultLayout />}>
                  <Route
                    path={PATHS.SURPRISES}
                    element={
                      <ProtectedRoute>
                        <Suspense fallback={<LoadingOverlay />}>
                          <SurprisesPage />
                        </Suspense>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path={PATHS.MY_REVEAL_HISTORY}
                    element={
                      <ProtectedRoute>
                        <Suspense fallback={<LoadingOverlay />}>
                          <MyRevealHistoryPage />
                        </Suspense>
                      </ProtectedRoute>
                    }
                  />
                </Route>

                {/* Merchant Surprises */}
                <Route
                  path={PATHS.MERCHANT_SURPRISES}
                  element={
                    <ProtectedRoute>
                      <MerchantLayout>
                        <Suspense fallback={<LoadingOverlay />}>
                          <MerchantMySurprisesPage />
                        </Suspense>
                      </MerchantLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path={PATHS.MERCHANT_SURPRISES_CREATE}
                  element={
                    <ProtectedRoute>
                      <MerchantLayout>
                        <Suspense fallback={<LoadingOverlay />}>
                          <SurpriseCreatePage />
                        </Suspense>
                      </MerchantLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path={PATHS.MERCHANT_SURPRISES_ANALYTICS}
                  element={
                    <ProtectedRoute>
                      <MerchantLayout>
                        <Suspense fallback={<LoadingOverlay />}>
                          <SurpriseAnalyticsPage />
                        </Suspense>
                      </MerchantLayout>
                    </ProtectedRoute>
                  }
                />

                {/* Consumer Nudge History */}
                <Route element={<DefaultLayout />}>
                  <Route
                    path={PATHS.NUDGE_HISTORY}
                    element={
                      <ProtectedRoute>
                        <Suspense fallback={<LoadingOverlay />}>
                          <NudgeHistoryPage />
                        </Suspense>
                      </ProtectedRoute>
                    }
                  />
                </Route>

                <Route path={PATHS.NOT_FOUND} element={<NotFoundPage />} />
              </Routes>
              <NudgeToast />
              <Toaster />
            </ModalProvider>
          </CityProvider>
        </AuthProvider>
      </RedirectProvider>
    </BrowserRouter>
  );
}

export default App;
