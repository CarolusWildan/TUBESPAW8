import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Container, Row, Col, Card, Breadcrumb, Alert, Button, 
  Table, Badge, Spinner, Modal, Form, Dropdown, InputGroup 
} from "react-bootstrap";
import { toast } from "sonner";
import axios from 'axios';
import FormKelolaJadwal from "../components/FormKelolaJadwal";

const KelolaJadwalPage = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [jadwal, setJadwal] = useState([]);
    const [films, setFilms] = useState([]);
    const [studios, setStudios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingData, setLoadingData] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    
    // Filter states
    const [selectedFilm, setSelectedFilm] = useState("Semua Film");
    const [selectedStudio, setSelectedStudio] = useState("Semua Studio");
    const [selectedStatus, setSelectedStatus] = useState("Semua Status");
    const [selectedDate, setSelectedDate] = useState("");
    
    // State untuk modal
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    
    // State untuk data yang dipilih
    const [selectedJadwal, setSelectedJadwal] = useState(null);
    const [jadwalToDelete, setJadwalToDelete] = useState(null);
    const [jadwalToEdit, setJadwalToEdit] = useState(null);
    
    const [deleting, setDeleting] = useState(false);

    const API_JADWAL_URL = 'http://localhost:8000/api/jadwal';
    const API_FILM_URL = 'http://localhost:8000/api/films';
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

    // Fetch data on mount
    useEffect(() => {
        if (isAdmin) {
            fetchAllData();
        }
    }, [isAdmin]);

    const fetchAllData = async () => {
        setLoading(true);
        setLoadingData(true);
        setError(null);
        
        try {
            const token = localStorage.getItem('auth_token');
            const headers = {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            };

            // Fetch semua data paralel
            const [jadwalResponse, filmResponse, studioResponse] = await Promise.all([
                axios.get(API_JADWAL_URL, { headers }),
                axios.get(API_FILM_URL, { headers }),
                axios.get(API_STUDIO_URL, { headers })
            ]);

            // Process jadwal data
            let jadwalData = [];
            if (jadwalResponse.data && Array.isArray(jadwalResponse.data.data)) {
                jadwalData = jadwalResponse.data.data;
            } else if (Array.isArray(jadwalResponse.data)) {
                jadwalData = jadwalResponse.data;
            }

            // Process film data
            let filmData = [];
            if (filmResponse.data && Array.isArray(filmResponse.data.data)) {
                filmData = filmResponse.data.data;
            } else if (Array.isArray(filmResponse.data)) {
                filmData = filmResponse.data;
            }

            // Process studio data
            let studioData = [];
            if (studioResponse.data && Array.isArray(studioResponse.data.data)) {
                studioData = studioResponse.data.data;
            } else if (Array.isArray(studioResponse.data)) {
                studioData = studioResponse.data;
            }

            setJadwal(jadwalData);
            setFilms(filmData);
            setStudios(studioData);

            if (jadwalData.length > 0) {
                toast.success(`Berhasil memuat ${jadwalData.length} jadwal`);
            }

        } catch (err) {
            console.error("Gagal mengambil data:", err);
            
            let errorMessage = "Gagal memuat data.";
            
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
            setLoadingData(false);
        }
    };

    // Filter jadwal
    const filteredJadwal = jadwal.filter(item => {
        // Helper function untuk cari data
        const findFilm = films.find(f => f.id_film === item.id_film);
        const findStudio = studios.find(s => s.id_studio === item.id_studio);
        
        const filmTitle = findFilm?.judul?.toLowerCase() || "";
        const studioNumber = findStudio?.nomor_studio?.toString() || "";
        const genre = findFilm?.genre?.toLowerCase() || "";
        
        // Filter by search term
        const matchesSearch = !searchTerm || 
            filmTitle.includes(searchTerm.toLowerCase()) || 
            studioNumber.includes(searchTerm.toLowerCase()) ||
            genre.includes(searchTerm.toLowerCase());
        
        // Filter by film
        const matchesFilm = selectedFilm === "Semua Film" || 
            (findFilm?.id_film?.toString() === selectedFilm);
        
        // Filter by studio
        const matchesStudio = selectedStudio === "Semua Studio" || 
            (findStudio?.id_studio?.toString() === selectedStudio);
        
        // Filter by date
        const matchesDate = !selectedDate || 
            item.tanggal_tayang === selectedDate;
        
        // Filter by status (Coming Soon, Now Showing, Ended)
        const matchesStatus = selectedStatus === "Semua Status" || 
            getJadwalStatus(item) === selectedStatus;
        
        return matchesSearch && matchesFilm && matchesStudio && matchesDate && matchesStatus;
    });

    // Get film title by id
    const getFilmTitle = (idFilm) => {
        const film = films.find(f => f.id_film === idFilm);
        return film?.judul || "Film tidak ditemukan";
    };

    // Get studio number by id
    const getStudioNumber = (idStudio) => {
        const studio = studios.find(s => s.id_studio === idStudio);
        return studio?.nomor_studio || "Studio tidak ditemukan";
    };

    // Get film duration
    const getFilmDuration = (idFilm) => {
        const film = films.find(f => f.id_film === idFilm);
        return film?.durasi_film || 0;
    };

    // Calculate end time
    const calculateEndTime = (startTime, durationMinutes) => {
        if (!startTime || !durationMinutes) return "-";
        
        try {
            const [hours, minutes] = startTime.split(':').map(Number);
            const totalMinutes = hours * 60 + minutes + durationMinutes;
            
            const endHours = Math.floor(totalMinutes / 60) % 24;
            const endMinutes = totalMinutes % 60;
            
            return `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;
        } catch {
            return "-";
        }
    };

    // Get jadwal status
    const getJadwalStatus = (jadwalItem) => {
        if (!jadwalItem.tanggal_tayang) return "Unknown";
        
        const today = new Date().toISOString().split('T')[0];
        const jadwalDate = new Date(jadwalItem.tanggal_tayang).toISOString().split('T')[0];
        
        if (jadwalDate < today) return "Selesai";
        if (jadwalDate > today) return "Coming Soon";
        return "Sedang Tayang";
    };

    // Get status badge color
    const getStatusBadge = (status) => {
        switch(status) {
            case "Sedang Tayang": return "success";
            case "Coming Soon": return "warning";
            case "Selesai": return "secondary";
            default: return "light";
        }
    };

    // Format tanggal Indonesia
    const formatDate = (dateString) => {
        if (!dateString) return "-";
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('id-ID', {
                weekday: 'short',
                day: 'numeric',
                month: 'short',
                year: 'numeric'
            });
        } catch {
            return "-";
        }
    };

    // Get film genre
    const getFilmGenre = (idFilm) => {
        const film = films.find(f => f.id_film === idFilm);
        return film?.genre || "-";
    };

    // Reset all filters
    const resetFilters = () => {
        setSearchTerm("");
        setSelectedFilm("Semua Film");
        setSelectedStudio("Semua Studio");
        setSelectedStatus("Semua Status");
        setSelectedDate("");
    };

    // Get today's date for date input
    const getTodayDate = () => {
        return new Date().toISOString().split('T')[0];
    };

    // ============= MODAL HANDLERS =============

    const handleViewDetails = (jadwalItem) => {
        setSelectedJadwal(jadwalItem);
        setShowDetailModal(true);
    };

    const handleOpenCreateModal = () => {
        if (films.length === 0 || studios.length === 0) {
            toast.error("Harap tunggu data film dan studio dimuat terlebih dahulu");
            return;
        }
        setShowCreateModal(true);
    };

    const handleOpenEditModal = (jadwalItem) => {
        if (films.length === 0 || studios.length === 0) {
            toast.error("Harap tunggu data film dan studio dimuat terlebih dahulu");
            return;
        }
        setJadwalToEdit(jadwalItem);
        setShowEditModal(true);
    };

    const handleOpenDeleteModal = (jadwalItem) => {
        setJadwalToDelete(jadwalItem);
        setShowDeleteModal(true);
    };

    const handleFormSuccess = () => {
        fetchAllData(); // Refresh data
    };

    // Handle Delete - VERSI DIPERBAIKI
    const handleConfirmDelete = async () => {
        if (!jadwalToDelete) return;
        
        setDeleting(true);
        try {
            const token = localStorage.getItem('auth_token');
            const jadwalId = jadwalToDelete.id_jadwal || jadwalToDelete.id;
            
            if (!jadwalId) {
                throw new Error("ID jadwal tidak ditemukan");
            }
            
            const response = await axios.delete(`${API_JADWAL_URL}/${jadwalId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            toast.success(`Jadwal berhasil dihapus`);
            
            // Update state
            setJadwal(prevJadwal => prevJadwal.filter(item => {
                const itemId = item.id_jadwal || item.id;
                return itemId !== jadwalId;
            }));
            
            // Close modal
            setShowDeleteModal(false);
            setJadwalToDelete(null);
            
        } catch (err) {
            console.error("Gagal menghapus jadwal:", err);
            
            let errorMessage = "Gagal menghapus jadwal. ";
            
            if (err.response?.status === 404) {
                errorMessage += "Jadwal tidak ditemukan di server.";
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

    // Redirect if not admin
    if (!isAdmin && user) {
        return (
            <Container className="mt-5">
                <Alert variant="danger" className="text-center">
                    <h4>🚫 Akses Ditolak</h4>
                    <p>Hanya admin yang dapat mengelola jadwal.</p>
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
                    <i className="bi bi-calendar3 me-1"></i> Kelola Jadwal
                </Breadcrumb.Item>
            </Breadcrumb>

            {/* Page Header */}
            <Row className="mb-4">
                <Col>
                    <div className="d-flex justify-content-between align-items-center">
                        <div>
                            <h1 className="fw-bold mb-1">
                                <i className="bi bi-calendar3 me-2"></i>Kelola Jadwal
                            </h1>
                            <p className="text-muted mb-0">
                                Total: <strong>{jadwal.length} jadwal</strong>
                            </p>
                        </div>
                        <Button 
                            variant="primary"
                            onClick={handleOpenCreateModal}
                            className="d-flex align-items-center"
                            disabled={loadingData}
                        >
                            <i className="bi bi-plus-circle me-1"></i>Tambah Jadwal
                        </Button>
                    </div>
                </Col>
            </Row>

            {/* Filter Section */}
            <Card className="mb-4 border-0 shadow-sm">
                <Card.Body className="p-4">
                    <Row className="g-3">
                        <Col md={6} lg={4}>
                            <InputGroup>
                                <InputGroup.Text className="bg-white">
                                    <i className="bi bi-search"></i>
                                </InputGroup.Text>
                                <Form.Control
                                    placeholder="Cari film, studio, atau genre..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="border-start-0"
                                />
                                {searchTerm && (
                                    <Button 
                                        variant="outline-secondary"
                                        onClick={() => setSearchTerm("")}
                                        className="border"
                                    >
                                        <i className="bi bi-x"></i>
                                    </Button>
                                )}
                            </InputGroup>
                        </Col>
                        
                        <Col md={6} lg={2}>
                            <Form.Control
                                type="date"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                min={getTodayDate()}
                                className="w-100"
                            />
                        </Col>
                        
                        <Col md={6} lg={2}>
                            <Dropdown className="w-100">
                                <Dropdown.Toggle variant="outline-secondary" className="w-100 text-start d-flex justify-content-between align-items-center">
                                    {selectedFilm === "Semua Film" ? "Semua Film" : getFilmTitle(selectedFilm)}
                                    <i className="bi bi-chevron-down ms-auto"></i>
                                </Dropdown.Toggle>
                                <Dropdown.Menu className="w-100">
                                    <Dropdown.Item 
                                        active={selectedFilm === "Semua Film"}
                                        onClick={() => setSelectedFilm("Semua Film")}
                                    >
                                        Semua Film
                                    </Dropdown.Item>
                                    <Dropdown.Divider />
                                    {films.map((film) => (
                                        <Dropdown.Item 
                                            key={film.id_film}
                                            active={selectedFilm === film.id_film.toString()}
                                            onClick={() => setSelectedFilm(film.id_film.toString())}
                                        >
                                            {film.judul} ({film.genre})
                                        </Dropdown.Item>
                                    ))}
                                </Dropdown.Menu>
                            </Dropdown>
                        </Col>
                        
                        <Col md={6} lg={2}>
                            <Dropdown className="w-100">
                                <Dropdown.Toggle variant="outline-secondary" className="w-100 text-start d-flex justify-content-between align-items-center">
                                    {selectedStudio === "Semua Studio" ? "Semua Studio" : `Studio ${getStudioNumber(selectedStudio)}`}
                                    <i className="bi bi-chevron-down ms-auto"></i>
                                </Dropdown.Toggle>
                                <Dropdown.Menu className="w-100">
                                    <Dropdown.Item 
                                        active={selectedStudio === "Semua Studio"}
                                        onClick={() => setSelectedStudio("Semua Studio")}
                                    >
                                        Semua Studio
                                    </Dropdown.Item>
                                    <Dropdown.Divider />
                                    {studios.map((studio) => (
                                        <Dropdown.Item 
                                            key={studio.id_studio}
                                            active={selectedStudio === studio.id_studio.toString()}
                                            onClick={() => setSelectedStudio(studio.id_studio.toString())}
                                        >
                                            Studio {studio.nomor_studio} ({studio.kapasitas} kursi)
                                        </Dropdown.Item>
                                    ))}
                                </Dropdown.Menu>
                            </Dropdown>
                        </Col>
                        
                        <Col md={6} lg={2} className="d-flex gap-2">
                            <Button 
                                variant="outline-secondary"
                                onClick={fetchAllData}
                                disabled={loading}
                                className="flex-grow-1"
                            >
                                <i className="bi bi-arrow-clockwise me-1"></i>
                                {loading ? 'Memuat...' : 'Refresh'}
                            </Button>
                            <Button 
                                variant="outline-danger"
                                onClick={resetFilters}
                                className="flex-grow-1"
                                disabled={!searchTerm && selectedFilm === "Semua Film" && selectedStudio === "Semua Studio" && selectedStatus === "Semua Status" && !selectedDate}
                            >
                                <i className="bi bi-x-circle me-1"></i>Reset
                            </Button>
                        </Col>
                    </Row>
                    
                    {/* Status Filter Row */}
                    <Row className="mt-3">
                        <Col md={6} lg={3}>
                            <Dropdown className="w-100">
                                <Dropdown.Toggle variant="outline-secondary" className="w-100 text-start d-flex justify-content-between align-items-center">
                                    {selectedStatus}
                                    <i className="bi bi-chevron-down ms-auto"></i>
                                </Dropdown.Toggle>
                                <Dropdown.Menu className="w-100">
                                    {["Semua Status", "Sedang Tayang", "Coming Soon", "Selesai"].map((status) => (
                                        <Dropdown.Item 
                                            key={status}
                                            active={selectedStatus === status}
                                            onClick={() => setSelectedStatus(status)}
                                        >
                                            {status}
                                        </Dropdown.Item>
                                    ))}
                                </Dropdown.Menu>
                            </Dropdown>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>

            {/* Loading State */}
            {loading && (
                <div className="text-center py-5">
                    <Spinner animation="border" variant="primary" />
                    <p className="mt-3 text-muted">Memuat data jadwal...</p>
                </div>
            )}

            {/* Error State */}
            {error && !loading && (
                <Alert variant="danger" className="text-center">
                    <i className="bi bi-exclamation-triangle-fill me-2"></i>
                    <p>{error}</p>
                    <Button variant="outline-danger" onClick={fetchAllData} size="sm">
                        <i className="bi bi-arrow-clockwise me-1"></i>Coba Lagi
                    </Button>
                </Alert>
            )}

            {/* Empty State */}
            {!loading && !error && filteredJadwal.length === 0 && (
                <Card className="text-center py-5 border-0 shadow-sm">
                    <Card.Body>
                        <i className="bi bi-calendar-x text-muted mb-3" style={{ fontSize: "2.5rem" }}></i>
                        <h5 className="fw-bold mb-2">Tidak ada jadwal ditemukan</h5>
                        <p className="text-muted mb-3">
                            {searchTerm || selectedFilm !== "Semua Film" || selectedStudio !== "Semua Studio" || selectedStatus !== "Semua Status" || selectedDate
                                ? "Tidak ada jadwal yang cocok dengan filter yang dipilih"
                                : "Belum ada jadwal dalam sistem"}
                        </p>
                        <Button 
                            variant="primary"
                            onClick={handleOpenCreateModal}
                            size="sm"
                            disabled={loadingData}
                        >
                            <i className="bi bi-plus-circle me-1"></i>Tambah Jadwal
                        </Button>
                    </Card.Body>
                </Card>
            )}

            {/* Jadwal Table */}
            {!loading && !error && filteredJadwal.length > 0 && (
                <Card className="border-0 shadow-sm">
                    <Card.Body className="p-0">
                        <div className="table-responsive">
                            <Table hover className="mb-0">
                                <thead className="bg-light">
                                    <tr>
                                        <th width="60" className="text-center">ID</th>
                                        <th>Judul Film</th>
                                        <th>Genre</th>
                                        <th>Studio</th>
                                        <th>Tanggal Tayang</th>
                                        <th>Waktu Tayang</th>
                                        <th>Durasi</th>
                                        <th>Status</th>
                                        <th width="120" className="text-center">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredJadwal.map((item, index) => {
                                        const filmTitle = getFilmTitle(item.id_film);
                                        const studioNumber = getStudioNumber(item.id_studio);
                                        const genre = getFilmGenre(item.id_film);
                                        const duration = getFilmDuration(item.id_film);
                                        const endTime = calculateEndTime(item.jam_tayang, duration);
                                        const status = getJadwalStatus(item);
                                        
                                        return (
                                            <tr key={item.id_jadwal || item.id || index}>
                                                <td className="text-center text-muted">
                                                    <strong>{item.id_jadwal || item.id}</strong>
                                                </td>
                                                <td>
                                                    <div className="fw-semibold">
                                                        <i className="bi bi-film me-2 text-primary"></i>
                                                        {filmTitle}
                                                    </div>
                                                </td>
                                                <td>
                                                    <Badge bg="secondary" className="fw-normal">
                                                        {genre}
                                                    </Badge>
                                                </td>
                                                <td>
                                                    <div className="d-flex align-items-center">
                                                        <i className="bi bi-building text-muted me-2"></i>
                                                        <span className="fw-medium">Studio {studioNumber}</span>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="text-muted">
                                                        {formatDate(item.tanggal_tayang)}
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="fw-medium">
                                                        {item.jam_tayang}
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="text-muted">
                                                        {duration}
                                                    </div>
                                                </td>
                                                <td>
                                                    <Badge 
                                                        bg={getStatusBadge(status)} 
                                                        className="fw-normal px-3 py-1"
                                                    >
                                                        {status}
                                                    </Badge>
                                                </td>
                                                <td>
                                                    <div className="d-flex justify-content-center gap-1">
                                                        <Button
                                                            variant="outline-info"
                                                            size="sm"
                                                            onClick={() => handleViewDetails(item)}
                                                            title="Detail Jadwal"
                                                            className="px-3 py-1"
                                                        >
                                                            <i className="bi bi-eye"></i> Detail
                                                        </Button>
                                                        <Button
                                                            variant="outline-primary"
                                                            size="sm"
                                                            onClick={() => handleOpenEditModal(item)}
                                                            title="Edit Jadwal"
                                                            className="px-3 py-1"
                                                        >
                                                            <i className="bi bi-pencil"></i> Edit
                                                        </Button>
                                                        <Button
                                                            variant="outline-danger"
                                                            size="sm"
                                                            onClick={() => handleOpenDeleteModal(item)}
                                                            title="Hapus Jadwal"
                                                            className="px-3 py-1"
                                                        >
                                                            <i className="bi bi-trash"></i> Delete
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </Table>
                        </div>
                    </Card.Body>
                    <Card.Footer className="bg-white border-top py-3">
                        <div className="d-flex justify-content-between align-items-center">
                            <small className="text-muted">
                                Menampilkan <strong>{filteredJadwal.length}</strong> dari <strong>{jadwal.length}</strong> jadwal
                            </small>
                            <small className="text-muted">
                                <Badge bg="success" className="me-2">Sedang Tayang: {filteredJadwal.filter(item => getJadwalStatus(item) === "Sedang Tayang").length}</Badge>
                                <Badge bg="warning" className="me-2">Coming Soon: {filteredJadwal.filter(item => getJadwalStatus(item) === "Coming Soon").length}</Badge>
                                <Badge bg="secondary">Selesai: {filteredJadwal.filter(item => getJadwalStatus(item) === "Selesai").length}</Badge>
                            </small>
                        </div>
                    </Card.Footer>
                </Card>
            )}

            {/* ============= MODALS ============= */}

            {/* Detail Jadwal Modal */}
            <Modal show={showDetailModal} onHide={() => setShowDetailModal(false)} centered size="lg">
                <Modal.Header closeButton className="bg-info text-white py-2">
                    <Modal.Title className="fs-6">
                        <i className="bi bi-calendar3 me-1"></i>Detail Jadwal
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className="py-3">
                    {selectedJadwal && (
                        <Row>
                            <Col md={12}>
                                <div className="mb-3">
                                    <h5 className="fw-bold">
                                        <i className="bi bi-calendar3 me-2 text-primary"></i>
                                        Detail Penayangan
                                    </h5>
                                </div>
                                
                                <div className="row small">
                                    <div className="col-6 mb-3">
                                        <div className="p-3 bg-light rounded">
                                            <p className="mb-1 text-muted small">ID Jadwal</p>
                                            <p className="fw-bold fs-5">
                                                <i className="bi bi-tag me-1"></i>
                                                {selectedJadwal.id_jadwal || selectedJadwal.id}
                                            </p>
                                        </div>
                                    </div>
                                    
                                    <div className="col-6 mb-3">
                                        <div className="p-3 bg-light rounded">
                                            <p className="mb-1 text-muted small">Status</p>
                                            <p className="fw-bold">
                                                <Badge bg={getStatusBadge(getJadwalStatus(selectedJadwal))} className="fs-6">
                                                    {getJadwalStatus(selectedJadwal)}
                                                </Badge>
                                            </p>
                                        </div>
                                    </div>
                                    
                                    <div className="col-12 mb-3">
                                        <div className="p-3 bg-light rounded">
                                            <p className="mb-1 text-muted small">Film</p>
                                            <div className="d-flex align-items-center">
                                                <i className="bi bi-film text-primary fs-4 me-3"></i>
                                                <div>
                                                    <strong className="fs-5">{getFilmTitle(selectedJadwal.id_film)}</strong>
                                                    <div className="text-muted small">
                                                        <i className="bi bi-tag me-1"></i>
                                                        Genre: {getFilmGenre(selectedJadwal.id_film)}
                                                    </div>
                                                    <div className="text-muted small">
                                                        <i className="bi bi-clock me-1"></i>
                                                        Durasi: {getFilmDuration(selectedJadwal.id_film)} menit
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="col-12 mb-3">
                                        <div className="p-3 bg-light rounded">
                                            <p className="mb-1 text-muted small">Studio & Waktu</p>
                                            <div className="d-flex align-items-center justify-content-between">
                                                <div className="d-flex align-items-center">
                                                    <i className="bi bi-building text-primary fs-4 me-3"></i>
                                                    <div>
                                                        <strong className="fs-5">Studio {getStudioNumber(selectedJadwal.id_studio)}</strong>
                                                        <div className="text-muted small">
                                                            <i className="bi bi-people me-1"></i>
                                                            Kapasitas: {studios.find(s => s.id_studio === selectedJadwal.id_studio)?.kapasitas || "-"} kursi
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="text-end">
                                                    <div className="fw-bold fs-5">{formatDate(selectedJadwal.tanggal_tayang)}</div>
                                                    <div className="text-muted">
                                                        <i className="bi bi-clock me-1"></i>
                                                        {selectedJadwal.jam_tayang} - {calculateEndTime(selectedJadwal.jam_tayang, getFilmDuration(selectedJadwal.id_film))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {selectedJadwal.created_at && (
                                        <div className="col-6 mb-2">
                                            <strong>Dibuat:</strong>
                                            <div className="text-muted">
                                                <i className="bi bi-calendar-plus me-1"></i>
                                                {formatDate(selectedJadwal.created_at)}
                                            </div>
                                        </div>
                                    )}
                                    
                                    {selectedJadwal.updated_at && (
                                        <div className="col-6 mb-2">
                                            <strong>Diupdate:</strong>
                                            <div className="text-muted">
                                                <i className="bi bi-calendar-check me-1"></i>
                                                {formatDate(selectedJadwal.updated_at)}
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

            {/* Create Jadwal Modal */}
            <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)} centered size="lg">
                <Modal.Header closeButton className="bg-success text-white py-2">
                    <Modal.Title className="fs-6">
                        <i className="bi bi-plus-circle me-1"></i>Tambah Jadwal Baru
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className="py-3">
                    <FormKelolaJadwal
                        mode="create"
                        films={films}
                        studios={studios}
                        onSuccess={handleFormSuccess}
                        onClose={() => setShowCreateModal(false)}
                    />
                </Modal.Body>
            </Modal>

            {/* Edit Jadwal Modal */}
            <Modal show={showEditModal} onHide={() => setShowEditModal(false)} centered size="lg">
                <Modal.Header closeButton className="bg-warning text-white py-2">
                    <Modal.Title className="fs-6">
                        <i className="bi bi-pencil me-1"></i>Edit Jadwal
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className="py-3">
                    {jadwalToEdit && (
                        <FormKelolaJadwal
                            mode="edit"
                            jadwalData={jadwalToEdit}
                            films={films}
                            studios={studios}
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
                        <i className="bi bi-trash me-1"></i>Hapus Jadwal
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className="py-3">
                    {jadwalToDelete && (
                        <>
                            <Alert variant="danger" className="py-2 mb-2">
                                <i className="bi bi-exclamation-triangle-fill me-1"></i>
                                <small><strong>PERINGATAN:</strong> Aksi ini akan menghapus jadwal dan tiket yang terkait!</small>
                            </Alert>
                            <p className="mb-2">Hapus jadwal ini?</p>
                            <div className="bg-light p-3 rounded">
                                <div className="d-flex align-items-center mb-2">
                                    <i className="bi bi-calendar3 text-primary fs-4 me-2"></i>
                                    <div>
                                        <strong className="fs-5">{getFilmTitle(jadwalToDelete.id_film)}</strong>
                                        <div className="text-muted small">
                                            <i className="bi bi-building me-1"></i>
                                            Studio {getStudioNumber(jadwalToDelete.id_studio)}
                                        </div>
                                    </div>
                                </div>
                                <div className="text-muted small">
                                    <div><i className="bi bi-calendar me-1"></i> {formatDate(jadwalToDelete.tanggal_tayang)}</div>
                                    <div><i className="bi bi-clock me-1"></i> {jadwalToDelete.jam_tayang}</div>
                                    <div className="mt-1">ID: {jadwalToDelete.id_jadwal || jadwalToDelete.id}</div>
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

export default KelolaJadwalPage;