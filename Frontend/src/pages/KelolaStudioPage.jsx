import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Container, Row, Col, Card, Breadcrumb, Alert, Button, 
  Table, Badge, Spinner, Modal, Form, InputGroup 
} from "react-bootstrap";
import { toast } from "sonner";
import axios from 'axios';
import FormKelolaStudio from "../components/FormKelolaStudio";

const KelolaStudioPage = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [studios, setStudios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    
    // State untuk modal
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    
    // State untuk data yang dipilih
    const [selectedStudio, setSelectedStudio] = useState(null);
    const [studioToDelete, setStudioToDelete] = useState(null);
    const [studioToEdit, setStudioToEdit] = useState(null);
    
    const [deleting, setDeleting] = useState(false);

    const API_STUDIO_URL = 'http://localhost:8000/api/studio';

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

    useEffect(() => {
        if (isAdmin) {
            fetchStudios();
        }
    }, [isAdmin]);

    const fetchStudios = async () => {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('auth_token');
            
            const response = await axios.get(API_STUDIO_URL, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            let studiosData = [];
            
            if (response.data && Array.isArray(response.data)) {
                studiosData = response.data;
            } else if (response.data && Array.isArray(response.data.data)) {
                studiosData = response.data.data;
            }
            
            if (studiosData.length > 0) {
                setStudios(studiosData);
                toast.success(`Berhasil memuat ${studiosData.length} studio`);
            } else {
                setStudios([]);
            }
        } catch (err) {
            console.error("Gagal mengambil data studio:", err);
            
            let errorMessage = "Gagal memuat data studio.";
            
            if (err.response?.status === 401) {
                errorMessage = "Token tidak valid. Silakan login kembali.";
                localStorage.removeItem('auth_token');
                localStorage.removeItem('user');
                navigate('/login');
            } else if (err.response?.data?.message) {
                errorMessage = err.response.data.message;
            }
            
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    // Filter studios
    const filteredStudios = studios.filter(studio => {
        const studioNumber = studio.nomor_studio?.toString() || "";
        const capacity = studio.kapasitas?.toString() || "";
        const type = studio.tipe?.toLowerCase() || ""; // TAMBAHAN: Filter by Tipe
        
        const searchLower = searchTerm.toLowerCase();

        return studioNumber.includes(searchLower) || 
               capacity.includes(searchLower) ||
               type.includes(searchLower);
    });

    // Helpers UI
    const getTipeBadgeColor = (tipe) => {
        switch (tipe) {
            case 'imax': return 'primary';
            case 'screenx': return 'info';
            default: return 'secondary'; // reguler
        }
    };

    // ============= MODAL HANDLERS =============
    const handleViewDetails = (studio) => {
        setSelectedStudio(studio);
        setShowDetailModal(true);
    };

    const handleOpenCreateModal = () => {
        setShowCreateModal(true);
    };

    const handleOpenEditModal = (studio) => {
        setStudioToEdit(studio);
        setShowEditModal(true);
    };

    const handleOpenDeleteModal = (studio) => {
        setStudioToDelete(studio);
        setShowDeleteModal(true);
    };

    const handleFormSuccess = () => {
        fetchStudios(); // Refresh data
    };

    const handleConfirmDelete = async () => {
        if (!studioToDelete) return;
        
        setDeleting(true);
        try {
            const token = localStorage.getItem('auth_token');
            const studioId = studioToDelete.id_studio || studioToDelete.id;
            
            if (!studioId) throw new Error("ID studio tidak ditemukan");
            
            const endpoint = `${API_STUDIO_URL}/delete/${studioId}`; // Menggunakan endpoint delete spesifik
            
            await axios.delete(endpoint, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            toast.success(`Studio "${studioToDelete.nomor_studio}" berhasil dihapus`);
            
            setStudios(prevStudios => prevStudios.filter(studio => {
                const studioIdToCompare = studio.id_studio || studio.id;
                return studioIdToCompare !== studioId;
            }));
            
            setShowDeleteModal(false);
            setStudioToDelete(null);
            
        } catch (err) {
            console.error("Gagal menghapus studio:", err);
            let errorMessage = "Gagal menghapus studio.";
            if (err.response?.data?.message) {
                errorMessage += " " + err.response.data.message;
            }
            toast.error(errorMessage);
        } finally {
            setDeleting(false);
        }
    };

    const getCapacityBadge = (capacity) => {
        if (!capacity) return 'secondary';
        if (capacity >= 200) return 'danger';
        if (capacity >= 100) return 'warning';
        return 'success';
    };

    if (!isAdmin && user) {
        return (
            <Container className="mt-5">
                <Alert variant="danger" className="text-center">
                    <h4>🚫 Akses Ditolak</h4>
                    <p>Hanya admin yang dapat mengelola studio.</p>
                    <Button variant="primary" onClick={() => navigate("/dashboard")}>
                        Kembali ke Dashboard
                    </Button>
                </Alert>
            </Container>
        );
    }

    return (
        <Container className="mt-4 mb-5">
            <Breadcrumb className="mb-4">
                <Breadcrumb.Item onClick={() => navigate("/dashboard")} style={{ cursor: "pointer" }}>
                    <i className="bi bi-house-door me-1"></i> Dashboard
                </Breadcrumb.Item>
                <Breadcrumb.Item active>
                    <i className="bi bi-building me-1"></i> Kelola Studio
                </Breadcrumb.Item>
            </Breadcrumb>

            <Row className="mb-4">
                <Col>
                    <div className="d-flex justify-content-between align-items-center">
                        <h1 className="fw-bold text-primary">
                            <i className="bi bi-building me-2"></i>Kelola Studio
                        </h1>
                        <Button variant="primary" onClick={handleOpenCreateModal}>
                            <i className="bi bi-plus-circle me-1"></i>Tambah Studio
                        </Button>
                    </div>
                </Col>
            </Row>

            <Card className="mb-4">
                <Card.Body>
                    <Row>
                        <Col md={6}>
                            <InputGroup>
                                <InputGroup.Text><i className="bi bi-search"></i></InputGroup.Text>
                                <Form.Control
                                    placeholder="Cari nomor, kapasitas, atau tipe..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                {searchTerm && (
                                    <Button variant="outline-secondary" onClick={() => setSearchTerm("")}>
                                        <i className="bi bi-x"></i>
                                    </Button>
                                )}
                            </InputGroup>
                        </Col>
                        <Col md={6} className="text-end">
                            <Button variant="outline-secondary" onClick={fetchStudios} disabled={loading} size="sm">
                                <i className="bi bi-arrow-clockwise me-1"></i> {loading ? 'Memuat...' : 'Refresh'}
                            </Button>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>

            {loading && (
                <div className="text-center py-5">
                    <Spinner animation="border" variant="primary" />
                    <p className="mt-3 text-muted">Memuat data studio...</p>
                </div>
            )}

            {error && !loading && (
                <Alert variant="danger" className="text-center">
                    <i className="bi bi-exclamation-triangle-fill me-2"></i> {error}
                    <div className="mt-2">
                        <Button variant="outline-danger" onClick={fetchStudios} size="sm">Coba Lagi</Button>
                    </div>
                </Alert>
            )}

            {!loading && !error && filteredStudios.length === 0 && (
                <Card className="text-center py-5">
                    <Card.Body>
                        <i className="bi bi-building text-muted mb-3" style={{ fontSize: "2rem" }}></i>
                        <h5>Tidak ada studio ditemukan</h5>
                        <p className="text-muted">
                            {searchTerm ? `Tidak ada hasil untuk "${searchTerm}"` : "Belum ada studio dalam sistem"}
                        </p>
                    </Card.Body>
                </Card>
            )}

            {!loading && !error && filteredStudios.length > 0 && (
                <Card>
                    <div className="table-responsive">
                        <Table hover className="mb-0 align-middle">
                            <thead className="bg-light">
                                <tr>
                                    <th width="50" className="text-center">No</th>
                                    <th>Nomor Studio</th>
                                    <th>Tipe</th> {/* TAMBAHAN KOLOM */}
                                    <th>Kapasitas</th>
                                    <th width="180" className="text-center">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredStudios.map((studio, index) => (
                                    <tr key={studio.id_studio || studio.id || index}>
                                        <td className="text-center text-muted">{index + 1}</td>
                                        <td>
                                            <span className="fw-bold fs-5">Studio {studio.nomor_studio}</span>
                                        </td>
                                        <td>
                                            {/* TAMBAHAN DATA TIPE */}
                                            <Badge bg={getTipeBadgeColor(studio.tipe)} className="text-uppercase">
                                                {studio.tipe || 'Reguler'}
                                            </Badge>
                                        </td>
                                        <td>
                                            <Badge bg={getCapacityBadge(studio.kapasitas)} className="fw-normal">
                                                <i className="bi bi-people-fill me-1"></i>
                                                {studio.kapasitas} Kursi
                                            </Badge>
                                        </td>
                                        <td>
                                            <div className="d-flex justify-content-center gap-2">
                                                <Button variant="outline-info" size="sm" onClick={() => handleViewDetails(studio)}>
                                                    <i className="bi bi-eye"></i>Detail
                                                </Button>
                                                <Button variant="outline-warning" size="sm" onClick={() => handleOpenEditModal(studio)}>
                                                    <i className="bi bi-pencil"></i>Edit
                                                </Button>
                                                <Button variant="outline-danger" size="sm" onClick={() => handleOpenDeleteModal(studio)}>
                                                    <i className="bi bi-trash"></i>Delete
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </div>
                    <Card.Footer className="bg-white">
                        <div className="d-flex justify-content-between align-items-center">
                            <small className="text-muted">Total: {filteredStudios.length} studio</small>
                        </div>
                    </Card.Footer>
                </Card>
            )}

            {/* Modals tetap sama, Detail Modal perlu sedikit update untuk menampilkan Tipe */}
            <Modal show={showDetailModal} onHide={() => setShowDetailModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Detail Studio</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedStudio && (
                        <div>
                            <div className="text-center mb-4">
                                <h3 className="fw-bold">Studio {selectedStudio.nomor_studio}</h3>
                                <Badge bg={getTipeBadgeColor(selectedStudio.tipe)} className="fs-6 text-uppercase">
                                    {selectedStudio.tipe || 'Reguler'}
                                </Badge>
                            </div>
                            <Row>
                                <Col xs={6} className="text-muted">Kapasitas:</Col>
                                <Col xs={6} className="fw-bold">{selectedStudio.kapasitas} Kursi</Col>
                            </Row>
                            <Row className="mt-2">
                                <Col xs={6} className="text-muted">ID Studio:</Col>
                                <Col xs={6} className="fw-bold">{selectedStudio.id_studio || selectedStudio.id}</Col>
                            </Row>
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowDetailModal(false)}>Tutup</Button>
                </Modal.Footer>
            </Modal>

            {/* Create & Edit Modal Wrapper */}
            <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)} centered size="lg">
                <Modal.Header closeButton className="bg-success text-white">
                    <Modal.Title><i className="bi bi-plus-circle me-2"></i>Tambah Studio</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <FormKelolaStudio mode="create" onSuccess={handleFormSuccess} onClose={() => setShowCreateModal(false)} />
                </Modal.Body>
            </Modal>

            <Modal show={showEditModal} onHide={() => setShowEditModal(false)} centered size="lg">
                <Modal.Header closeButton className="bg-warning text-dark">
                    <Modal.Title><i className="bi bi-pencil me-2"></i>Edit Studio</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {studioToEdit && (
                        <FormKelolaStudio mode="edit" studioData={studioToEdit} onSuccess={handleFormSuccess} onClose={() => setShowEditModal(false)} />
                    )}
                </Modal.Body>
            </Modal>

            {/* Delete Modal */}
            <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered size="sm">
                <Modal.Header closeButton className="bg-danger text-white">
                    <Modal.Title><i className="bi bi-trash me-2"></i>Hapus Studio</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {studioToDelete && (
                        <div className="text-center">
                            <p>Yakin ingin menghapus <strong>Studio {studioToDelete.nomor_studio}</strong>?</p>
                            <div className="d-flex justify-content-center gap-2 mt-3">
                                <Button variant="secondary" onClick={() => setShowDeleteModal(false)} disabled={deleting}>Batal</Button>
                                <Button variant="danger" onClick={handleConfirmDelete} disabled={deleting}>
                                    {deleting ? 'Menghapus...' : 'Hapus'}
                                </Button>
                            </div>
                        </div>
                    )}
                </Modal.Body>
            </Modal>
        </Container>
    );
};

export default KelolaStudioPage;