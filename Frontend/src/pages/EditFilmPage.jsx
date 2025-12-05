import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Container, Row, Col, Card, Breadcrumb, Alert, Button } from "react-bootstrap";
import FormEditFilm from "../components/FormEditFilm";

const EditFilmPage = () => {
    const navigate = useNavigate();
    
    const { id_film } = useParams();
    
    const [user, setUser] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [filmData, setFilmData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    console.log("📌 EditFilmPage - ID_FILM dari URL:", id_film);

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
                    <h4><i className="bi bi-shield-slash me-2"></i>Akses Ditolak</h4>
                    <p>Hanya admin yang dapat mengedit film.</p>
                    <Button 
                        variant="primary" 
                        onClick={() => navigate("/dashboard")}
                        className="mt-2"
                    >
                        <i className="bi bi-arrow-left me-1"></i>Kembali ke Dashboard
                    </Button>
                </Alert>
            </Container>
        );
    }

    if (!id_film) {
        return (
            <Container className="mt-5">
                <Alert variant="warning" className="text-center">
                    <h4><i className="bi bi-exclamation-triangle me-2"></i>ID Film Tidak Ditemukan</h4>
                    <p>Silakan pilih film yang ingin diedit dari halaman kelola film.</p>
                    <Button 
                        variant="primary" 
                        onClick={() => navigate("/kelola-film")}
                        className="mt-2"
                    >
                        <i className="bi bi-film me-1"></i>Ke Halaman Kelola Film
                    </Button>
                </Alert>
            </Container>
        );
    }

    return (
        <Container className="mt-4 mb-5">
            {/* Breadcrumb */}
            <Breadcrumb className="mb-4">
                <Breadcrumb.Item 
                    onClick={() => navigate("/dashboard")} 
                    style={{ cursor: "pointer" }}
                    className="d-flex align-items-center"
                >
                    <i className="bi bi-house-door me-1"></i> Dashboard
                </Breadcrumb.Item>
                <Breadcrumb.Item 
                    onClick={() => navigate("/kelola-film")} 
                    style={{ cursor: "pointer" }}
                    className="d-flex align-items-center"
                >
                    <i className="bi bi-film me-1"></i> Kelola Film
                </Breadcrumb.Item>
                <Breadcrumb.Item active className="d-flex align-items-center">
                    <i className="bi bi-pencil me-1"></i> Edit Film
                </Breadcrumb.Item>
            </Breadcrumb>

            {/* Page Header */}
            <Row className="mb-4">
                <Col>
                    <div className="d-flex justify-content-between align-items-center">
                        <div>
                            <h1 className="fw-bold text-warning">
                                <i className="fw-bold text-primary"></i>Edit Film
                            </h1>
                            <p className="text-muted">
                                <span className="me-2">ID Film:</span>
                                <span className="badge bg-dark fs-6">{id_film}</span>
                                {filmData && (
                                    <span className="ms-2">
                                        - "<strong>{filmData.judul}</strong>"
                                    </span>
                                )}
                            </p>
                        </div>
                        <div className="text-end">
                            {user && (
                                <div>
                                    <span className={`badge ${isAdmin ? 'bg-danger' : 'bg-primary'} fs-6`}>
                                        <i className="bi bi-person-badge me-1"></i>
                                        {user.role?.toUpperCase()}
                                    </span>
                                    <p className="text-muted mb-0 small mt-1">
                                        <i className="bi bi-person me-1"></i>
                                        {user.nama}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </Col>
            </Row>

            {/* Form Section */}
            <Row>
                <Col lg={8}>
                    <Card className="shadow-sm border-0">
                        <Card.Header className="bg-warning text-white py-3">
                            <h5 className="mb-0 d-flex align-items-center">
                                <i className="bi bi-pencil-square me-2"></i>
                                Form Edit Film
                            </h5>
                        </Card.Header>
                        <Card.Body className="p-4">
                            {/* KIRIM id_film, BUKAN id */}
                            <FormEditFilm filmId={id_film} />
                        </Card.Body>
                    </Card>
                </Col>

                {/* Sidebar Information */}
                <Col lg={4}>
                    {/* Info Card */}
                    <Card className="shadow-sm border-0 mb-3">
                        <Card.Header className="bg-info text-white">
                            <h6 className="mb-0 d-flex align-items-center">
                                <i className="bi bi-info-circle me-2"></i>
                                Informasi Edit Film
                            </h6>
                        </Card.Header>
                        <Card.Body>
                            <div className="mb-3">
                                <h6 className="fw-bold text-info">
                                    <i className="bi bi-lightbulb me-1"></i>Tips
                                </h6>
                                <ul className="small">
                                    <li>Pastikan data yang diubah akurat</li>
                                    <li>Periksa format durasi (HH:MM:SS)</li>
                                    <li>Status akan update otomatis</li>
                                </ul>
                            </div>

                            <div className="mb-3">
                                <h6 className="fw-bold text-success">
                                    <i className="bi bi-tags me-1"></i>Status Film
                                </h6>
                                <div className="small">
                                    <div className="d-flex align-items-center mb-2">
                                        <span className="badge bg-warning me-2">Coming Soon</span>
                                        <span>Belum tayang</span>
                                    </div>
                                    <div className="d-flex align-items-center mb-2">
                                        <span className="badge bg-success me-2">Now Showing</span>
                                        <span>Sedang tayang</span>
                                    </div>
                                    <div className="d-flex align-items-center">
                                        <span className="badge bg-secondary me-2">Ended</span>
                                        <span>Selesai tayang</span>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h6 className="fw-bold text-danger">
                                    <i className="bi bi-exclamation-triangle me-1"></i>Perhatian
                                </h6>
                                <ul className="small text-muted">
                                    <li>Field bertanda * wajib diisi</li>
                                    <li>Durasi format HH:MM:SS</li>
                                    <li>Tanggal selesai opsional</li>
                                    <li>Simpan setelah semua perubahan</li>
                                </ul>
                            </div>
                        </Card.Body>
                    </Card>

                </Col>
            </Row>
        </Container>
    );
};

export default EditFilmPage;