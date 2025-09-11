import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { SignUpPage } from './pages/SignUpPage';
import { ProfilePage } from './pages/ProfilePage';
import { AboutPage } from './pages/AboutPage';
import { ForBusinessesPage } from './pages/ForBusinessesPage';
import { PrivacyPage } from './pages/PrivacyPage';
import { TermsPage } from './pages/TermsPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { MerchantLayout } from './components/layout/MerchantLayout';
import { ProtectedRoute } from './routing/ProtectedRoute';
import { PATHS } from './routing/paths';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from './context/AuthContext';
import { RedirectProvider } from './context/RedirectContext';
import { ModalProvider } from './context/ModalContext';
import { AllDealsPage } from './pages/AllDealsPage';
import { MerchantOnboardingPage } from './pages/merchant/MerchantOnboardingPage';
import { MerchantDashboardPage } from './pages/merchant/MerchantDashboardPage';
import { CreateDealPage } from './pages/merchant/DealCreatePage';

// Helper for default layout
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
      <RedirectProvider>
        <AuthProvider>
          <ModalProvider>
            <Routes>
          {/* Public Routes */}
          <Route element={<DefaultLayout />}>
            <Route path={PATHS.HOME} element={<HomePage />} />
            <Route path={PATHS.LOGIN} element={<LoginPage />} />
            <Route path={PATHS.SIGNUP} element={<SignUpPage />} />
            <Route path={PATHS.PROFILE} element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
            <Route path={PATHS.ABOUT} element={<AboutPage />} />
            <Route path={PATHS.ALL_DEALS} element={<AllDealsPage />} />
            <Route
              path={PATHS.FOR_BUSINESSES}
              element={<ForBusinessesPage />}
            />
            <Route path={PATHS.PRIVACY} element={<PrivacyPage />} />
            <Route path={PATHS.TERMS} element={<TermsPage />} />
          </Route>

          {/* Merchant Protected Routes */}
          <Route
            path={PATHS.MERCHANT_DASHBOARD}
            element={
              <ProtectedRoute>
                <MerchantLayout>
                  <MerchantDashboardPage />
                </MerchantLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/merchant/deals/create/*"
            element={
              <ProtectedRoute>
                <MerchantLayout>
                  <CreateDealPage />
                </MerchantLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/merchant/onboarding/*"
            element={
              <ProtectedRoute>
                <MerchantLayout>
                  <MerchantOnboardingPage />
                </MerchantLayout>
              </ProtectedRoute>
            }
          />

          {/* Catch-all route for 404 */}
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
