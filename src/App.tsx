import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LibraryProvider } from './context/LibraryContext';
import { SiteContentProvider } from './context/SiteContentContext';
import { SiteHeader } from './components/common/SiteHeader';
import { SiteFooter } from './components/common/SiteFooter';

// Public Pages
import { HomePage } from './pages/HomePage';
import { BooksPage } from './pages/BooksPage';
import { BookDetailsPage } from './pages/BookDetailsPage';
import { CategoryListingPage } from './pages/CategoryListingPage';
import { ReaderPage } from './pages/ReaderPage';
import { HistoryListingPage } from './pages/history/HistoryListingPage';
import { HistoryDetailPage } from './pages/history/HistoryDetailPage';
import { HardCopyPage } from './pages/HardCopyPage';
import { AboutPage } from './pages/AboutPage';

// Auth Pages
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';

// User Dashboard Pages
import { UserDashboardPage } from './pages/dashboard/UserDashboardPage';
import { ProfilePage } from './pages/dashboard/ProfilePage';
import { MyRequestsPage } from './pages/dashboard/MyRequestsPage';
import { MyLoansPage } from './pages/dashboard/MyLoansPage';
import { MyArchivePage } from './pages/dashboard/MyArchivePage';
import { ChatPage } from './pages/dashboard/ChatPage';
import { NotificationsPage } from './pages/dashboard/NotificationsPage';
import { BorrowPage } from './pages/borrow/BorrowPage';
import { BorrowRequestDetailsPage } from './pages/borrow/BorrowRequestDetailsPage';

// Admin Pages
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminBooksPage } from './pages/admin/AdminBooksPage';
import { AdminAddEditBookPage } from './pages/admin/AdminAddEditBookPage';
import { AdminCategoriesPage } from './pages/admin/AdminCategoriesPage';
import { AdminInventoryPage } from './pages/admin/AdminInventoryPage';
import { AdminRequestsPage } from './pages/admin/AdminRequestsPage';
import { AdminLoansPage } from './pages/admin/AdminLoansPage';
import { AdminUsersPage } from './pages/admin/AdminUsersPage';
import { AdminHistoryPage } from './pages/admin/AdminHistoryPage';
import { AdminSettingsPage } from './pages/admin/AdminSettingsPage';

// Scroll to top helper (instant to eliminate mobile route-transition lag/flickering)
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname]);
  return null;
};

// Loading spinner fallback during initial auth resolution to prevent white flashes and race conditions
const AuthLoadingSpinner: React.FC = () => (
  <div className="flex-1 flex items-center justify-center min-h-[60vh] py-12">
    <div className="flex flex-col items-center gap-3">
      <div className="w-10 h-10 border-3 border-primary/20 border-t-primary rounded-full animate-spin" />
      <span className="text-xs text-brand-muted font-medium">যাচাই করা হচ্ছে...</span>
    </div>
  </div>
);

// Route Guard for Authenticated Users
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, authLoading } = useAuth();
  const location = useLocation();

  if (authLoading) {
    return <AuthLoadingSpinner />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return <>{children}</>;
};

// Route Guard for Admin Users
const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isAdmin, authLoading } = useAuth();
  const location = useLocation();

  if (authLoading) {
    return <AuthLoadingSpinner />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }
  return <>{children}</>;
};

// Layout wrapper for standard pages
const StandardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen">
      <SiteHeader />
      <div className="flex-1">{children}</div>
      <SiteFooter />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <LibraryProvider>
        <SiteContentProvider>
          <BrowserRouter>
            <ScrollToTop />
            <Routes>
            {/* Public Routes with Standard Layout */}
            <Route
              path="/"
              element={
                <StandardLayout>
                  <HomePage />
                </StandardLayout>
              }
            />
            <Route
              path="/books"
              element={
                <StandardLayout>
                  <BooksPage />
                </StandardLayout>
              }
            />
            <Route
              path="/books/:bookId"
              element={
                <StandardLayout>
                  <BookDetailsPage />
                </StandardLayout>
              }
            />
            <Route
              path="/categories/:slug"
              element={
                <StandardLayout>
                  <CategoryListingPage />
                </StandardLayout>
              }
            />
            <Route
              path="/history"
              element={
                <StandardLayout>
                  <HistoryListingPage />
                </StandardLayout>
              }
            />
            <Route
              path="/history/:slug"
              element={
                <StandardLayout>
                  <HistoryDetailPage />
                </StandardLayout>
              }
            />
            <Route
              path="/hard-copy"
              element={
                <StandardLayout>
                  <HardCopyPage />
                </StandardLayout>
              }
            />
            <Route
              path="/about"
              element={
                <StandardLayout>
                  <AboutPage />
                </StandardLayout>
              }
            />

            {/* Auth Routes */}
            <Route
              path="/login"
              element={
                <StandardLayout>
                  <LoginPage />
                </StandardLayout>
              }
            />
            <Route
              path="/register"
              element={
                <StandardLayout>
                  <RegisterPage />
                </StandardLayout>
              }
            />
            <Route
              path="/forgot-password"
              element={
                <StandardLayout>
                  <ForgotPasswordPage />
                </StandardLayout>
              }
            />

            {/* Dedicated PDF Reader (Standalone without header/footer for maximum reading area) */}
            <Route path="/reader/:bookId" element={<ReaderPage />} />

            {/* Authenticated User Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <StandardLayout>
                    <UserDashboardPage />
                  </StandardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <StandardLayout>
                    <ProfilePage />
                  </StandardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-requests"
              element={
                <ProtectedRoute>
                  <StandardLayout>
                    <MyRequestsPage />
                  </StandardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-requests/:requestId"
              element={
                <ProtectedRoute>
                  <StandardLayout>
                    <BorrowRequestDetailsPage />
                  </StandardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-loans"
              element={
                <ProtectedRoute>
                  <StandardLayout>
                    <MyLoansPage />
                  </StandardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-archive"
              element={
                <ProtectedRoute>
                  <StandardLayout>
                    <MyArchivePage />
                  </StandardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/chat"
              element={
                <ProtectedRoute>
                  <StandardLayout>
                    <ChatPage />
                  </StandardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/chat/:chatId"
              element={
                <ProtectedRoute>
                  <StandardLayout>
                    <ChatPage />
                  </StandardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/notifications"
              element={
                <ProtectedRoute>
                  <StandardLayout>
                    <NotificationsPage />
                  </StandardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/borrow/:bookId"
              element={
                <ProtectedRoute>
                  <StandardLayout>
                    <BorrowPage />
                  </StandardLayout>
                </ProtectedRoute>
              }
            />

            {/* Protected Admin Routes */}
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AdminDashboardPage />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/books"
              element={
                <AdminRoute>
                  <AdminBooksPage />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/books/new"
              element={
                <AdminRoute>
                  <AdminAddEditBookPage />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/books/:bookId/edit"
              element={
                <AdminRoute>
                  <AdminAddEditBookPage />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/categories"
              element={
                <AdminRoute>
                  <AdminCategoriesPage />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/inventory"
              element={
                <AdminRoute>
                  <AdminInventoryPage />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/requests"
              element={
                <AdminRoute>
                  <AdminRequestsPage />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/loans"
              element={
                <AdminRoute>
                  <AdminLoansPage />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <AdminRoute>
                  <AdminUsersPage />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/history"
              element={
                <AdminRoute>
                  <AdminHistoryPage />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/history/new"
              element={
                <AdminRoute>
                  <AdminHistoryPage />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/settings"
              element={
                <AdminRoute>
                  <AdminSettingsPage />
                </AdminRoute>
              }
            />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
        </SiteContentProvider>
      </LibraryProvider>
    </AuthProvider>
  );
};

export default App;
