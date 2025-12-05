import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Row, Col, Card, Breadcrumb, Alert, Button } from "react-bootstrap";
import FormCreateFilm from "../components/FormCreateFilm";

const CreateFilmPage = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);

    // Check authentication and admin role
    useEffect(() => {
        const userData = localStorage.getItem("user");
        const token = localStorage.getItem("auth_token");

        if (!token) {
            navigate("/login");
            return;
        }

        if (userData) {
            const userObj = JSON.parse(userData);
            setUser(userObj);
            setIsAdmin(userObj.role === "admin");
        }
    }, [navigate]);

    // Redirect if not admin
    if (!isAdmin && user) {
        return (
            <Container className="mt-5">
                <Alert variant="danger" className="text-center">
                    <h4>🚫 Akses Ditolak</h4>
                    <p>Hanya admin yang dapat menambah film baru.</p>
                    <Button 
                        variant="primary" 
                        onClick={() => navigate("/dashboard")}
                    >
                        Kembali ke Dashboard
                    </Button>
                </Alert>
            </Container>
        );
    }

    return (
        <Container className="mt-4">
            {/* Breadcrumb */}
            <Breadcrumb className="mb-4">
                <Breadcrumb.Item onClick={() => navigate("/dashboard")} style={{ cursor: "pointer" }}>
                    Dashboard
                </Breadcrumb.Item>
                <Breadcrumb.Item onClick={() => navigate("/kelola-film")} style={{ cursor: "pointer" }}>
                    Kelola Film
                </Breadcrumb.Item>
                <Breadcrumb.Item active>Tambah Film Baru</Breadcrumb.Item>
            </Breadcrumb>

            {/* Page Header */}
            <Row className="mb-4">
                <Col>
                    <div className="d-flex justify-content-between align-items-center">
                        <div>
                            <h1 className="fw-bold text-primary">Tambah Film Baru</h1>
                            <p className="text-muted">
                                Isi form di bawah untuk menambahkan film baru ke katalog TIXIFY
                            </p>
                        </div>
                        <div className="text-end">
                            {user && (
                                <div>
                                    <span className={`badge ${isAdmin ? 'bg-danger' : 'bg-primary'} fs-6`}>
                                        {user.role?.toUpperCase()}
                                    </span>
                                    <p className="text-muted mb-0 small">{user.nama}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </Col>
            </Row>

            {/* Form Card */}
            <Row>
                <Col lg={8}>
                    <Card className="shadow-sm border-0">
                        <Card.Header className="bg-primary text-white py-3">
                            <h5 className="mb-0">
                                🎬 Form Tambah Film
                            </h5>
                        </Card.Header>
                        <Card.Body className="p-4">
                            <FormCreateFilm />
                        </Card.Body>
                    </Card>
                </Col>

                {/* Info Sidebar */}
                <Col lg={4}>
                    <Card className="border-0 bg-light">
                        <Card.Header className="bg-primary text-white py-3">
                            <h6 className="mb-0 fw-bold">💡 Panduan Pengisian</h6>
                        </Card.Header>
                        <Card.Body>
                            <h6 className="fw-bold text-primary">📋 Field Wajib</h6>
                            <ul className="small text-muted ps-3">
                                <li><strong>Judul Film</strong> - Nama lengkap film</li>
                                <li><strong>Genre</strong> - Kategori film</li>
                                <li><strong>Durasi Film</strong> - Format HH:MM:SS (contoh: 01:20:30)</li>
                                <li><strong>Tanggal Mulai Tayang</strong> - Kapan film mulai tayang</li>
                                <li><strong>Tanggal Selesai Tayang</strong> - Kapan film selesai tayang</li>
                            </ul>

                            <hr />

                            <h6 className="fw-bold text-success">📊 Status Otomatis</h6>
                            <div className="small">
                                <div className="mb-2">
                                    <span className="badge bg-warning me-2">Soon</span>
                                    <span>Coming Soon - Tanggal mulai hari ini</span>
                                </div>
                                <div className="mb-2">
                                    <span className="badge bg-success me-2">Now</span>
                                    <span>Now Showing - Sedang tayang</span>
                                </div>
                            </div>

                            <hr />

                            <h6 className="fw-bold text-info">📅 Tanggal Tayang</h6>
                            <ul className="small text-muted ps-3">
                                <li><strong>Tanggal Selesai</strong> opsional</li>
                                <li>Jika tidak diisi, film dianggap masih tayang</li>
                                <li>Pastikan tanggal selesai tidak sebelum tanggal mulai</li>
                            </ul>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default CreateFilmPage;