import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Container, Row, Col, Card, Breadcrumb, Alert, Button, 
  Table, Badge, Spinner, Modal, Form, InputGroup 
} from "react-bootstrap";
import { toast } from "sonner";
import axios from 'axios';
import FormKelolaFilm from "../components/FormKelolaFilm";

const KelolaFilmPage = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [films, setFilms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterGenre, setFilterGenre] = useState("");
    const [filterStatus, setFilterStatus] = useState("");
    
    // State untuk modal
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    
    // State untuk data yang dipilih
    const [selectedFilm, setSelectedFilm] = useState(null);
    const [filmToDelete, setFilmToDelete] = useState(null);
    const [filmToEdit, setFilmToEdit] = useState(null);
    
    const [deleting, setDeleting] = useState(false);

    const API_FILM_URL = 'http://localhost:8000/api/films';

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
            fetchFilms();
        }
    }, [isAdmin]);

    const fetchFilms = async () => {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('auth_token');
            
            const response = await axios.get(API_FILM_URL, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            let filmsData = [];
            
            if (response.data && Array.isArray(response.data)) {
                filmsData = response.data;
            } else if (response.data && Array.isArray(response.data.data)) {
                filmsData = response.data.data;
            }
            
            if (filmsData.length > 0) {
                setFilms(filmsData);
                toast.success(`Berhasil memuat ${filmsData.length} film`);
            } else {
                setFilms([]);
            }
        } catch (err) {
            console.error("Gagal mengambil data film:", err);
            
            let errorMessage = "Gagal memuat data film.";
            
            if (err.response?.status === 401) {
                errorMessage = "Token tidak valid. Silakan login kembali.";
                localStorage.removeItem('auth_token');
                localStorage.removeItem('user');
                navigate('/login');
            }
            
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    // Filter films
    const filteredFilms = films.filter(film => {
        const matchesSearch = film.judul?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                             film.genre?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesGenre = !filterGenre || film.genre === filterGenre;
        const matchesStatus = !filterStatus || film.status === filterStatus;
        
        return matchesSearch && matchesGenre && matchesStatus;
    });

    // ============= MODAL HANDLERS =============

    // Detail Modal
    const handleViewDetails = (film) => {
        setSelectedFilm(film);
        setShowDetailModal(true);
    };

    // Create Modal
    const handleOpenCreateModal = () => {
        setShowCreateModal(true);
    };

    // Edit Modal
    const handleOpenEditModal = (film) => {
        setFilmToEdit(film);
        setShowEditModal(true);
    };

    // Delete Modal
    const handleOpenDeleteModal = (film) => {
        setFilmToDelete(film);
        setShowDeleteModal(true);
    };

    // Success callback untuk form
    const handleFormSuccess = () => {
        fetchFilms(); // Refresh data
    };

    // Handle Delete
    const handleConfirmDelete = async () => {
        if (!filmToDelete) return;
        
        console.log("🗑️ Memulai proses delete...");
        console.log("🎬 Film yang akan dihapus:", filmToDelete);
        
        // Debug: Tampilkan semua ID yang mungkin
        console.log("🔍 ID yang tersedia:");
        console.log("  - id:", filmToDelete.id);
        console.log("  - id_film:", filmToDelete.id_film);
        console.log("  - _id:", filmToDelete._id);
        console.log("  - Semua keys:", Object.keys(filmToDelete));
        
        setDeleting(true);
        
        try {
            const token = localStorage.getItem('auth_token');
            if (!token) {
                throw new Error("Token tidak ditemukan. Silakan login ulang.");
            }
            
            // Tentukan ID yang akan digunakan
            const filmId = filmToDelete.id_film || filmToDelete.id || filmToDelete._id;
            console.log("🎯 Menggunakan ID:", filmId);
            
            if (!filmId) {
                throw new Error("ID film tidak ditemukan dalam data.");
            }
            
            // Coba berbagai endpoint dan method
            const deleteAttempts = [
                {
                    method: 'DELETE',
                    url: `${API_FILM_URL}/${filmId}`,
                    description: `DELETE ${API_FILM_URL}/${filmId}`
                },
                {
                    method: 'DELETE', 
                    url: `${API_FILM_URL}/delete/${filmId}`,
                    description: `DELETE ${API_FILM_URL}/delete/${filmId}`
                },
                {
                    method: 'POST',
                    url: `${API_FILM_URL}/delete/${filmId}`,
                    description: `POST ${API_FILM_URL}/delete/${filmId}`
                },
                {
                    method: 'POST',
                    url: `${API_FILM_URL}/${filmId}/delete`,
                    description: `POST ${API_FILM_URL}/${filmId}/delete`
                }
            ];
            
            let lastError = null;
            
            for (const attempt of deleteAttempts) {
                try {
                    console.log(`🔄 Mencoba: ${attempt.description}`);
                    
                    const config = {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    };
                    
                    let response;
                    
                    if (attempt.method === 'DELETE') {
                        response = await axios.delete(attempt.url, config);
                    } else {
                        response = await axios.post(attempt.url, {}, config);
                    }
                    
                    console.log(`✅ Berhasil dengan ${attempt.description}:`, response.data);
                    
                    // Update state
                    setFilms(prevFilms => prevFilms.filter(film => {
                        const filmIdToCompare = film.id_film || film.id || film._id;
                        return filmIdToCompare !== filmId;
                    }));
                    
                    toast.success(`Film "${filmToDelete.judul}" berhasil dihapus`);
                    
                    // Tutup modal
                    setShowDeleteModal(false);
                    setFilmToDelete(null);
                    setDeleting(false);
                    
                    return; // Keluar jika berhasil
                    
                } catch (err) {
                    lastError = err;
                    console.log(`❌ Gagal dengan ${attempt.description}:`, {
                        status: err.response?.status,
                        statusText: err.response?.statusText,
                        data: err.response?.data,
                        message: err.message
                    });
                    
                    // Jika error 404, mungkin endpoint salah, lanjut ke percobaan berikutnya
                    if (err.response?.status !== 404) {
                        // Untuk error selain 404, tampilkan pesan error
                        console.log("⚠️ Error spesifik:", err.response?.data);
                    }
                }
            }
            
            // Jika semua percobaan gagal
            if (lastError) {
                throw lastError;
            }
            
        } catch (err) {
            console.error("❌ Semua percobaan delete gagal:", err);
            
            let errorMessage = "Gagal menghapus film. ";
            let errorDetails = "";
            
            if (err.response) {
                // Server responded with error
                errorDetails = `Status: ${err.response.status} ${err.response.statusText}`;
                
                if (err.response.status === 401) {
                    errorMessage += "Token tidak valid. Silakan login kembali.";
                } else if (err.response.status === 403) {
                    errorMessage += "Anda tidak memiliki izin untuk menghapus film.";
                } else if (err.response.status === 404) {
                    errorMessage += "Film tidak ditemukan di server.";
                } else if (err.response.status === 405) {
                    errorMessage += "Method tidak didukung oleh server.";
                } else if (err.response.data?.message) {
                    errorMessage += err.response.data.message;
                } else if (err.response.data?.error) {
                    errorMessage += err.response.data.error;
                }
                
            } else if (err.request) {
                // Request dibuat tapi tidak ada response
                errorMessage += "Tidak ada response dari server. ";
                errorDetails = "Periksa koneksi internet atau server mungkin down.";
            } else {
                // Error lainnya
                errorMessage += err.message || "Terjadi kesalahan tidak diketahui.";
            }
            
            console.log("📋 Error details untuk user:", { errorMessage, errorDetails });
            
            // Tampilkan toast dengan detail
            toast.error(
                <div>
                    <div><strong>{errorMessage}</strong></div>
                    {errorDetails && <div><small>{errorDetails}</small></div>}
                </div>
            );
            
        } finally {
            setDeleting(false);
        }
    };

    // ============= HELPER FUNCTIONS =============

    // Format tanggal
    const formatDate = (dateString) => {
        if (!dateString) return "-";
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
            });
        } catch {
            return "-";
        }
    };

    // Get status badge
    const getStatusBadge = (status) => {
        if (!status) return 'secondary';
        
        switch (status.toLowerCase()) {
            case 'showing': return 'success';
            case 'coming soon': return 'warning';
            case 'ended': return 'secondary';
            default: return 'info';
        }
    };

    // Get status text
    const getStatusText = (status) => {
        if (!status) return 'Unknown';
        
        switch (status.toLowerCase()) {
            case 'showing': return 'Now Showing';
            case 'coming soon': return 'Coming Soon';
            case 'ended': return 'Ended';
            default: return status;
        }
    };

    // Get unique genres and statuses
    const uniqueGenres = [...new Set(films.map(film => film.genre).filter(Boolean))];
    const uniqueStatuses = [...new Set(films.map(film => film.status).filter(Boolean))];

    // Redirect if not admin
    if (!isAdmin && user) {
        return (
            <Container className="mt-5">
                <Alert variant="danger" className="text-center">
                    <h4>🚫 Akses Ditolak</h4>
                    <p>Hanya admin yang dapat mengelola film.</p>
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
                    <i className="mb-4 fw-bolder text-white"></i> Kelola Film
                </Breadcrumb.Item>
            </Breadcrumb>

            {/* Page Header */}
            <Row className="mb-4">
                <Col>
                    <div className="d-flex justify-content-between align-items-center">
                        <div>
                            <h1 className="fw-bold text-primary">
                                <i className="bi bi-film me-2"></i>Kelola Film
                            </h1>
                            <p className="text-muted">
                                Total: <strong>{films.length} film</strong>
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
                            <i className="bi bi-plus-circle me-1"></i>Tambah Film
                        </Button>
                    </div>
                </Col>
            </Row>

            {/* Filter Section */}
            <Card className="mb-4">
                <Card.Body>
                    <Row>
                        <Col md={4}>
                            <Form.Group>
                                <InputGroup size="sm">
                                    <InputGroup.Text>
                                        <i className="bi bi-search"></i>
                                    </InputGroup.Text>
                                    <Form.Control
                                        placeholder="Cari judul atau genre..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </InputGroup>
                            </Form.Group>
                        </Col>
                        <Col md={4}>
                            <Form.Group>
                                <Form.Select
                                    size="sm"
                                    value={filterGenre}
                                    onChange={(e) => setFilterGenre(e.target.value)}
                                >
                                    <option value="">Semua Genre</option>
                                    {uniqueGenres.map((genre, index) => (
                                        <option key={index} value={genre}>{genre}</option>
                                    ))}
                                </Form.Select>
                            </Form.Group>
                        </Col>
                        <Col md={4}>
                            <Form.Group>
                                <Form.Select
                                    size="sm"
                                    value={filterStatus}
                                    onChange={(e) => setFilterStatus(e.target.value)}
                                >
                                    <option value="">Semua Status</option>
                                    {uniqueStatuses.map((status, index) => (
                                        <option key={index} value={status}>
                                            {getStatusText(status)}
                                        </option>
                                    ))}
                                </Form.Select>
                            </Form.Group>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>

            {/* Loading State */}
            {loading && (
                <div className="text-center py-5">
                    <Spinner animation="border" variant="primary" />
                    <p className="mt-3 text-muted">Memuat data film...</p>
                </div>
            )}

            {/* Error State */}
            {error && !loading && (
                <Alert variant="danger" className="text-center">
                    <i className="bi bi-exclamation-triangle-fill me-2"></i>
                    <p>{error}</p>
                    <Button variant="outline-danger" onClick={fetchFilms} size="sm">
                        <i className="bi bi-arrow-clockwise me-1"></i>Coba Lagi
                    </Button>
                </Alert>
            )}

            {/* Empty State */}
            {!loading && !error && filteredFilms.length === 0 && (
                <Card className="text-center py-5">
                    <Card.Body>
                        <i className="bi bi-film text-muted mb-3" style={{ fontSize: "2rem" }}></i>
                        <h5>Tidak ada film ditemukan</h5>
                        <p className="text-muted mb-3">
                            {searchTerm || filterGenre || filterStatus 
                                ? `Tidak ada film yang cocok` 
                                : "Belum ada film dalam katalog"}
                        </p>
                        <Button 
                            variant="primary"
                            onClick={handleOpenCreateModal}
                            size="sm"
                        >
                            <i className="bi bi-plus-circle me-1"></i>Tambah Film
                        </Button>
                    </Card.Body>
                </Card>
            )}

            {/* Films Table */}
            {!loading && !error && filteredFilms.length > 0 && (
                <Card>
                    <Card.Body className="p-0">
                        <div className="table-responsive">
                            <Table hover className="mb-0">
                                <thead className="bg-light">
                                    <tr>
                                        <th width="40">Id</th>
                                        <th>Judul Film</th>
                                        <th>Genre</th>
                                        <th>Durasi</th>
                                        <th>Tanggal Tayang</th>
                                        <th>Status</th>
                                        <th width="150" className="text-center">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredFilms.map((film, index) => (
                                        <tr key={film.id || index}>
                                            <td className="text-muted">
                                                {film.id_film}
                                            </td>
                                            <td>
                                                <div className="fw-semibold">{film.judul || "-"}</div>
                                            </td>
                                            <td>
                                                <Badge bg="info" className="fw-normal">
                                                    {film.genre || "-"}
                                                </Badge>
                                            </td>
                                            <td>
                                                <i className="bi bi-clock me-1 text-muted"></i>
                                                {film.durasi_film || "-"}
                                            </td>
                                            <td>
                                                <div>
                                                    <small className="d-block">
                                                        Mulai: {formatDate(film.start_date)}
                                                    </small>
                                                    <small className="d-block text-muted">
                                                        Selesai: {film.end_date ? formatDate(film.end_date) : "-"}
                                                    </small>
                                                </div>
                                            </td>
                                            <td>
                                                <Badge bg={getStatusBadge(film.status)} className="fw-normal">
                                                    {getStatusText(film.status)}
                                                </Badge>
                                            </td>
                                            <td>
                                                <div className="d-flex justify-content-center gap-1">
                                                    {/* Button Detail */}
                                                    <Button
                                                        variant="outline-info"
                                                        size="sm"
                                                        onClick={() => handleViewDetails(film)}
                                                        title="Detail"
                                                        className="px-2 py-1"
                                                    >
                                                        <i className="bi bi-eye"></i> Detail
                                                    </Button>
                                                    
                                                    {/* Button Edit */}
                                                    <Button
                                                        variant="outline-warning"
                                                        size="sm"
                                                        onClick={() => handleOpenEditModal(film)}
                                                        title="Edit"
                                                        className="px-2 py-1"
                                                    >
                                                        <i className="bi bi-pencil"></i> Edit
                                                    </Button>
                                                    
                                                    {/* Button Delete */}
                                                    <Button
                                                        variant="outline-danger"
                                                        size="sm"
                                                        onClick={() => handleOpenDeleteModal(film)}
                                                        title="Hapus"
                                                        className="px-2 py-1"
                                                    >
                                                        <i className="bi bi-trash"></i> Delete
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
                        <small className="text-muted">
                            Menampilkan {filteredFilms.length} dari {films.length} film
                        </small>
                    </Card.Footer>
                </Card>
            )}

            {/* ============= MODALS ============= */}

            {/* Detail Film Modal */}
            <Modal show={showDetailModal} onHide={() => setShowDetailModal(false)} centered size="lg">
                <Modal.Header closeButton className="bg-primary text-white py-2">
                    <Modal.Title className="fs-6">
                        <i className="bi bi-film me-1"></i>Detail Film
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className="py-3">
                    {selectedFilm && (
                        <Row>
                            <Col md={12}>
                                <div className="mb-3">
                                    <h5 className="fw-bold">{selectedFilm.judul}</h5>
                                    <Badge bg={getStatusBadge(selectedFilm.status)} className="mb-2">
                                        {getStatusText(selectedFilm.status)}
                                    </Badge>
                                </div>
                                
                                <div className="row small">
                                    <div className="col-6 mb-2">
                                        <strong>ID Film:</strong>
                                        <div>
                                            <i className="bi bi-tag me-1"></i>
                                            {selectedFilm.id_film}
                                        </div>
                                    </div>
                                    <div className="col-6 mb-2">
                                        <strong>Genre:</strong>
                                        <div><Badge bg="info">{selectedFilm.genre}</Badge></div>
                                    </div>
                                    <div className="col-6 mb-2">
                                        <strong>Durasi:</strong>
                                        <div>
                                            <i className="bi bi-clock me-1"></i>
                                            {selectedFilm.durasi_film}
                                        </div>
                                    </div>
                                    <div className="col-6 mb-2">
                                        <strong>Status:</strong>
                                        <div>
                                            <Badge bg={getStatusBadge(selectedFilm.status)}>
                                                {getStatusText(selectedFilm.status)}
                                            </Badge>
                                        </div>
                                    </div>
                                    <div className="col-6 mb-2">
                                        <strong>Tanggal Mulai:</strong>
                                        <div>
                                            <i className="bi bi-calendar-plus me-1"></i>
                                            {formatDate(selectedFilm.start_date)}
                                        </div>
                                    </div>
                                    <div className="col-6 mb-2">
                                        <strong>Tanggal Selesai:</strong>
                                        <div>
                                            <i className="bi bi-calendar-check me-1"></i>
                                            {selectedFilm.end_date ? formatDate(selectedFilm.end_date) : "-"}
                                        </div>
                                    </div>
                                    <div className="col-6 mb-2">
                                        <strong>Dibuat:</strong>
                                        <div className="text-muted">
                                            <i className="bi bi-calendar-plus me-1"></i>
                                            {formatDate(selectedFilm.created_at)}
                                        </div>
                                    </div>
                                    <div className="col-6 mb-2">
                                        <strong>Diupdate:</strong>
                                        <div className="text-muted">
                                            <i className="bi bi-calendar-check me-1"></i>
                                            {formatDate(selectedFilm.updated_at)}
                                        </div>
                                    </div>
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

            {/* Create Film Modal */}
            <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)} centered size="lg">
                <Modal.Header closeButton className="bg-success text-white py-2">
                    <Modal.Title className="fs-6">
                        <i className="bi bi-plus-circle me-1"></i>Tambah Film Baru
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className="py-3">
                    <FormKelolaFilm
                        mode="create"
                        onSuccess={handleFormSuccess}
                        onClose={() => setShowCreateModal(false)}
                    />
                </Modal.Body>
            </Modal>

            {/* Edit Film Modal */}
            <Modal show={showEditModal} onHide={() => setShowEditModal(false)} centered size="lg">
                <Modal.Header closeButton className="bg-warning text-white py-2">
                    <Modal.Title className="fs-6">
                        <i className="bi bi-pencil me-1"></i>Edit Film
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className="py-3">
                    {filmToEdit && (
                        <FormKelolaFilm
                            mode="edit"
                            filmData={filmToEdit}
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
                        <i className="bi bi-trash me-1"></i>Hapus Film
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className="py-3">
                    {filmToDelete && (
                        <>
                            <Alert variant="danger" className="py-2 mb-2">
                                <i className="bi bi-exclamation-triangle-fill me-1"></i>
                                <small><strong>PERINGATAN:</strong> Tidak dapat dibatalkan!</small>
                            </Alert>
                            <p className="mb-2">Hapus film ini?</p>
                            <div className="bg-light p-2 rounded small">
                                <strong>{filmToDelete.judul}</strong>
                                <div className="text-muted">
                                    ID: {filmToDelete.id_film} | Genre: {filmToDelete.genre}
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

export default KelolaFilmPage;