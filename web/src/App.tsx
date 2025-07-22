import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { SignUpPage } from './pages/SignUpPage';
import { ProfilePage } from './pages/ProfilePage';
import { AboutPage } from './pages/AboutPage';
import { ForBusinessesPage } from './pages/ForBusinessesPage';
import { PrivacyPage } from './pages/PrivacyPage';
import { TermsPage } from './pages/TermsPage';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { PATHS } from './routing/paths';
import { Toaster } from "@/components/ui/toaster"

function App() {
  return (
    <BrowserRouter>
      <Header />
      <main>
        <Routes>
          <Route path={PATHS.HOME} element={<HomePage />} />
          <Route path={PATHS.LOGIN} element={<LoginPage />} />
          <Route path={PATHS.SIGNUP} element={<SignUpPage />} />
          <Route path={PATHS.PROFILE} element={<ProfilePage />} />
          <Route path={PATHS.ABOUT} element={<AboutPage />} />
          <Route path={PATHS.FOR_BUSINESSES} element={<ForBusinessesPage />} />
          <Route path={PATHS.PRIVACY} element={<PrivacyPage />} />
          <Route path={PATHS.TERMS} element={<TermsPage />} />
        </Routes>
      </main>
      <Footer />
      <Toaster />
    </BrowserRouter>
  );
}

export default App;