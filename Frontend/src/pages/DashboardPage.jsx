import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Row, Col, Card, Button } from "react-bootstrap";

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

    // Safe access untuk user data
    const getUserName = () => {
        if (!user) return "Admin";
        return user.nama || user.name || user.username || user.email || "Admin";
    };

    const getUserRole = () => {
        if (!user) return "user";
        return user.role || "user";
    };

    const isAdmin = () => {
        return getUserRole() === "admin";
    };

    const handleTambahFilm = () => {
        navigate("/tambah-film");
        toast.success("Membuka form tambah film...");
    };

    return (
        <Container className="mt-5">
            <h1 className="mb-3 border-bottom fw-bold">Dashboard</h1>
            <Row className="mb-4">
                <Col>
                    <Card className="h-100 justify-content-center">
                        <Card.Body>
                            <div className="d-flex justify-content-between align-items-start">
                                <div>
                                    <h4>Selamat datang,</h4>
                                    <h1 className="fw-bold display-6 mb-3">{getUserName()}</h1>
                                    <p className="mb-0">Kamu sudah login sejak:</p>
                                    <p className="fw-bold lead mb-0">{formatDate(loginTime)}</p>
                                </div>
                                {user && (
                                    <div className="text-end">
                                        <span className={`badge ${getUserRole() === 'admin' ? 'bg-danger' : 'bg-primary'} fs-6`}>
                                            {getUserRole().toUpperCase()}
                                        </span>
                                        <p className="text-muted mt-2 mb-0">{user.email}</p>
                                    </div>
                                )}
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
            
            {/* Additional Info Card */}
            {user && (
                <Row>
                    <Col>
                        <Card className="bg-light">
                            <Card.Body>
                                <div className="text-center">
                                    <h5 className="text-primary">Halo, {getUserName()}! 👋</h5>
                                    <p className="mb-0">
                                        Selamat datang di sistem kami. Anda login sebagai <strong>{getUserRole()}</strong>.
                                        {isAdmin() && (
                                            <span className="text-success"> Anda memiliki akses penuh untuk mengelola film.</span>
                                        )}
                                    </p>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            )}

            {/* Admin Features Section - Hanya untuk Admin */}
            {isAdmin() && (
                <Row className="mt-4">
                    <Col>
                        <Card className="border-primary">
                            <Card.Header className="bg-primary text-white">
                                <h5 className="mb-0">🎯 Fitur Admin</h5>
                            </Card.Header>
                            <Card.Body>
                                <Row>
                                    <Col>
                                        <div className="text-center p-3">
                                            <div className="bg-success bg-opacity-10 p-3 rounded-circle d-inline-flex">
                                                <span style={{ fontSize: "24px" }}>📊</span>
                                            </div>
                                            <h6 className="mt-2">Kelola Film</h6>
                                            <p className="text-muted small">Tambah, Edit, atau Hapus film yang ada</p>
                                            <Button 
                                                variant="outline-success" 
                                                size="sm"
                                                onClick={() => navigate("/kelola-film")}
                                            >
                                                Kelola
                                            </Button>
                                        </div>
                                    </Col>
                                    <Col>
                                        <div className="text-center p-3">
                                            <div className="bg-success bg-opacity-10 p-3 rounded-circle d-inline-flex">
                                                <span style={{ fontSize: "24px" }}>📊</span>
                                            </div>
                                            <h6 className="mt-2">Kelola Studio</h6>
                                            <p className="text-muted small">Tambah, Edit, atau Hapus Studio yang ada</p>
                                            <Button 
                                                variant="outline-success" 
                                                size="sm"
                                                onClick={() => navigate("/kelola-studio")}
                                            >
                                                Kelola
                                            </Button>
                                        </div>
                                    </Col>
                                    <Col>
                                        <div className="text-center p-3">
                                            <div className="bg-success bg-opacity-10 p-3 rounded-circle d-inline-flex">
                                                <span style={{ fontSize: "24px" }}>📊</span>
                                            </div>
                                            <h6 className="mt-2">Kelola Jadwal</h6>
                                            <p className="text-muted small">Tambah, Edit, atau Hapus Studio yang ada</p>
                                            <Button 
                                                variant="outline-success" 
                                                size="sm"
                                                onClick={() => navigate("/kelola-jadwal")}
                                            >
                                                Kelola
                                            </Button>
                                        </div>
                                    </Col>
                                    <Col>
                                        <div className="text-center p-3">
                                            <div className="bg-warning bg-opacity-10 p-3 rounded-circle d-inline-flex">
                                                <span style={{ fontSize: "24px" }}>👥</span>
                                            </div>
                                            <h6 className="mt-2">Data User</h6>
                                            <p className="text-muted small">Lihat dan kelola data pengguna</p>
                                            <Button 
                                                variant="outline-warning" 
                                                size="sm"
                                                onClick={() => navigate("/data-user")}
                                            >
                                                Lihat
                                            </Button>
                                        </div>
                                    </Col>
                                </Row>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            )}

            {/* User Features Section - Hanya untuk User */}
            {!isAdmin() && user && (
                <Row className="mt-4">
                    <Col>
                        <Card className="border-info">
                            <Card.Header className="bg-info text-white">
                                <h5 className="mb-0">🎭 Fitur User</h5>
                            </Card.Header>
                            <Card.Body>
                                <Row>
                                    <Col md={6}>
                                        <div className="text-center p-3">
                                            <div className="bg-info bg-opacity-10 p-3 rounded-circle d-inline-flex">
                                                <span style={{ fontSize: "24px" }}>🎟️</span>
                                            </div>
                                            <h6 className="mt-2">Beli Tiket</h6>
                                            <p className="text-muted small">Pesan tiket film favorit Anda</p>
                                            <Button 
                                                variant="outline-info" 
                                                size="sm"
                                                onClick={() => navigate("/beli-tiket")}
                                            >
                                                Pesan
                                            </Button>
                                        </div>
                                    </Col>
                                    <Col md={6}>
                                        <div className="text-center p-3">
                                            <div className="bg-secondary bg-opacity-10 p-3 rounded-circle d-inline-flex">
                                                <span style={{ fontSize: "24px" }}>📝</span>
                                            </div>
                                            <h6 className="mt-2">Riwayat</h6>
                                            <p className="text-muted small">Lihat riwayat pemesanan tiket</p>
                                            <Button 
                                                variant="outline-secondary" 
                                                size="sm"
                                                onClick={() => navigate("/riwayat")}
                                            >
                                                Lihat
                                            </Button>
                                        </div>
                                    </Col>
                                </Row>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            )}
        </Container>
    );
};

export default DashboardPage;