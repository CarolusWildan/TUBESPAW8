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
            
            console.log("Response studios:", response.data);
            
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
        
        return studioNumber.includes(searchTerm) || 
               capacity.includes(searchTerm);
    });

    // ============= MODAL HANDLERS =============

    // Detail Modal
    const handleViewDetails = (studio) => {
        setSelectedStudio(studio);
        setShowDetailModal(true);
    };

    // Create Modal
    const handleOpenCreateModal = () => {
        setShowCreateModal(true);
    };

    // Edit Modal
    const handleOpenEditModal = (studio) => {
        setStudioToEdit(studio);
        setShowEditModal(true);
    };

    // Delete Modal
    const handleOpenDeleteModal = (studio) => {
        setStudioToDelete(studio);
        setShowDeleteModal(true);
    };

    // Success callback untuk form
    const handleFormSuccess = () => {
        fetchStudios(); // Refresh data
    };

    // Handle Delete
    const handleConfirmDelete = async () => {
        if (!studioToDelete) return;
        
        setDeleting(true);
        try {
            const token = localStorage.getItem('auth_token');
            
            // Tentukan ID yang akan digunakan
            const studioId = studioToDelete.id_studio || studioToDelete.id;
            
            if (!studioId) {
                throw new Error("ID studio tidak ditemukan");
            }
            
            // Coba berbagai endpoint
            const deleteEndpoints = [
                `${API_STUDIO_URL}/delete/${studioId}`,
                `${API_STUDIO_URL}/${studioId}`
            ];
            
            let deleteError = null;
            
            for (const endpoint of deleteEndpoints) {
                try {
                    console.log(`Mencoba delete dengan endpoint: ${endpoint}`);
                    const response = await axios.delete(endpoint, {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    });
                    
                    console.log("Delete berhasil:", response.data);
                    toast.success(`Studio "${studioToDelete.nomor_studio}" berhasil dihapus`);
                    
                    // Update state
                    setStudios(prevStudios => prevStudios.filter(studio => {
                        const studioIdToCompare = studio.id_studio || studio.id;
                        return studioIdToCompare !== studioId;
                    }));
                    
                    // Tutup modal
                    setShowDeleteModal(false);
                    setStudioToDelete(null);
                    setDeleting(false);
                    
                    return; // Keluar jika berhasil
                    
                } catch (err) {
                    deleteError = err;
                    console.log(`Endpoint ${endpoint} gagal:`, err.response?.status);
                    
                    // Jika error 404, coba endpoint berikutnya
                    if (err.response?.status !== 404) {
                        break; // Keluar loop untuk error selain 404
                    }
                }
            }
            
            // Jika semua percobaan gagal
            if (deleteError) {
                throw deleteError;
            }
            
        } catch (err) {
            console.error("Gagal menghapus studio:", err);
            
            let errorMessage = "Gagal menghapus studio. ";
            
            if (err.response?.status === 404) {
                errorMessage += "Studio tidak ditemukan di server.";
            } else if (err.response?.data?.message) {
                errorMessage += err.response.data.message;
            } else {
                errorMessage += "Cek koneksi atau endpoint API.";
            }
            
            toast.error(errorMessage);
        } finally {
            setDeleting(false);
        }
    };

    // Format tanggal
    const formatDate = (dateString) => {
        if (!dateString) return "-";
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch {
            return "-";
        }
    };

    // Get capacity badge color
    const getCapacityBadge = (capacity) => {
        if (!capacity) return 'secondary';
        
        if (capacity >= 200) return 'danger';
        if (capacity >= 100) return 'warning';
        return 'success';
    };

    // Get capacity category
    const getCapacityCategory = (capacity) => {
        if (!capacity) return 'Unknown';
        
        if (capacity >= 200) return 'Large';
        if (capacity >= 100) return 'Medium';
        return 'Small';
    };

    // Redirect if not admin
    if (!isAdmin && user) {
        return (
            <Container className="mt-5">
                <Alert variant="danger" className="text-center">
                    <h4>🚫 Akses Ditolak</h4>
                    <p>Hanya admin yang dapat mengelola studio.</p>
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
        <Container className="mt-4 mb-5">
            {/* Breadcrumb */}
            <Breadcrumb className="mb-4">
                <Breadcrumb.Item onClick={() => navigate("/dashboard")} style={{ cursor: "pointer" }}>
                    <i className="bi bi-house-door me-1"></i> Dashboard
                </Breadcrumb.Item>
                <Breadcrumb.Item active>
                    <i className="bi bi-building me-1"></i> Kelola Studio
                </Breadcrumb.Item>
            </Breadcrumb>

            {/* Page Header */}
            <Row className="mb-4">
                <Col>
                    <div className="d-flex justify-content-between align-items-center">
                        <div>
                            <h1 className="fw-bold text-primary">
                                <i className="bi bi-building me-2"></i>Kelola Studio
                            </h1>
                            <p className="text-muted">
                                Total: <strong>{studios.length} studio</strong>
                                {studios.length > 0 && (
                                    <span className="ms-3">
                                        Kapasitas total: <strong>{studios.reduce((sum, studio) => sum + (studio.kapasitas || 0), 0)} kursi</strong>
                                    </span>
                                )}
                            </p>
                        </div>
                    </div>
                </Col>
            </Row>

            <Row className="mb-4">
                <Col>
                    <div className="d-flex justify-content-between align-items-center">
                        <Button 
                            variant="primary"
                            onClick={handleOpenCreateModal}
                            className="me-2"
                        >
                            <i className="bi bi-plus-circle me-1"></i>Tambah Studio
                        </Button>
                    </div>
                </Col>
            </Row>

            {/* Filter Section */}
            <Card className="mb-4">
                <Card.Body>
                    <Row>
                        <Col md={6}>
                            <Form.Group>
                                <InputGroup>
                                    <InputGroup.Text>
                                        <i className="bi bi-search"></i>
                                    </InputGroup.Text>
                                    <Form.Control
                                        placeholder="Cari nomor studio atau kapasitas..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                    {searchTerm && (
                                        <Button 
                                            variant="outline-secondary"
                                            onClick={() => setSearchTerm("")}
                                        >
                                            <i className="bi bi-x"></i>
                                        </Button>
                                    )}
                                </InputGroup>
                            </Form.Group>
                        </Col>
                        <Col md={6} className="text-end">
                            <Button 
                                variant="outline-secondary"
                                onClick={fetchStudios}
                                disabled={loading}
                                size="sm"
                            >
                                <i className="bi bi-arrow-clockwise me-1"></i>
                                {loading ? 'Memuat...' : 'Refresh'}
                            </Button>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>

            {/* Loading State */}
            {loading && (
                <div className="text-center py-5">
                    <Spinner animation="border" variant="primary" />
                    <p className="mt-3 text-muted">Memuat data studio...</p>
                </div>
            )}

            {/* Error State */}
            {error && !loading && (
                <Alert variant="danger" className="text-center">
                    <i className="bi bi-exclamation-triangle-fill me-2"></i>
                    <p>{error}</p>
                    <Button variant="outline-danger" onClick={fetchStudios} size="sm">
                        <i className="bi bi-arrow-clockwise me-1"></i>Coba Lagi
                    </Button>
                </Alert>
            )}

            {/* Empty State */}
            {!loading && !error && filteredStudios.length === 0 && (
                <Card className="text-center py-5">
                    <Card.Body>
                        <i className="bi bi-building text-muted mb-3" style={{ fontSize: "2rem" }}></i>
                        <h5>Tidak ada studio ditemukan</h5>
                        <p className="text-muted mb-3">
                            {searchTerm 
                                ? `Tidak ada studio yang cocok dengan "${searchTerm}"` 
                                : "Belum ada studio dalam sistem"}
                        </p>
                        <Button 
                            variant="primary"
                            onClick={handleOpenCreateModal}
                            size="sm"
                        >
                            <i className="bi bi-plus-circle me-1"></i>Tambah Studio
                        </Button>
                    </Card.Body>
                </Card>
            )}

            {/* Studios Table */}
            {!loading && !error && filteredStudios.length > 0 && (
                <Card>
                    <Card.Body className="p-0">
                        <div className="table-responsive">
                            <Table hover className="mb-0">
                                <thead className="bg-light">
                                    <tr>
                                        <th width="60">No</th>
                                        <th>Nomor Studio</th>
                                        <th>Kapasitas</th>
                                        <th>Kategori</th>
                                        <th>ID Studio</th>
                                        <th width="180" className="text-center">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredStudios.map((studio, index) => (
                                        <tr key={studio.id_studio || studio.id || index}>
                                            <td className="text-muted">
                                                {index + 1}
                                            </td>
                                            <td>
                                                <div className="fw-semibold">
                                                    <i className="bi bi-building me-1 text-primary"></i>
                                                    Studio {studio.nomor_studio || "-"}
                                                </div>
                                            </td>
                                            <td>
                                                <Badge bg={getCapacityBadge(studio.kapasitas)} className="fw-normal">
                                                    <i className="bi bi-people-fill me-1"></i>
                                                    {studio.kapasitas || 0} Kursi
                                                </Badge>
                                            </td>
                                            <td>
                                                <span className="text-muted">
                                                    {getCapacityCategory(studio.kapasitas)}
                                                </span>
                                            </td>
                                            <td>
                                                <code className="text-muted small">
                                                    {studio.id_studio || studio.id}
                                                </code>
                                            </td>
                                            <td>
                                                <div className="d-flex justify-content-center gap-2">
                                                    {/* Button Detail */}
                                                    <Button
                                                        variant="outline-info"
                                                        size="sm"
                                                        onClick={() => handleViewDetails(studio)}
                                                        title="Detail"
                                                        className="px-3"
                                                    >
                                                        <i className="bi bi-eye"></i>
                                                    </Button>
                                                    
                                                    {/* Button Edit */}
                                                    <Button
                                                        variant="outline-warning"
                                                        size="sm"
                                                        onClick={() => handleOpenEditModal(studio)}
                                                        title="Edit"
                                                        className="px-3"
                                                    >
                                                        <i className="bi bi-pencil"></i>
                                                    </Button>
                                                    
                                                    {/* Button Delete */}
                                                    <Button
                                                        variant="outline-danger"
                                                        size="sm"
                                                        onClick={() => handleOpenDeleteModal(studio)}
                                                        title="Hapus"
                                                        className="px-3"
                                                    >
                                                        <i className="bi bi-trash"></i>
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </div>
                    </Card.Body>
                    <Card.Footer className="bg-white">
                        <div className="d-flex justify-content-between align-items-center">
                            <small className="text-muted">
                                Menampilkan {filteredStudios.length} dari {studios.length} studio
                            </small>
                            <small className="text-muted">
                                Kapasitas total: <strong>{filteredStudios.reduce((sum, studio) => sum + (studio.kapasitas || 0), 0)} kursi</strong>
                            </small>
                        </div>
                    </Card.Footer>
                </Card>
            )}

            {/* ============= MODALS ============= */}

            {/* Detail Studio Modal */}
            <Modal show={showDetailModal} onHide={() => setShowDetailModal(false)} centered size="lg">
                <Modal.Header closeButton className="bg-info text-white py-2">
                    <Modal.Title className="fs-6">
                        <i className="bi bi-building me-1"></i>Detail Studio
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className="py-3">
                    {selectedStudio && (
                        <Row>
                            <Col md={12}>
                                <div className="mb-3">
                                    <h5 className="fw-bold">
                                        <i className="bi bi-building me-2 text-primary"></i>
                                        Studio {selectedStudio.nomor_studio}
                                    </h5>
                                    <Badge bg={getCapacityBadge(selectedStudio.kapasitas)} className="mb-2">
                                        {getCapacityCategory(selectedStudio.kapasitas)} Capacity
                                    </Badge>
                                </div>
                                
                                <div className="row small">
                                    <div className="col-6 mb-3">
                                        <div className="p-3 bg-light rounded">
                                            <p className="mb-1 text-muted small">ID Studio</p>
                                            <p className="fw-bold fs-5">
                                                <i className="bi bi-tag me-1"></i>
                                                {selectedStudio.id_studio || selectedStudio.id}
                                            </p>
                                        </div>
                                    </div>
                                    
                                    <div className="col-6 mb-3">
                                        <div className="p-3 bg-light rounded">
                                            <p className="mb-1 text-muted small">Nomor Studio</p>
                                            <p className="fw-bold fs-5">
                                                <i className="bi bi-123 me-1"></i>
                                                {selectedStudio.nomor_studio}
                                            </p>
                                        </div>
                                    </div>
                                    
                                    <div className="col-12 mb-3">
                                        <div className="p-3 bg-light rounded">
                                            <p className="mb-1 text-muted small">Kapasitas</p>
                                            <div className="d-flex align-items-center">
                                                <Badge 
                                                    bg={getCapacityBadge(selectedStudio.kapasitas)} 
                                                    className="fs-6 me-3"
                                                >
                                                    <i className="bi bi-people-fill me-1"></i>
                                                    {selectedStudio.kapasitas} Kursi
                                                </Badge>
                                                <div className="progress flex-grow-1" style={{ height: "10px" }}>
                                                    <div 
                                                        className="progress-bar" 
                                                        role="progressbar" 
                                                        style={{ 
                                                            width: `${Math.min((selectedStudio.kapasitas / 500) * 100, 100)}%`,
                                                            backgroundColor: getCapacityBadge(selectedStudio.kapasitas) === 'danger' ? '#dc3545' : 
                                                                           getCapacityBadge(selectedStudio.kapasitas) === 'warning' ? '#ffc107' : '#198754'
                                                        }}
                                                    ></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {selectedStudio.created_at && (
                                        <div className="col-6 mb-2">
                                            <strong>Dibuat:</strong>
                                            <div className="text-muted">
                                                <i className="bi bi-calendar-plus me-1"></i>
                                                {formatDate(selectedStudio.created_at)}
                                            </div>
                                        </div>
                                    )}
                                    
                                    {selectedStudio.updated_at && (
                                        <div className="col-6 mb-2">
                                            <strong>Diupdate:</strong>
                                            <div className="text-muted">
                                                <i className="bi bi-calendar-check me-1"></i>
                                                {formatDate(selectedStudio.updated_at)}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </Col>
                        </Row>
                    )}
                </Modal.Body>
                <Modal.Footer className="py-2">
                    <Button 
                        variant="secondary" 
                        onClick={() => setShowDetailModal(false)}
                        size="sm"
                    >
                        Tutup
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Create Studio Modal */}
            <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)} centered size="lg">
                <Modal.Header closeButton className="bg-success text-white py-2">
                    <Modal.Title className="fs-6">
                        <i className="bi bi-plus-circle me-1"></i>Tambah Studio Baru
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className="py-3">
                    <FormKelolaStudio
                        mode="create"
                        onSuccess={handleFormSuccess}
                        onClose={() => setShowCreateModal(false)}
                    />
                </Modal.Body>
            </Modal>

            {/* Edit Studio Modal */}
            <Modal show={showEditModal} onHide={() => setShowEditModal(false)} centered size="lg">
                <Modal.Header closeButton className="bg-warning text-white py-2">
                    <Modal.Title className="fs-6">
                        <i className="bi bi-pencil me-1"></i>Edit Studio
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className="py-3">
                    {studioToEdit && (
                        <FormKelolaStudio
                            mode="edit"
                            studioData={studioToEdit}
                            onSuccess={handleFormSuccess}
                            onClose={() => setShowEditModal(false)}
                        />
                    )}
                </Modal.Body>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered size="sm">
                <Modal.Header closeButton className="bg-danger text-white py-2">
                    <Modal.Title className="fs-6">
                        <i className="bi bi-trash me-1"></i>Hapus Studio
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className="py-3">
                    {studioToDelete && (
                        <>
                            <Alert variant="danger" className="py-2 mb-2">
                                <i className="bi bi-exclamation-triangle-fill me-1"></i>
                                <small><strong>PERINGATAN:</strong> Tidak dapat dibatalkan!</small>
                            </Alert>
                            <p className="mb-2">Hapus studio ini?</p>
                            <div className="bg-light p-3 rounded">
                                <div className="d-flex align-items-center mb-2">
                                    <i className="bi bi-building text-primary fs-4 me-2"></i>
                                    <div>
                                        <strong className="fs-5">Studio {studioToDelete.nomor_studio}</strong>
                                        <div className="text-muted small">
                                            <i className="bi bi-people-fill me-1"></i>
                                            {studioToDelete.kapasitas} Kursi
                                        </div>
                                    </div>
                                </div>
                                <div className="text-muted small">
                                    ID: {studioToDelete.id_studio || studioToDelete.id}
                                </div>
                            </div>
                        </>
                    )}
                </Modal.Body>
                <Modal.Footer className="py-2">
                    <Button 
                        variant="secondary" 
                        onClick={() => setShowDeleteModal(false)}
                        disabled={deleting}
                        size="sm"
                    >
                        Batal
                    </Button>
                    <Button 
                        variant="danger"
                        onClick={handleConfirmDelete}
                        disabled={deleting}
                        size="sm"
                    >
                        {deleting ? (
                            <>
                                <Spinner size="sm" className="me-1" />
                                Menghapus...
                            </>
                        ) : (
                            <>
                                <i className="bi bi-trash me-1"></i>Hapus
                            </>
                        )}
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default KelolaStudioPage;