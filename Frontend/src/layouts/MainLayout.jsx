import { Outlet } from "react-router-dom";
import TopNavbar from "../components/TopNavbar";
import DynamicPageTitle from "../components/DynamicPageTitle";

const routes = [
    {
        path: "/",
        name: "Home",
    },
    {
        path: "/login",
        name: "Dashboard",
    },
];

const MainLayout = () => {
    return (
        <div 
            className="card shadow-sm text-light border-0" 
            style={{ 
                minHeight: '100vh', // Menggunakan 100vh agar full screen
                // Gradasi: Ungu Tua -> Biru -> Hitam
                background: "linear-gradient(180deg, #4b0082 0%, #1e3c72 50%, #000000 100%)",
                backgroundSize: "cover",
                backgroundAttachment: "fixed" // Agar background tetap diam saat discroll
            }}
        >
            <DynamicPageTitle />
            <TopNavbar routes={routes} />
            
            {/* Penting: Karena background sekarang gelap/berwarna, 
               pastikan komponen di dalam Outlet memiliki kontras yang cukup 
               atau container semi-transparan.
            */}
            <Outlet />
            
            {/* New Footer */}
            {/* bg-dark dihapus, diganti background transparan agar menyatu dengan gradasi */}
            <footer className="text-light mt-5" style={{ backgroundColor: "rgba(0, 0, 0, 0.3)" }}>
                <div className="container py-4">
                    {/* Tomama XXI Title */}
                    <div className="text-center mb-3">
                        <h2 className="mb-0" style={{ fontSize: "2rem", fontWeight: "bold" }}>
                            TIXIFY
                        </h2>
                        <hr className="my-3 mx-auto" style={{ 
                            borderColor: "#adb5bd", // Sedikit diperterang agar terlihat di background gelap
                            width: "100%", 
                            maxWidth: "1200px" 
                        }} />
                    </div>

                    {/* Navigation Links */}
                    <div className="text-center mb-4">
                        {[
                            "Tentang kami",
                            "FAQ", 
                            "Syarat penggunaan",
                            "Relasi Investor",
                            "Kebijakan privasi", 
                            "Hubungi kami"
                        ].map((item, index, array) => (
                            <span key={item}>
                                <a 
                                    href="#" 
                                    className="text-light text-decoration-none"
                                    style={{ 
                                        fontSize: "0.9rem",
                                        transition: "color 0.2s ease"
                                    }}
                                    onMouseOver={(e) => e.target.style.color = "#adb5bd"}
                                    onMouseOut={(e) => e.target.style.color = "white"}
                                >
                                    {item}
                                </a>
                                {index < array.length - 1 && (
                                    <span className="mx-2" style={{ color: "#adb5bd" }}>|</span>
                                )}
                            </span>
                        ))}
                    </div>

                    {/* Copyright */}
                    <div className="text-center">
                        <p className="mb-0" style={{ 
                            fontSize: "0.8rem", 
                            color: "#ced4da" 
                        }}>
                            Copyright © 2025 TUBES KELOMPOK 8. All rights reserved.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default MainLayout;