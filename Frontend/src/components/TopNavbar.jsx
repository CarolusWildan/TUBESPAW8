import { Navbar, Nav, Container, Button, Dropdown, Image } from "react-bootstrap";
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
            try {
                setUser(JSON.parse(userData));
            } catch (error) {
                console.error("Error parsing user data:", error);
            }
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
        window.location.reload();
    };

    // Fungsi untuk handle edit profile
    const handleEditProfile = () => {
        navigate("/edit-profile");
    };

    // Check if user is admin
    const isAdmin = user?.role === "admin";

    // Style umum untuk tombol transparan (Ghost Button)
    const ghostButtonStyle = {
        background: "rgba(255, 255, 255, 0.05)",
        border: "1px solid rgba(255, 255, 255, 0.3)",
        color: "white",
        fontWeight: "500",
        borderRadius: "50px",
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
        boxShadow: "0 4px 15px rgba(37, 117, 252, 0.4)",
        transition: "all 0.3s ease"
    };

    // Style untuk profile dropdown
    const customDropdownStyle = {
        background: "rgba(15, 23, 42, 0.95)",
        backdropFilter: "blur(10px)",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        borderRadius: "12px",
        marginTop: "10px",
        minWidth: "220px",
        padding: "8px 0"
    };

    // Style untuk dropdown item
    const dropdownItemStyle = {
        color: "#e2e8f0",
        padding: "10px 15px",
        display: "flex",
        alignItems: "center",
        transition: "all 0.2s ease",
        cursor: "pointer",
        border: "none",
        background: "transparent",
        width: "100%",
        textAlign: "left"
    };

    return (
        <Navbar 
            expand="lg" 
            variant="dark"
            sticky="top" 
            style={{ 
                padding: "15px 0",
                background: "linear-gradient(180deg, rgba(0, 0, 0, 0.9) 0%, rgba(0, 0, 0, 0.0) 100%)",
                backdropFilter: "blur(5px)",      
                WebkitBackdropFilter: "blur(5px)",
                zIndex: 1000
            }}
        >
            <Container fluid className="px-4 px-lg-5">
                {/* Logo/Brand Tixify */}
                <Navbar.Brand 
                    onClick={() => navigate("/")} 
                    style={{ 
                        cursor: "pointer", 
                        fontWeight: "800",
                        fontSize: "26px",
                        letterSpacing: "1px",
                        color: "white",
                        display: "flex",
                        alignItems: "center",
                    }}
                >
                    <span style={{ 
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
                                {/* Dashboard Button (Hanya untuk Admin) */}
                                {isAdmin && (
                                    <Button 
                                        style={primaryGradientStyle}
                                        className="btn-gradient-hover"
                                        onClick={() => navigate("/dashboard")}
                                    >
                                        <i className="bi bi-speedometer2 me-2"></i>Dashboard
                                    </Button>
                                )}

                                {/* Profile Dropdown */}
                                <Dropdown align="end">
                                    <Dropdown.Toggle 
                                        as="div"
                                        id="dropdown-profile"
                                        style={{
                                            background: "transparent",
                                            border: "none",
                                            padding: "0",
                                            outline: "none",
                                            boxShadow: "none",
                                            cursor: "pointer"
                                        }}
                                        className="p-0" 
                                    >
                                        <div className="d-flex align-items-center">
                                            {user?.foto_profil ? (
                                                <Image 
                                                    src={user.foto_profil}
                                                    roundedCircle
                                                    width={40}
                                                    height={40}
                                                    style={{
                                                        border: "2px solid rgba(255, 255, 255, 0.3)",
                                                        objectFit: "cover"
                                                    }}
                                                    alt="Profile"
                                                />
                                            ) : (
                                                <div 
                                                    style={{
                                                        width: "40px",
                                                        height: "40px",
                                                        borderRadius: "50%",
                                                        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent: "center",
                                                        border: "2px solid rgba(255, 255, 255, 0.3)",
                                                        cursor: "pointer"
                                                    }}
                                                >
                                                    <span style={{
                                                        color: "white",
                                                        fontWeight: "bold",
                                                        fontSize: "18px"
                                                    }}>
                                                        {user?.nama?.charAt(0)?.toUpperCase() || "U"}
                                                    </span>
                                                </div>
                                            )}
                                            {/* HILANGKAN NAMA USER di samping profil */}
                                        </div>
                                    </Dropdown.Toggle>

                                    <Dropdown.Menu style={customDropdownStyle}>
                                        {/* User Info */}
                                        <div className="px-3 py-2 border-bottom border-secondary">
                                            <div className="d-flex align-items-center">
                                                {user?.foto_profil ? (
                                                    <Image 
                                                        src={user.foto_profil}
                                                        roundedCircle
                                                        width={45}
                                                        height={45}
                                                        style={{
                                                            border: "2px solid rgba(255, 255, 255, 0.3)",
                                                            objectFit: "cover",
                                                            marginRight: "12px"
                                                        }}
                                                        alt="Profile"
                                                    />
                                                ) : (
                                                    <div 
                                                        style={{
                                                            width: "45px",
                                                            height: "45px",
                                                            borderRadius: "50%",
                                                            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                                                            display: "flex",
                                                            alignItems: "center",
                                                            justifyContent: "center",
                                                            marginRight: "12px",
                                                            border: "2px solid rgba(255, 255, 255, 0.3)"
                                                        }}
                                                    >
                                                        <span style={{
                                                            color: "white",
                                                            fontWeight: "bold",
                                                            fontSize: "20px"
                                                        }}>
                                                            {user?.nama?.charAt(0)?.toUpperCase() || "U"}
                                                        </span>
                                                    </div>
                                                )}
                                                <div>
                                                    <div className="fw-bold text-white">{user?.nama || "User"}</div>
                                                    <div className="small text-muted">
                                                        {user?.email || ""}
                                                    </div>
                                                    <div className="small mt-1">
                                                        <span className={`badge ${isAdmin ? 'bg-danger' : 'bg-primary'}`}>
                                                            {user?.role || 'user'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        {/* Edit Profile */}
                                        <button 
                                            onClick={handleEditProfile}
                                            style={dropdownItemStyle}
                                            className="dropdown-item-hover"
                                        >
                                            <i className="bi bi-gear me-2"></i>
                                            Edit Profile
                                        </button>
                                        
                                        {/* Logout */}
                                        <button 
                                            onClick={handleLogout}
                                            style={{
                                                ...dropdownItemStyle,
                                                color: "#f87171"
                                            }}
                                            className="dropdown-item-hover"
                                        >
                                            <i className="bi bi-box-arrow-right me-2"></i>
                                            Logout
                                        </button>
                                    </Dropdown.Menu>
                                </Dropdown>
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

            {/* CSS Global untuk menghilangkan panah dropdown */}
            <style jsx global>{`
                /* Hapus panah dropdown dari semua dropdown toggle */
                .dropdown-toggle::after {
                    display: none !important;
                }
                
                /* Hover effect untuk Ghost Button */
                .btn-ghost-hover:hover {
                    background: rgba(255, 255, 255, 0.15) !important;
                    border-color: white !important;
                    transform: translateY(-1px);
                }

                /* Hover effect untuk Gradient Button */
                .btn-gradient-hover:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 20px rgba(106, 17, 203, 0.6) !important;
                    filter: brightness(1.1);
                }
                
                /* Hover effect untuk dropdown items */
                .dropdown-item-hover:hover {
                    background: rgba(59, 130, 246, 0.1) !important;
                    color: #60a5fa !important;
                }
                
                /* Profile toggle tanpa border focus */
                #dropdown-profile:focus {
                    outline: none !important;
                    box-shadow: none !important;
                }
                
                /* Penyesuaian ikon hamburger */
                .navbar-toggler:focus {
                    box-shadow: none;
                }
            `}</style>
        </Navbar>
    );
};

export default TopNavbar;