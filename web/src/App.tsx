import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { SignUpPage } from './pages/SignUpPage';
import { ProfilePage } from './pages/ProfilePage';

function App() {
  return (
    <BrowserRouter>
      <header className="bg-neutral-surface shadow-level-1">
        <nav className="p-md mx-auto flex max-w-6xl items-center justify-between">
          <Link to="/" className="text-h3 text-brand-primary font-bold">
            CitySpark
          </Link>
          <div className="gap-md flex items-center">
            <Link
              to="/login"
              className="text-label text-neutral-text-secondary hover:text-brand-primary transition"
            >
              Login
            </Link>
            <Link
              to="/signup"
              className="text-label text-neutral-text-secondary hover:text-brand-primary transition"
            >
              Sign Up
            </Link>
            <Link
              to="/profile"
              className="text-label text-neutral-text-secondary hover:text-brand-primary transition"
            >
              Profile
            </Link>
          </div>
        </nav>
      </header>

      <main className="mx-auto max-w-6xl">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}

export default App;
