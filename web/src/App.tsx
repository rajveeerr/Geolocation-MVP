import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { SignUpPage } from './pages/SignUpPage';
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
const MerchantAnalyticsPage = React.lazy(() =>
  import('./pages/merchant/MerchantAnalyticsPage').then((m) => ({
    default: m.MerchantAnalyticsPage,
  })),
);
const CreateDealPage = React.lazy(() =>
  import('./pages/merchant/DealCreatePage').then((m) => ({
    default: m.CreateDealPage,
  })),
);
const EnhancedDealDetailPage = React.lazy(() =>
  import('./pages/EnhancedDealDetailPage').then((m) => ({ default: m.EnhancedDealDetailPage })),
);
const AdminLoginPage = React.lazy(() =>
  import('./pages/admin/AdminLoginPage').then((m) => ({ default: m.AdminLoginPage })),
);
const AdminDashboardPage = React.lazy(() =>
  import('./pages/admin/AdminDashboardPage').then((m) => ({ default: m.AdminDashboardPage })),
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
const ReferralPage = React.lazy(() =>
  import('./pages/ReferralPage').then((m) => ({ default: m.ReferralPage })),
);
const GamificationPage = React.lazy(() =>
  import('./pages/GamificationPage').then((m) => ({ default: m.GamificationPage })),
);
const StreakLeaderboardPage = React.lazy(() =>
  import('./pages/StreakLeaderboard').then((m) => ({ default: m.StreakLeaderboardPage })),
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
  import('./pages/merchant/MenuManagementPage').then((m) => ({ default: m.MenuManagementPage })),
);
const MenuItemFormPage = React.lazy(() =>
  import('./pages/merchant/MenuItemFormPage').then((m) => ({ default: m.MenuItemFormPage })),
);
const MenuItemDetailPage = React.lazy(() =>
  import('./pages/merchant/MenuItemDetailPage').then((m) => ({ default: m.MenuItemDetailPage })),
);
const StoreDetailPage = React.lazy(() =>
  import('./pages/merchant/StoreDetailPage').then((m) => ({ default: m.StoreDetailPage })),
);
const MerchantMyDealsPage = React.lazy(() =>
  import('./pages/merchant/MerchantMyDealsPage').then((m) => ({ default: m.MerchantMyDealsPage })),
);
import { LoadingOverlay } from '@/components/ui/LoadingOverlay';
import { ScrollToTop } from '@/components/common/ScrollToTop';
import { PaymentSuccessPage } from './pages/PaymentSuccessPage';
import { PaymentCancelPage } from './pages/PaymentCancelPage';
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

const DefaultLayout = () => (
  <>
    <Header />
    <main>
      <Outlet />
    </main>
    <Footer />
  </>
);

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <RedirectProvider>
          <AuthProvider>
            <ModalProvider>
            <Routes>
              <Route element={<DefaultLayout />}>
                <Route path={PATHS.HOME} element={<HomePage />} />
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
                  path={PATHS.DEAL_DETAIL}
                  element={
                    <Suspense fallback={<LoadingOverlay />}>
                      <EnhancedDealDetailPage />
                    </Suspense>
                  }
                />
                <Route
                  path={PATHS.FOR_BUSINESSES}
                  element={<ForBusinessesPage />}
                />
                <Route path={PATHS.PRIVACY} element={<PrivacyPage />} />
                <Route path={PATHS.TERMS} element={<TermsPage />} />
                <Route path={PATHS.PAYMENT_SUCCESS} element={<PaymentSuccessPage />} />
                <Route path={PATHS.PAYMENT_CANCEL} element={<PaymentCancelPage />} />
              </Route>

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
                      <CityManagementDashboard />
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
              </Route>
              <Route path={PATHS.NOT_FOUND} element={<NotFoundPage />} />
            </Routes>
            <Toaster />
            </ModalProvider>
          </AuthProvider>
        </RedirectProvider>
    </BrowserRouter>
  );
}

export default App;
