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
const CreateDealPage = React.lazy(() =>
  import('./pages/merchant/DealCreatePage').then((m) => ({
    default: m.CreateDealPage,
  })),
);
const DealDetailPage = React.lazy(() =>
  import('./pages/DealDetailPage').then((m) => ({ default: m.DealDetailPage })),
);
const EnhancedDealDetailPage = React.lazy(() =>
  import('./pages/EnhancedDealDetailPage').then((m) => ({ default: m.EnhancedDealDetailPage })),
);
const AdminLoginPage = React.lazy(() =>
  import('./pages/admin/AdminLoginPage').then((m) => ({ default: m.AdminLoginPage })),
);
const AdminOverviewPage = React.lazy(() =>
  import('./pages/admin/AdminOverviewPage').then((m) => ({ default: m.AdminOverviewPage })),
);
const MerchantApprovalDashboard = React.lazy(() =>
  import('./pages/admin/MerchantApprovalDashboard').then((m) => ({ default: m.MerchantApprovalDashboard })),
);
const CityManagementDashboard = React.lazy(() =>
  import('./pages/admin/CityManagementDashboard').then((m) => ({ default: m.CityManagementDashboard })),
);
const CustomerManagementPage = React.lazy(() =>
  import('./pages/admin/CustomerManagementPage').then((m) => ({ default: m.CustomerManagementPage })),
);
const LeaderboardPage = React.lazy(() =>
  import('./pages/LeaderboardPage').then((m) => ({
    default: m.LeaderboardPage,
  })),
);
const ReferralPage = React.lazy(() =>
  import('./pages/ReferralPage').then((m) => ({ default: m.ReferralPage })),
);
const KickbackEarningsPage = React.lazy(() =>
  import('./pages/merchant/KickbackEarningsPage').then((m) => ({ default: m.KickbackEarningsPage })),
);
import { LoadingOverlay } from '@/components/ui/LoadingOverlay';
import { ScrollToTop } from '@/components/common/ScrollToTop';

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
                  path={PATHS.LEADERBOARD}
                  element={
                    <Suspense fallback={<LoadingOverlay />}>
                      <LeaderboardPage />
                    </Suspense>
                  }
                />
                <Route path={PATHS.ALL_DEALS} element={<AllDealsPage />} />
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
                      <AdminOverviewPage />
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
                  path={PATHS.ADMIN_CUSTOMERS}
                  element={
                    <Suspense fallback={<LoadingOverlay />}>
                      <CustomerManagementPage />
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
