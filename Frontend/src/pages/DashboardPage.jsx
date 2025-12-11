import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Row, Col, Card, Button, Badge } from "react-bootstrap";
import { toast } from "sonner"; // Impor toast untuk notifikasi

// --- Komponen Pembantu untuk Kartu Aksi ---
const ActionCard = ({ icon, title, description, color, navigatePath, navigate }) => {
    // Tentukan warna dan style untuk konsistensi UI dark mode
    let bgColor, borderColor, shadowColor;
    
    switch (color) {
        case 'admin':
            // Ungu ke Merah (Admin Theme)
            bgColor = 'linear-gradient(145deg, #9333ea 0%, #dc2626 100%)'; 
            borderColor = '#9333ea';
            shadowColor = 'rgba(147, 51, 234, 0.4)';
            break;
        case 'info':
            // Cyan ke Biru (Pemesanan Theme)
            bgColor = 'linear-gradient(145deg, #06b6d4 0%, #3b82f6 100%)'; 
            borderColor = '#06b6d4';
            shadowColor = 'rgba(6, 182, 212, 0.4)';
            break;
        case 'secondary':
            // Abu-abu Gelap (Riwayat Theme)
            bgColor = 'linear-gradient(145deg, #374151 0%, #4b5563 100%)'; 
            borderColor = '#4b5563';
            shadowColor = 'rgba(75, 85, 99, 0.3)';
            break;
        default:
            bgColor = '#1f2937';
            borderColor = '#4b5563';
            shadowColor = 'rgba(0,0,0,0.2)';
    }

    const handleClick = () => {
        if (navigatePath) {
            navigate(navigatePath);
        } else {
            toast.info("Fitur ini akan segera hadir!");
        }
    };

    return (
        <Card 
            className="h-100 border-0 text-white transition-all duration-300 hover:scale-[1.02] hover:shadow-xl"
            style={{ 
                // Menggunakan background gelap semi-transparan yang konsisten
                background: '#1f2937', 
                borderRadius: '16px', 
                border: `1px solid ${borderColor}50`, 
                boxShadow: `0 8px 15px ${shadowColor}`,
                cursor: navigatePath ? 'pointer' : 'default',
            }}
            onClick={handleClick}
        >
            <Card.Body className="d-flex flex-column align-items-center text-center p-4">
                <div 
                    className="p-3 rounded-circle d-inline-flex mb-3"
                    style={{ background: bgColor, boxShadow: `0 4px 10px ${shadowColor}50` }}
                >
                    <i className={`bi ${icon} fs-3`}></i> 
                </div>
                <h6 className="mt-2 fw-bold text-white text-lg">{title}</h6>
                <p className="text-gray-400 small flex-grow-1">{description}</p>
                {navigatePath && (
                    <Button 
                        variant="link"
                        className="fw-bold text-decoration-none"
                        // Menggunakan warna tema untuk tautan
                        style={{ color: borderColor, fontSize: "0.9rem" }}
                        onClick={(e) => { e.stopPropagation(); handleClick(); }}
                    >
                        Lihat <i className="bi bi-arrow-right-short"></i>
                    </Button>
                )}
            </Card.Body>
        </Card>
    );
};

const DashboardPage = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loginTime, setLoginTime] = useState("");

    useEffect(() => {
        const userData = localStorage.getItem("user");
        const storedLoginTime = localStorage.getItem("login_time");
        
        if (userData) {
            setUser(JSON.parse(userData));
        }
        
        if (storedLoginTime) {
            setLoginTime(storedLoginTime);
        } else {
            const currentTime = new Date().toISOString();
            localStorage.setItem("login_time", currentTime);
            setLoginTime(currentTime);
        }

        const token = localStorage.getItem("auth_token");
        if (!token) {
            navigate("/login");
        }
    }, [navigate]);

    const formatDate = (date) => {
        if (!date) return "Data tidak tersedia";
        
        const options = {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "numeric",
            minute: "numeric",
            second: "numeric",
        };
        return new Date(date).toLocaleDateString("id-ID", options);
    };

    const getUserName = () => {
        if (!user) return "Pengguna";
        return user.nama || user.name || user.username || user.email || "Pengguna";
    };

    const getUserRole = () => {
        if (!user) return "user";
        return user.role || "user";
    };

    const isAdmin = () => {
        return getUserRole() === "admin";
    };

    return (
        // Latar belakang utama: #0b0e14
        <Container className="py-5" style={{ minHeight: "100vh", background: "#0b0e14" }}>
            <h1 className="mb-4 fw-bolder text-white">Dashboard</h1>
            
            {/* 1. Welcome Card (Kontras Tinggi) */}
            <Row className="mb-5">
                <Col>
                    <Card className="border-0 text-white" style={{ 
                        // Latar belakang gradasi gelap
                        background: "linear-gradient(135deg, #1f2937 0%, #111827 100%)",
                        borderRadius: "20px", 
                        boxShadow: "0 10px 20px rgba(0,0,0,0.5)"
                    }}>
                        <Card.Body className="p-4 p-md-5">
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <h4 className="text-white-50 mb-1">Selamat datang,</h4>
                                    <h1 className="fw-bold display-6 mb-3" style={{color: "#3b82f6"}}>{getUserName()}</h1>
                                    <p className="mb-0 text-white-50">Sesi login dimulai sejak:</p>
                                    <p className="fw-bold lead mb-0" style={{fontSize: "1rem"}}>{formatDate(loginTime)}</p>
                                </div>
                                {user && (
                                    <div className="text-end">
                                        <Badge 
                                            bg={getUserRole() === 'admin' ? 'danger' : 'success'} 
                                            className="fs-6 px-3 py-2 rounded-pill shadow-sm"
                                        >
                                            {getUserRole().toUpperCase()}
                                        </Badge>
                                        <p className="text-white-50 mt-2 mb-0 small">{user.email}</p>
                                    </div>
                                )}
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* 2. Admin Features Section */}
            {isAdmin() && (
                <>
                    <h4 className="text-white mb-4">Aksi Cepat Admin</h4>
                    <Row className="mb-5">
                        <Col className="mb-3">
                            <ActionCard
                                icon="bi-film"
                                title="Kelola Film"
                                description="Tambah, edit, atau hapus data film bioskop."
                                color="admin"
                                navigatePath="/kelola-film"
                                navigate={navigate}
                            />
                        </Col>
                        <Col className="mb-3">
                            <ActionCard
                                icon="bi-grid-3x3-gap-fill"
                                title="Kelola Studio"
                                description="Atur denah dan konfigurasi studio."
                                color="admin"
                                navigatePath="/kelola-studio"
                                navigate={navigate}
                            />
                        </Col>
                        <Col className="mb-3">
                            <ActionCard
                                icon="bi-calendar-check"
                                title="Kelola Jadwal"
                                description="Tambah, edit, dan atur jam tayang film." 
                                color="admin"
                                navigatePath="/kelola-jadwal"
                                navigate={navigate}
                            />
                        </Col>
                        <Col className="mb-3">
                            <ActionCard
                                icon="bi-calendar-check"
                                title="Report"
                                description="Melihat Grafik Penjualan Tiket Per Bulan" 
                                color="admin"
                                navigatePath="/report"
                                navigate={navigate}
                            />
                        </Col>
                    </Row>
                </>
            )}

            {/* 3. User Features Section */}
            {!isAdmin() && user && (
                <>
                    <h4 className="text-white mb-4">Fitur Pengguna</h4>
                    <Row>
                        <Col md={6} className="mb-3">
                            <ActionCard
                                icon="bi-ticket-perforated-fill"
                                title="Beli Tiket"
                                description="Lihat film yang sedang tayang dan pesan tiket sekarang."
                                color="info"
                                navigatePath="/movies" 
                                navigate={navigate}
                            />
                        </Col>
                        <Col md={6} className="mb-3">
                            <ActionCard
                                icon="bi-receipt-cutoff"
                                title="Riwayat Transaksi"
                                description="Cek semua daftar riwayat pemesanan tiket Anda."
                                color="secondary"
                                navigatePath="/history" // Navigasi yang sudah diperbaiki
                                navigate={navigate}
                            />
                        </Col>
                    </Row>
                </>
            )}
        </Container>
    );
};

export default DashboardPage;