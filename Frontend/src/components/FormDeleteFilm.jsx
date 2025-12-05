import { Form, Button, Row, Col, Alert, Modal } from "react-bootstrap";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import axios from 'axios';
import { useNavigate } from "react-router-dom";

const FormDeleteFilm = ({ filmId, show, onHide }) => {
    const navigate = useNavigate();
    const [filmData, setFilmData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isDeleting, setIsDeleting] = useState(false);
    const [error, setError] = useState(null);

    const API_BASE = 'http://localhost:8000';
    const API_ALL_FILMS = 'http://localhost:8000/api/films';
    const API_DELETE_FILM = `http://localhost:8000/api/films/delete/${filmId}`;

    useEffect(() => {
        const fetchFilmData = async () => {
            if (!show || !filmId) return;

            console.log("🔍 Mencari film untuk dihapus dengan ID:", filmId);
            setIsLoading(true);
            setError(null);

            try {
                const token = localStorage.getItem('auth_token');
                
                // Ambil SEMUA film
                const response = await axios.get(API_ALL_FILMS, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                
                console.log("✅ Response semua film:", response.data);
                
                // Cari film yang sesuai dengan ID
                let foundFilm = null;
                
                // Handle berbagai format response
                if (response.data && Array.isArray(response.data)) {
                    // Format: [film1, film2, ...]
                    foundFilm = response.data.find(film => 
                        film.id == filmId || 
                        film.id_film == filmId ||
                        film.id === parseInt(filmId)
                    );
                } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
                    // Format: { data: [film1, film2, ...] }
                    foundFilm = response.data.data.find(film => 
                        film.id == filmId || 
                        film.id_film == filmId ||
                        film.id === parseInt(filmId)
                    );
                }
                
                if (!foundFilm) {
                    console.error("❌ Film tidak ditemukan");
                    throw new Error(`Film dengan ID ${filmId} tidak ditemukan`);
                }

                console.log("🎬 Film untuk dihapus ditemukan:", foundFilm);
                setFilmData(foundFilm);
                
            } catch (err) {
                console.error("❌ Gagal mengambil data film:", err);
                
                if (err.response?.status === 404) {
                    setError(`Film dengan ID ${filmId} tidak ditemukan`);
                } else if (err.response?.status === 401) {
                    setError("Sesi telah berakhir. Silakan login kembali");
                    toast.error("Token tidak valid");
                    setTimeout(() => navigate("/login"), 2000);
                } else if (err.message.includes("tidak ditemukan")) {
                    setError(err.message);
                } else {
                    setError("Gagal memuat data film. Periksa koneksi Anda.");
                }
            } finally {
                setIsLoading(false);
            }
        };

        if (show) {
            fetchFilmData();
        }
    }, [show, filmId, API_ALL_FILMS, navigate]);

    const handleDelete = async () => {
        setIsDeleting(true);
        setError(null);

        try {
            console.log("🗑️ Menghapus film dengan ID:", filmId);
            console.log("🔗 Endpoint:", API_DELETE_FILM);
            console.log("📤 Method: DELETE");
            
            const token = localStorage.getItem('auth_token');
            
            const response = await axios.delete(API_DELETE_FILM, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            console.log("✅ Response delete:", response.data);
            
            if (response.data.success || response.status === 200 || response.status === 204) {
                const successMessage = response.data.message || "Film berhasil dihapus!";
                toast.success(successMessage);
                
                onHide();
                setTimeout(() => navigate("/kelola-film"), 1500);
            } else {
                throw new Error(response.data.message || "Gagal menghapus film");
            }

        } catch (err) {
            console.error("❌ Gagal menghapus film:", err);
            
            // Tangani error spesifik untuk method tidak didukung
            if (err.response?.status === 405) {
                // Method Not Allowed - coba dengan POST sebagai fallback
                toast.warning("Mencoba dengan method POST sebagai fallback...");
                await tryDeleteWithPost();
                return;
            }
            
            let errorMessage = "Gagal menghapus film";
            
            if (err.response?.data?.message) {
                errorMessage = err.response.data.message;
            } else if (err.response?.data?.errors) {
                const validationErrors = Object.values(err.response.data.errors).flat();
                errorMessage = validationErrors.join(', ');
            } else if (err.message) {
                errorMessage = err.message;
            }
            
            setError(errorMessage);
            toast.error(errorMessage);
            
        } finally {
            setIsDeleting(false);
        }
    };

    // Fallback function jika DELETE tidak didukung
    const tryDeleteWithPost = async () => {
        try {
            const token = localStorage.getItem('auth_token');
            
            const response = await axios.post(API_DELETE_FILM, {}, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            console.log("✅ Response delete (POST fallback):", response.data);
            
            if (response.data.success || response.status === 200) {
                const successMessage = response.data.message || "Film berhasil dihapus!";
                toast.success(successMessage);
                
                onHide();
                setTimeout(() => navigate("/kelola-film"), 1500);
            }
            
        } catch (postErr) {
            console.error("❌ Gagal dengan POST juga:", postErr);
            setError("Backend hanya menerima method DELETE. Hubungi developer.");
            toast.error("Method tidak didukung oleh server");
        }
    };

    const handleClose = () => {
        if (!isDeleting) {
            onHide();
        }
    };

    return (
        <Modal
            show={show}
            onHide={handleClose}
            backdrop="static"
            keyboard={false}
            centered
            size="md"
        >
            <Modal.Header closeButton={!isDeleting} className="bg-danger text-white">
                <Modal.Title>
                    <i className="bi bi-trash3 me-2"></i>Konfirmasi Hapus Film
                </Modal.Title>
            </Modal.Header>
            
            <Modal.Body className="p-4">
                {isLoading ? (
                    <div className="text-center py-4">
                        <div className="spinner-border text-danger" role="status">
                            <span className="visually-hidden">Memuat data film...</span>
                        </div>
                        <p className="mt-3 text-muted">
                            <i className="bi bi-hourglass-split me-1"></i>
                            Memuat data film...
                        </p>
                    </div>
                ) : error ? (
                    <Alert variant="danger">
                        <Alert.Heading>
                            <i className="bi bi-exclamation-triangle me-2"></i>Error
                        </Alert.Heading>
                        <p className="mb-0">{error}</p>
                        {error.includes("tidak ditemukan") && (
                            <div className="mt-3">
                                <Button 
                                    variant="outline-danger" 
                                    onClick={onHide}
                                    disabled={isDeleting}
                                >
                                    <i className="bi bi-arrow-left me-1"></i>Tutup
                                </Button>
                            </div>
                        )}
                    </Alert>
                ) : filmData ? (
                    <>
                        {/* Warning Alert */}
                        <Alert variant="warning" className="d-flex align-items-center">
                            <i className="bi bi-exclamation-triangle-fill fs-4 me-3"></i>
                            <div>
                                <Alert.Heading>PERHATIAN!</Alert.Heading>
                                <p className="mb-0">
                                    Anda akan menghapus film permanen. Tindakan ini tidak dapat dibatalkan.
                                </p>
                            </div>
                        </Alert>

                        {/* Film Details */}
                        <div className="mb-4">
                            <h5 className="fw-bold mb-3">
                                <i className="bi bi-film me-2"></i>Detail Film yang Akan Dihapus
                            </h5>
                            
                            <Row className="g-3">
                                <Col md={6}>
                                    <div className="p-3 bg-light rounded">
                                        <p className="mb-1 text-muted small">Judul Film</p>
                                        <p className="fw-bold fs-5">{filmData.judul}</p>
                                    </div>
                                </Col>
                                
                                <Col md={6}>
                                    <div className="p-3 bg-light rounded">
                                        <p className="mb-1 text-muted small">Genre</p>
                                        <p className="fw-bold">{filmData.genre}</p>
                                    </div>
                                </Col>
                                
                                <Col md={4}>
                                    <div className="p-3 bg-light rounded">
                                        <p className="mb-1 text-muted small">Durasi</p>
                                        <p className="fw-bold">{filmData.durasi_film}</p>
                                    </div>
                                </Col>
                                
                                <Col md={4}>
                                    <div className="p-3 bg-light rounded">
                                        <p className="mb-1 text-muted small">Status</p>
                                        <span className={`badge ${
                                            filmData.status === 'showing' ? 'bg-success' : 
                                            filmData.status === 'coming soon' ? 'bg-warning' : 'bg-secondary'
                                        } fs-6`}>
                                            {filmData.status === 'showing' ? 'Now Showing' : 
                                             filmData.status === 'coming soon' ? 'Coming Soon' : 'Ended'}
                                        </span>
                                    </div>
                                </Col>
                                
                                <Col md={4}>
                                    <div className="p-3 bg-light rounded">
                                        <p className="mb-1 text-muted small">ID Film</p>
                                        <p className="fw-bold text-danger">{filmId}</p>
                                    </div>
                                </Col>
                                
                                {filmData.start_date && (
                                    <Col md={6}>
                                        <div className="p-3 bg-light rounded">
                                            <p className="mb-1 text-muted small">Tanggal Mulai</p>
                                            <p className="fw-bold">
                                                {new Date(filmData.start_date).toLocaleDateString('id-ID', {
                                                    weekday: 'long',
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric'
                                                })}
                                            </p>
                                        </div>
                                    </Col>
                                )}
                                
                                {filmData.end_date && (
                                    <Col md={6}>
                                        <div className="p-3 bg-light rounded">
                                            <p className="mb-1 text-muted small">Tanggal Selesai</p>
                                            <p className="fw-bold">
                                                {new Date(filmData.end_date).toLocaleDateString('id-ID', {
                                                    weekday: 'long',
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric'
                                                })}
                                            </p>
                                        </div>
                                    </Col>
                                )}
                            </Row>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <Alert variant="danger" className="mb-3">
                                <p className="mb-0">{error}</p>
                            </Alert>
                        )}
                    </>
                ) : null}
            </Modal.Body>
            
            <Modal.Footer className="border-top">
                <Button
                    variant="outline-secondary"
                    onClick={handleClose}
                    disabled={isDeleting}
                    className="px-4"
                >
                    <i className="bi bi-x-circle me-1"></i>Batal
                </Button>
                
                <Button
                    variant="danger"
                    onClick={handleDelete}
                    disabled={isDeleting || isLoading || !filmData}
                    className="px-4"
                >
                    {isDeleting ? (
                        <>
                            <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                            Menghapus...
                        </>
                    ) : (
                        <>
                            <i className="bi bi-trash3 me-1"></i>Hapus Permanen
                        </>
                    )}
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default FormDeleteFilm;