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
    }, [location]); // Update ketika lokasi/rute berubah

    // Fungsi untuk handle logout
    const handleLogout = () => {
        // Hapus semua data autentikasi dari localStorage
        localStorage.removeItem("auth_token");
        localStorage.removeItem("user");
        localStorage.removeItem("login_time");
        
        // Update state
        setIsAuthenticated(false);
        setUser(null);
        
        // Redirect ke halaman home
        navigate("/");
    };

    // Fungsi untuk mendapatkan nama user
    const getUserName = () => {
        if (!user) return "User";
        return user.nama || user.name || user.username || user.email || "User";
    };

    return (
        <Navbar expand="lg" className="bg-white shadow-sm" style={{ padding: "12px 0" }}>
            <Container>
                {/* Logo/Brand Tixify */}
                <Navbar.Brand 
                    onClick={() => navigate("/")} 
                    style={{ 
                        cursor: "pointer", 
                        fontWeight: "bold", 
                        fontSize: "28px",
                        color: "#374151",
                        marginRight: "auto",
                        display: "flex",
                        alignItems: "center",
                        gap: "12px"
                    }}
                >
                    <span style={{ 
                        background: "linear-gradient(135deg, #2563eb, #7c3aed)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        backgroundClip: "text"
                    }}>
                        TIXIFY
                    </span>
                </Navbar.Brand>

                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                
                <Navbar.Collapse id="basic-navbar-nav">
                    {/* Menu Tengah */}
                    <Nav className="mx-auto">
                        {/* Anda bisa menambahkan menu tambahan di sini jika diperlukan */}
                    </Nav>

                    {/* Menu Kanan - Berubah berdasarkan status autentikasi */}
                    <Nav className="align-items-center" style={{ gap: "12px" }}>
                        {/* Film Button - selalu tampil */}
                        <Button 
                            variant="outline-secondary"
                            onClick={() => navigate("/movies")}
                            style={{
                                border: "2px solid #6b7280",
                                color: "#6b7280",
                                fontWeight: "600",
                                borderRadius: "8px",
                                padding: "8px 20px",
                                transition: "all 0.3s ease",
                                backgroundColor: "transparent"
                            }}
                            className="btn-hover"
                        >
                            Film
                        </Button>

                        {/* Jika sudah login, tampilkan tombol dashboard dan logout */}
                        {isAuthenticated ? (
                            <>
                                {/* Dashboard Button */}
                                <Button 
                                    variant="primary"
                                    onClick={() => navigate("/dashboard")}
                                    style={{
                                        background: "linear-gradient(135deg, #ffffffff, #ffffffff)",
                                        border: "2px solid #6b7280",
                                        color: "#6b7280",
                                        fontWeight: "600",
                                        borderRadius: "8px",
                                        padding: "8px 20px",
                                        transition: "all 0.3s ease"
                                        
                                    }}
                                    className="btn-hover"
                                >
                                    <i className="bi bi-speedometer2 me-1"></i> Dashboard
                                </Button>

                                {/* Logout Button */}
                                <Button 
                                    variant="outline-danger"
                                    onClick={handleLogout}
                                    style={{
                                        border: "2px solid #ef4444",
                                        color: "#ef4444",
                                        fontWeight: "600",
                                        borderRadius: "8px",
                                        padding: "8px 20px",
                                        transition: "all 0.3s ease",
                                        backgroundColor: "transparent"
                                    }}
                                    className="btn-hover"
                                >
                                    <i className="bi bi-box-arrow-right me-1"></i> Logout
                                </Button>
                            </>
                        ) : (
                            /* Jika belum login, tampilkan tombol login dan register */
                            <>
                                {/* Login Button */}
                                <Button 
                                    variant="outline-secondary"
                                    onClick={() => navigate("/login")}
                                    style={{
                                        border: "2px solid #6b7280",
                                        color: "#6b7280",
                                        fontWeight: "600",
                                        borderRadius: "8px",
                                        padding: "8px 20px",
                                        transition: "all 0.3s ease",
                                        backgroundColor: "transparent"
                                    }}
                                    className="btn-hover"
                                >
                                    Login
                                </Button>

                                {/* Register Button */}
                                <Button 
                                    variant="primary"
                                    onClick={() => navigate("/register")}
                                    style={{
                                        background: "linear-gradient(135deg, #6b7280, #9ca3af)",
                                        border: "none",
                                        fontWeight: "600",
                                        borderRadius: "8px",
                                        padding: "8px 20px",
                                        transition: "all 0.3s ease"
                                    }}
                                    className="btn-hover"
                                >
                                    Register
                                </Button>
                            </>
                        )}
                    </Nav>
                </Navbar.Collapse>
            </Container>

            <style jsx>{`
                .btn-hover:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                }
            `}</style>
        </Navbar>
    );
};

export default TopNavbar;