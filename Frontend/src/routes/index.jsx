import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Toaster } from "sonner";
import MainLayout from "../layouts/MainLayout";
import HomePage from "../pages/HomePage";
import RegisterPage from "../pages/RegisterPage";
import LoginPage from "../pages/LoginPage";
import DashboardPage from "../pages/DashboardPage";
import FilmPage from "../pages/FilmPage";
import KelolaFilmPage from "../pages/KelolaFilmPage";
import "bootstrap/dist/css/bootstrap.min.css";

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
    const user = JSON.parse(localStorage.getItem('user'));
    
    if (!token) {
        return <Navigate to="/login" replace />;
    }
    
    if (user?.role !== 'admin') {
        return <div className="text-center mt-5"><h4>🚫 Akses Ditolak - Hanya Admin</h4></div>;
    }
    
    return children;
};

const router = createBrowserRouter([
    {
        path: "*",
        element: <div>Routes Not Found!</div>,
    },
    {
        element: <MainLayout />,
        children: [
            {
                path: "/",
                element: <HomePage />,
            },
            {
                path: "/login",
                element: <LoginPage />,
            },
            { 
                path: "/register", 
                element: <RegisterPage />,
            },
            {
                path: "/dashboard",
                element: (
                    <ProtectedRoute>
                        <DashboardPage />
                    </ProtectedRoute>
                ),
            },
            {
                path: "/movies",
                element: <FilmPage />,
            },
            {
                path: "/kelola-film",
                element: (
                    <AdminRoute>
                        <KelolaFilmPage />
                    </AdminRoute>
                ),
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