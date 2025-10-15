import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useLocation, useNavigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { QuotePanelProvider } from './contexts/QuotePanelContext';
import Header from './components/Layout/Header';
import Footer from './components/Layout/Footer';
import MobileBottomNavBar from './components/Layout/MobileBottomNavBar';
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import ProductionEquipmentPage from './pages/ProductionEquipmentPage';
import HomeEcEquipmentPage from './pages/HomeEcEquipmentPage';
import NewProductionEquipmentPage from './pages/NewProductionEquipmentPage';
import NewHomeEcEquipmentPage from './pages/NewHomeEcEquipmentPage';
import ProjectsPage from './pages/ProjectsPage';
import ProjectDetailPage from './pages/ProjectDetailPage';
import ContactPage from './pages/ContactPage';
import QuotePage from './pages/QuotePage';
import LoginPage from './pages/LoginPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import AdminRoute from './components/Auth/AdminRoute';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import AdminDashboardPage from './pages/Admin/AdminDashboardPage';
import AdminOverviewPage from './pages/Admin/AdminOverviewPage';
import EquipmentManagementPage from './pages/Admin/EquipmentManagementPage';
import EquipmentFormPage from './pages/Admin/EquipmentFormPage';
import QuoteRequestsManagementPage from './pages/Admin/QuoteRequestsManagementPage';
import QuoteRequestDetailPage from './pages/Admin/QuoteRequestDetailPage';
import ProjectManagementPage from './pages/Admin/ProjectManagementPage';
import ProjectFormPage from './pages/Admin/ProjectFormPage';
import ScrollToTop from './components/ScrollToTop';
import QuoteEmailPreviewPage from './pages/QuoteEmailPreviewPage';
import QuotePanel from './components/QuotePanel';

const AppContent: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isAdminRoute = location.pathname.startsWith('/admin');

  React.useEffect(() => {
    const hashParams = new URLSearchParams(location.hash.substring(1));
    const type = hashParams.get('type');
    const accessToken = hashParams.get('access_token');

    if (type === 'recovery' && accessToken && location.pathname !== '/reset-password') {
      console.log('App: Detected recovery token on non-reset-password page, redirecting');
      navigate('/reset-password' + location.hash, { replace: true });
    }
  }, [location.hash, location.pathname, navigate]);

  return (
    <div className="min-h-screen flex flex-col">
      <ScrollToTop />
      {!isAdminRoute && <Header />}
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/production-equipment" element={<ProductionEquipmentPage />} />
          <Route path="/new-production-equipment" element={<NewProductionEquipmentPage />} />
          <Route path="/home-ec-equipment" element={<NewHomeEcEquipmentPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/quote" element={<QuotePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/preview-quote-email" element={<QuoteEmailPreviewPage />} />
          
          {/* Admin Routes */}
          <Route path="/admin" element={
            <AdminRoute>
              <AdminDashboardPage />
            </AdminRoute>
          }>
            <Route index element={<AdminOverviewPage />} />
            <Route path="equipment" element={<EquipmentManagementPage />} />
            <Route path="equipment/new" element={<EquipmentFormPage />} />
            <Route path="equipment/:id/edit" element={<EquipmentFormPage />} />
            <Route path="quote-requests" element={<QuoteRequestsManagementPage />} />
            <Route path="quote-requests/:id" element={<QuoteRequestDetailPage />} />
          </Route>
        </Routes>
      </main>
      {/* Quote Panel - only show on non-admin routes */}
      {!isAdminRoute && (
        <QuotePanel />
      )}
      {!isAdminRoute && <Footer />}
      {!isAdminRoute && <MobileBottomNavBar />}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <CartProvider>
        <QuotePanelProvider>
          <Router>
            <AppContent />
          </Router>
        </QuotePanelProvider>
      </CartProvider>
    </AuthProvider>
  );
};

export default App;