import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Container, Row, Col, Card, Breadcrumb, Alert, Button } from "react-bootstrap";
import FormDeleteFilm from "../components/FormDeleteFilm";

const DeleteFilmPage = () => {
    const navigate = useNavigate();
    const { id_film } = useParams();
    
    const [user, setUser] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [filmData, setFilmData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    console.log("📌 DeleteFilmPage - ID_FILM dari URL:", id_film);

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
                    <p>Hanya admin yang dapat menghapus film.</p>
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
                    <p>Silakan pilih film yang ingin dihapus dari halaman kelola film.</p>
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

    const handleCloseModal = () => {
        setShowDeleteModal(false);
        navigate("/kelola-film");
    };

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
                    <i className="bi bi-trash3 me-1"></i> Hapus Film
                </Breadcrumb.Item>
            </Breadcrumb>

            {/* Page Header */}
            <Row className="mb-4">
                <Col>
                    <div className="d-flex justify-content-between align-items-center">
                        <div>
                            <h1 className="fw-bold text-danger">
                                <i className="bi bi-trash3 me-2"></i>Hapus Film
                            </h1>
                            <p className="text-muted">
                                <span className="me-2">ID Film:</span>
                                <span className="badge bg-dark fs-6">{id_film}</span>
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

            {/* Main Content */}
            <Row>
                <Col lg={8}>
                    <Card className="shadow-sm border-0">
                        <Card.Header className="bg-danger text-white py-3">
                            <h5 className="mb-0 d-flex align-items-center">
                                <i className="bi bi-exclamation-triangle me-2"></i>
                                Konfirmasi Penghapusan Film
                            </h5>
                        </Card.Header>
                        <Card.Body className="p-4">
                            <Alert variant="danger" className="mb-4">
                                <Alert.Heading className="d-flex align-items-center">
                                    <i className="bi bi-exclamation-octagon-fill me-2"></i>
                                    PERINGATAN: Tindakan Berbahaya
                                </Alert.Heading>
                                <p>
                                    Anda sedang dalam proses menghapus film dari sistem. Proses ini akan:
                                </p>
                                <ul>
                                    <li>Menghapus film secara permanen dari database</li>
                                    <li>Menghapus semua jadwal tayang yang terkait dengan film ini</li>
                                    <li>Menghapus semua pemesanan tiket untuk film ini</li>
                                    <li><strong>Tindakan ini tidak dapat dibatalkan!</strong></li>
                                </ul>
                                <hr />
                                <p className="mb-0">
                                    Klik tombol di bawah ini untuk membuka dialog konfirmasi penghapusan.
                                </p>
                            </Alert>

                            <div className="text-center">
                                <Button
                                    variant="danger"
                                    size="lg"
                                    onClick={() => setShowDeleteModal(true)}
                                    className="px-5 py-3 fw-bold"
                                >
                                    <i className="bi bi-trash3 me-2"></i>
                                    Buka Dialog Konfirmasi Hapus Film
                                </Button>
                                
                                <p className="text-muted mt-3 small">
                                    <i className="bi bi-info-circle me-1"></i>
                                    Anda akan diminta untuk mengonfirmasi sebelum penghapusan dilakukan
                                </p>
                            </div>

                            <div className="mt-4 pt-3 border-top">
                                <Button
                                    variant="outline-secondary"
                                    onClick={() => navigate("/kelola-film")}
                                    className="px-4"
                                >
                                    <i className="bi bi-arrow-left me-1"></i>
                                    Kembali ke Kelola Film
                                </Button>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>

                {/* Sidebar Information */}
                <Col lg={4}>
                    {/* Info Card */}
                    <Card className="shadow-sm border-0 mb-3">
                        <Card.Header className="bg-danger text-white">
                            <h6 className="mb-0 d-flex align-items-center">
                                <i className="bi bi-shield-exclamation me-2"></i>
                                Keamanan & Validasi
                            </h6>
                        </Card.Header>
                        <Card.Body>
                            <div className="mb-3">
                                <h6 className="fw-bold text-danger">
                                    <i className="bi bi-exclamation-triangle me-1"></i>Validasi Sebelum Hapus
                                </h6>
                                <ul className="small">
                                    <li>Pastikan film sudah tidak memiliki jadwal aktif</li>
                                    <li>Cek apakah ada tiket yang masih pending</li>
                                    <li>Verifikasi ID film yang akan dihapus</li>
                                    <li>Backup data jika diperlukan</li>
                                </ul>
                            </div>

                            <div className="mb-3">
                                <h6 className="fw-bold text-info">
                                    <i className="bi bi-clock-history me-1"></i>Proses Penghapusan
                                </h6>
                                <div className="small">
                                    <div className="d-flex align-items-center mb-2">
                                        <span className="badge bg-warning me-2">1</span>
                                        <span>Konfirmasi identitas admin</span>
                                    </div>
                                    <div className="d-flex align-items-center mb-2">
                                        <span className="badge bg-danger me-2">2</span>
                                        <span>Validasi data film</span>
                                    </div>
                                    <div className="d-flex align-items-center mb-2">
                                        <span className="badge bg-primary me-2">3</span>
                                        <span>Hapus data terkait</span>
                                    </div>
                                    <div className="d-flex align-items-center">
                                        <span className="badge bg-success me-2">4</span>
                                        <span>Konfirmasi sukses</span>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h6 className="fw-bold text-dark">
                                    <i className="bi bi-person-check me-1"></i>Hak Akses
                                </h6>
                                <ul className="small text-muted">
                                    <li>Hanya user dengan role <strong>admin</strong></li>
                                    <li>Session token harus valid</li>
                                    <li>IP address tercatat di log sistem</li>
                                    <li>Waktu penghapusan akan dicatat</li>
                                </ul>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Delete Modal */}
            <FormDeleteFilm
                filmId={id_film}
                show={showDeleteModal}
                onHide={handleCloseModal}
            />
        </Container>
    );
};

export default DeleteFilmPage;