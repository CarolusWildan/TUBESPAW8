import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import MainLayout from "../layouts/MainLayout";
import HomePage from "../pages/HomePage";
import RegisterPage from "../pages/RegisterPage";
import LoginPage from "../pages/LoginPage";
import DashboardPage from "../pages/DashboardPage";
import FilmPage from "../pages/FilmPage";
import KelolaFilmPage from "../pages/KelolaFilmPage";
import KelolaStudioPage from "../pages/KelolaStudioPage";
import KelolaJadwalPage from "../pages/KelolaJadwalPage";
import PesanTiketPage from "../pages/PesanTiketPage";
import PilihJadwalPage from "../pages/PilihJadwalPage";
import ReportPage from '../pages/ReportPage';
import RiwayatPage from "../pages/RiwayatPage";

// Protected Route Component
const ProtectedRoute = ({ children }) => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
        return <Navigate to="/login" replace />;
    }
    return children;
};

// Admin Route Component
const AdminRoute = ({ children }) => {
    const token = localStorage.getItem('auth_token');
    const userString = localStorage.getItem('user');
    const user = userString ? JSON.parse(userString) : null;
    
    if (!token) {
        return <Navigate to="/login" replace />;
    }
    
    if (user?.role !== 'admin') {
        return (
            <div className="vh-100 d-flex justify-content-center align-items-center text-white" style={{background: "#0f0f1a"}}>
                <div className="text-center">
                    <h1 className="display-1 fw-bold">403</h1>
                    <h4>🚫 Akses Ditolak</h4>
                    <p>Hanya admin yang diizinkan mengakses halaman ini.</p>
                </div>
            </div>
        );
    }
    
    return children;
};

const router = createBrowserRouter([
    {
        path: "*",
        element: <div className="text-white text-center mt-5">404 - Routes Not Found</div>,
    },
    {
        element: <MainLayout />,
        children: [
            { path: "/", element: <HomePage /> },
            { path: "/login", element: <LoginPage /> },
            { path: "/register", element: <RegisterPage /> },
            { 
                path: "/dashboard", 
                element: <ProtectedRoute><DashboardPage /></ProtectedRoute> 
            },
            { 
                path: "/movies", 
                element: <FilmPage /> 
            },
            {
                path: "/select-schedule",
                element: <ProtectedRoute><PilihJadwalPage /></ProtectedRoute>
            },
            {
                path: "/book-ticket", 
                element: <ProtectedRoute><PesanTiketPage /></ProtectedRoute>
            },
            {
                path: "/riwayat-pemesanan", 
                element: <ProtectedRoute><RiwayatPage /></ProtectedRoute>
            },
            {
                path: "/history", 
                element: <ProtectedRoute><RegisterPage /></ProtectedRoute>
            },
            // === ADMIN ===
            { 
                path: "/kelola-film", 
                element: 
                <AdminRoute>
                    <KelolaFilmPage />
                </AdminRoute> 
            },
            { 
                path: "/kelola-studio", 
                element: 
                <AdminRoute>
                    <KelolaStudioPage />
                </AdminRoute> 
            },
            { 
                path: "/kelola-jadwal", 
                element: 
                <AdminRoute>
                    <KelolaJadwalPage />
                </AdminRoute> 
            },
            {
                path: "/report",
                element: 
                <AdminRoute>
                    <ReportPage />
                </AdminRoute> 
            }, 
        ],
    },
]);

const AppRouter = () => {
    return (
        <>
            <Toaster position="top-center" richColors />
            <RouterProvider router={router} />
        </>
    );
};

export default AppRouter;