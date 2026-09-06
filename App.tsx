import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/hooks/useAuth';
import { MainLayout } from '@/layouts/MainLayout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { AdminRoute } from '@/components/AdminRoute';
import { HomePage } from '@/pages/HomePage';
import { LoginPage } from '@/pages/LoginPage';
import { RegisterPage } from '@/pages/RegisterPage';
import { BrowseItemsPage } from '@/pages/BrowseItemsPage';
import { ItemDetailPage } from '@/pages/ItemDetailPage';
import { ReportItemPage } from '@/pages/ReportItemPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { AdminPage } from '@/pages/AdminPage';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <MainLayout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/items" element={<BrowseItemsPage />} />
            <Route path="/items/:id" element={<ItemDetailPage />} />
            <Route
              path="/report-lost"
              element={
                <ProtectedRoute>
                  <ReportItemPage type="lost" />
                </ProtectedRoute>
              }
            />
            <Route
              path="/report-found"
              element={
                <ProtectedRoute>
                  <ReportItemPage type="found" />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AdminPage />
                </AdminRoute>
              }
            />
            <Route path="*" element={<HomePage />} />
          </Routes>
        </MainLayout>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
