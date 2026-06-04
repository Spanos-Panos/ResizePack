import { lazy, Suspense } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { AuthProvider } from '../auth/AuthContext';
import { RequireAuth } from './RequireAuth';
import { ToolPage } from '../pages/ToolPage';

// The landing/tool page is what most visitors hit, so it stays eager. The
// secondary routes are lazy-loaded to keep the initial bundle small (cuts
// unused JS on first paint — see brief §15.2 / PageSpeed).
const LoginPage = lazy(() => import('../pages/LoginPage').then((m) => ({ default: m.LoginPage })));
const ResetPasswordPage = lazy(() =>
  import('../pages/ResetPasswordPage').then((m) => ({ default: m.ResetPasswordPage })),
);
const AccountPage = lazy(() =>
  import('../pages/AccountPage').then((m) => ({ default: m.AccountPage })),
);
const PrivacyPage = lazy(() =>
  import('../pages/legal/PrivacyPage').then((m) => ({ default: m.PrivacyPage })),
);
const TermsPage = lazy(() =>
  import('../pages/legal/TermsPage').then((m) => ({ default: m.TermsPage })),
);
const RefundPage = lazy(() =>
  import('../pages/legal/RefundPage').then((m) => ({ default: m.RefundPage })),
);
const FAQPage = lazy(() => import('../pages/FAQPage').then((m) => ({ default: m.FAQPage })));

export function AppRouter() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Suspense fallback={null}>
          <Routes>
            <Route path="/" element={<ToolPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/refund" element={<RefundPage />} />
            <Route path="/faq" element={<FAQPage />} />
            <Route
              path="/account"
              element={
                <RequireAuth>
                  <AccountPage />
                </RequireAuth>
              }
            />
          </Routes>
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
  );
}
