import { Navbar, Nav, Container, Button } from "react-bootstrap";
import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

const TopNavbar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(null);

    // Cek status autentikasi dari localStorage
    useEffect(() => {
        const token = localStorage.getItem("auth_token");
        const userData = localStorage.getItem("user");
        
        if (token) {
            setIsAuthenticated(true);
        }
        
        if (userData) {
            setUser(JSON.parse(userData));
        }
    }, [location]); 

    // Fungsi untuk handle logout
    const handleLogout = () => {
        localStorage.removeItem("auth_token");
        localStorage.removeItem("user");
        localStorage.removeItem("login_time");
        
        setIsAuthenticated(false);
        setUser(null);
        navigate("/");
    };

    // Style umum untuk tombol transparan (Ghost Button)
    const ghostButtonStyle = {
        background: "rgba(255, 255, 255, 0.05)",
        border: "1px solid rgba(255, 255, 255, 0.3)",
        color: "white",
        fontWeight: "500",
        borderRadius: "50px", // Lebih modern dengan rounded pill
        padding: "8px 24px",
        transition: "all 0.3s ease"
    };

    // Style untuk tombol utama (Gradient)
    const primaryGradientStyle = {
        background: "linear-gradient(90deg, #6a11cb 0%, #2575fc 100%)",
        border: "none",
        color: "white",
        fontWeight: "600",
        borderRadius: "50px",
        padding: "8px 24px",
        boxShadow: "0 4px 15px rgba(37, 117, 252, 0.4)", // Glow effect biru
        transition: "all 0.3s ease"
    };

    return (
        <Navbar 
            expand="lg" 
            variant="dark" // PENTING: Agar hamburger icon jadi putih
            sticky="top" 
            style={{ 
                padding: "15px 0",
                // MODIFIKASI GRADASI:
                // Atas: Hitam pekat (opacity 0.9) agar logo jelas
                // Bawah: Hampir transparan (opacity 0.0) agar menyatu dengan konten di bawahnya
                background: "linear-gradient(180deg, rgba(0, 0, 0, 0.9) 0%, rgba(0, 0, 0, 0.0) 100%)",
                
                // Backdrop filter tetap ada untuk efek blur kaca
                backdropFilter: "blur(5px)",      
                WebkitBackdropFilter: "blur(5px)",
                
                // Border bawah dibuat sangat tipis/hilang agar gradasi halus tidak terpotong garis tegas
                // borderBottom: "1px solid rgba(255, 255, 255, 0.02)", 
                zIndex: 1000
            }}
        >
            {/* PERUBAHAN DI SINI:
               - Menggunakan 'fluid' agar lebar container 100% dari lebar layar.
               - Menambahkan 'px-4' (padding horizontal level 4) untuk jarak di layar kecil.
               - Menambahkan 'px-lg-5' (padding horizontal level 5) untuk jarak lebih lega di layar besar.
            */}
            <Container fluid className="px-4 px-lg-5">
                {/* Logo/Brand Tixify */}
                <Navbar.Brand 
                    onClick={() => navigate("/")} 
                    style={{ 
                        cursor: "pointer", 
                        fontWeight: "800", // Lebih tebal
                        fontSize: "26px",
                        letterSpacing: "1px",
                        color: "white", // Fallback color
                        display: "flex",
                        alignItems: "center",
                    }}
                >
                    <span style={{ 
                        // Gradasi teks dibuat lebih terang (Neon) agar kontras dengan background gelap
                        background: "linear-gradient(135deg, #60a5fa, #a78bfa)", 
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        backgroundClip: "text"
                    }}>
                        TIXIFY
                    </span>
                </Navbar.Brand>

                <Navbar.Toggle aria-controls="basic-navbar-nav" className="border-0" />
                
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="mx-auto">
                        {/* Space kosong di tengah */}
                    </Nav>

                    {/* Menu Kanan */}
                    <Nav className="align-items-center gap-3 mt-3 mt-lg-0">
                        
                        {/* Film Button */}
                        <Button 
                            style={ghostButtonStyle}
                            className="btn-ghost-hover"
                            onClick={() => navigate("/movies")}
                        >
                            Film
                        </Button>

                        {isAuthenticated ? (
                            <>
                                {/* Dashboard Button (Primary) */}
                                <Button 
                                    style={primaryGradientStyle}
                                    className="btn-gradient-hover"
                                    onClick={() => navigate("/dashboard")}
                                >
                                    <i className="bi bi-speedometer2 me-2"></i>Dashboard
                                </Button>

                                {/* Logout Button (Danger - tapi dibuat minimalis) */}
                                <Button 
                                    variant="link" // Ubah jadi text link agar tidak terlalu ramai tombolnya
                                    onClick={handleLogout}
                                    style={{
                                        color: "rgba(255,255,255,0.7)",
                                        fontWeight: "500",
                                        textDecoration: "none",
                                        padding: "8px 15px"
                                    }}
                                    className="text-hover-danger"
                                    onMouseOver={(e) => e.target.style.color = "#ff6b6b"}
                                    onMouseOut={(e) => e.target.style.color = "rgba(255,255,255,0.7)"}
                                >
                                    Logout
                                </Button>
                            </>
                        ) : (
                            <>
                                {/* Login Button */}
                                <Button 
                                    style={ghostButtonStyle}
                                    className="btn-ghost-hover"
                                    onClick={() => navigate("/login")}
                                >
                                    Login
                                </Button>

                                {/* Register Button (Primary CTA) */}
                                <Button 
                                    style={primaryGradientStyle}
                                    className="btn-gradient-hover"
                                    onClick={() => navigate("/register")}
                                >
                                    Register
                                </Button>
                            </>
                        )}
                    </Nav>
                </Navbar.Collapse>
            </Container>

            {/* CSS Global/Scope untuk Hover Effects yang lebih smooth */}
            <style jsx>{`
                /* Hover effect untuk Ghost Button (Film/Login) */
                .btn-ghost-hover:hover {
                    background: rgba(255, 255, 255, 0.15) !important;
                    border-color: white !important;
                    transform: translateY(-1px);
                }

                /* Hover effect untuk Gradient Button (Register/Dashboard) */
                .btn-gradient-hover:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 20px rgba(106, 17, 203, 0.6) !important;
                    filter: brightness(1.1);
                }
                
                /* Penyesuaian ikon hamburger saat mobile dibuka */
                .navbar-toggler:focus {
                    box-shadow: none;
                }
            `}</style>
        </Navbar>
    );
};

export default TopNavbar;