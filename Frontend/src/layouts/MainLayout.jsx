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
        <div style={{ margin: "0", padding: "0" }}>
            <DynamicPageTitle />
            <TopNavbar routes={routes} />
            <Outlet />
            
            {/* New Footer */}
            <footer className="bg-dark text-light mt-5">
                <div className="container py-4">
                    {/* Tomama XXI Title */}
                    <div className="text-center mb-3">
                        <h2 className="mb-0" style={{ fontSize: "2rem", fontWeight: "bold" }}>
                            TIXIFY
                        </h2>
                        <hr className="my-3 mx-auto" style={{ 
                            borderColor: "#6c757d", 
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
                                    <span className="mx-2" style={{ color: "#6c757d" }}>|</span>
                                )}
                            </span>
                        ))}
                    </div>

                    {/* Copyright */}
                    <div className="text-center">
                        <p className="mb-0" style={{ 
                            fontSize: "0.8rem", 
                            color: "#adb5bd" 
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