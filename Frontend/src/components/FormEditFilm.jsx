import { Form, Button, Row, Col, Alert, InputGroup } from "react-bootstrap";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import axios from 'axios';
import { useNavigate } from "react-router-dom";

const FormEditFilm = ({ filmId }) => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        judul: "",
        genre: "",
        durasi_film: "",
        start_date: "",
        end_date: "",
        status: "coming soon"
    });
    const [error, setError] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [originalFilmData, setOriginalFilmData] = useState(null);

    const API_ALL_FILMS = 'http://localhost:8000/api/films'; 
    const API_UPDATE_FILM = `http://localhost:8000/api/films/update/${filmId}`; 

    useEffect(() => {
        const fetchFilmData = async () => {
            if (!filmId) {
                toast.error("ID Film tidak ditemukan");
                setIsLoading(false);
                return;
            }

            console.log("🔍 Mencari film dengan ID:", filmId);
            console.log("📡 Mengambil semua film dari:", API_ALL_FILMS);

            try {
                const token = localStorage.getItem('auth_token');
                
                const response = await axios.get(API_ALL_FILMS, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                
                console.log("✅ Response semua film:", response.data);
                
                let filmData = null;
                
                if (response.data && Array.isArray(response.data)) {
                    // Format: [film1, film2, ...]
                    filmData = response.data.find(film => 
                        film.id == filmId || 
                        film.id_film == filmId ||
                        film.id === parseInt(filmId)
                    );
                } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
                    // Format: { data: [film1, film2, ...] }
                    filmData = response.data.data.find(film => 
                        film.id == filmId || 
                        film.id_film == filmId ||
                        film.id === parseInt(filmId)
                    );
                }
                
                if (!filmData) {
                    console.error("❌ Film tidak ditemukan dalam data");
                    console.log("Semua film yang ada:", response.data);
                    throw new Error(`Film dengan ID ${filmId} tidak ditemukan`);
                }

                console.log("🎬 Film ditemukan:", filmData);

                setOriginalFilmData(filmData);
                
                const formatDateForInput = (dateString) => {
                    if (!dateString) return "";
                    try {
                        const date = new Date(dateString);
                        return date.toISOString().split('T')[0];
                    } catch {
                        return "";
                    }
                };
                
                setFormData({
                    judul: filmData.judul || "",
                    genre: filmData.genre || "",
                    durasi_film: filmData.durasi_film || "",
                    start_date: formatDateForInput(filmData.start_date),
                    end_date: formatDateForInput(filmData.end_date),
                    status: filmData.status || "coming soon"
                });

                toast.success(`Film "${filmData.judul}" berhasil dimuat`);
                
            } catch (err) {
                console.error("❌ Gagal mengambil data film:", err);
                
                if (err.response?.status === 404) {
                    setError(`Film dengan ID ${filmId} tidak ditemukan`);
                    toast.error(`Film tidak ditemukan`);
                } else if (err.response?.status === 401) {
                    setError("Sesi telah berakhir. Silakan login kembali");
                    toast.error("Token tidak valid");
                    setTimeout(() => navigate("/login"), 2000);
                } else if (err.message.includes("tidak ditemukan")) {
                    setError(err.message);
                    toast.error(err.message);
                } else {
                    setError("Gagal memuat data film. Periksa koneksi Anda.");
                    toast.error("Gagal memuat data film");
                }
            } finally {
                setIsLoading(false);
            }
        };

        fetchFilmData();
    }, [filmId, API_ALL_FILMS, navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const validateTimeFormat = (timeString) => {
        if (!timeString) return false;
        const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/;
        return timeRegex.test(timeString);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        if (!formData.judul || !formData.genre || !formData.durasi_film || !formData.start_date || !formData.status) {
            toast.error("Semua field wajib diisi!");
            setIsSubmitting(false);
            return;
        }

        if (!validateTimeFormat(formData.durasi_film)) {
            toast.error("Format durasi film harus HH:MM:SS (contoh: 02:15:30)");
            setIsSubmitting(false);
            return;
        }

        if (formData.end_date) {
            const startDate = new Date(formData.start_date);
            const endDate = new Date(formData.end_date);
            
            if (endDate < startDate) {
                toast.error("Tanggal selesai tidak boleh sebelum tanggal mulai");
                setIsSubmitting(false);
                return;
            }
        }

        const requestData = {
            judul: formData.judul,
            genre: formData.genre,
            durasi_film: formData.durasi_film,
            start_date: formData.start_date,
            end_date: formData.end_date || null,
            status: formData.status
        };

        try {
            console.log("🔄 Mengupdate film dengan ID:", filmId);
            console.log("📤 Data yang dikirim:", requestData);
            console.log("🔗 Endpoint:", API_UPDATE_FILM);
            
            const token = localStorage.getItem('auth_token');
            
            const response = await axios.post(API_UPDATE_FILM, requestData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            console.log("✅ Response update:", response.data);
            
            if (response.data.success || response.status === 200 || response.status === 201) {
                const successMessage = response.data.message || "Film berhasil diperbarui!";
                toast.success(successMessage);
                
                setTimeout(() => navigate("/kelola-film"), 1500);
            } else {
                throw new Error(response.data.message || "Gagal memperbarui film");
            }

        } catch (err) {
            console.error("❌ Gagal memperbarui film:", err);
            
            let errorMessage = "Gagal memperbarui film";
            
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
            setIsSubmitting(false);
        }
    };

    // Fungsi untuk mendapatkan tanggal minimal (hari ini)
    const getTodayDate = () => {
        return new Date().toISOString().split('T')[0];
    };

    // Fungsi untuk reset form ke data asli
    const handleReset = () => {
        if (originalFilmData) {
            const formatDateForInput = (dateString) => {
                if (!dateString) return "";
                try {
                    const date = new Date(dateString);
                    return date.toISOString().split('T')[0];
                } catch {
                    return "";
                }
            };
            
            setFormData({
                judul: originalFilmData.judul || "",
                genre: originalFilmData.genre || "",
                durasi_film: originalFilmData.durasi_film || "",
                start_date: formatDateForInput(originalFilmData.start_date),
                end_date: formatDateForInput(originalFilmData.end_date),
                status: originalFilmData.status || "coming soon"
            });
            setError(null);
            toast.info("Form telah direset ke data asli");
        }
    };

    // Fungsi untuk batal
    const handleCancel = () => {
        navigate("/kelola-film");
    };

    if (isLoading) {
        return (
            <div className="text-center py-5">
                <div className="spinner-border text-warning" role="status">
                    <span className="visually-hidden">Memuat data film...</span>
                </div>
                <p className="mt-3 text-muted">
                    <i className="bi bi-hourglass-split me-1"></i>
                    Memuat data film ID: <strong>{filmId}</strong>...
                </p>
                <Button 
                    variant="outline-secondary" 
                    size="sm"
                    onClick={handleCancel}
                    className="mt-2"
                >
                    <i className="bi bi-arrow-left me-1"></i>Kembali
                </Button>
            </div>
        );
    }

    if (error && error.includes("tidak ditemukan")) {
        return (
            <Alert variant="danger" className="my-4">
                <Alert.Heading>
                    <i className="bi bi-exclamation-triangle me-2"></i>Film Tidak Ditemukan
                </Alert.Heading>
                <p>
                    Film dengan ID <strong>{filmId}</strong> tidak ditemukan.
                </p>
                <p className="text-muted small">
                    <i className="bi bi-info-circle me-1"></i>
                    Pastikan film dengan ID tersebut ada di database.
                </p>
                <Button 
                    variant="outline-danger" 
                    onClick={handleCancel}
                    className="mt-2"
                >
                    <i className="bi bi-arrow-left me-1"></i>Kembali ke Kelola Film
                </Button>
            </Alert>
        );
    }

    return (
        <Form onSubmit={handleSubmit}>
            {/* Error Message */}
            {error && !error.includes("tidak ditemukan") && (
                <Alert variant="danger" className="mb-4">
                    <Alert.Heading>
                        <i className="bi bi-exclamation-triangle me-2"></i>Error
                    </Alert.Heading>
                    <p className="mb-0">{error}</p>
                </Alert>
            )}

            {/* Form Fields */}
            <Row>
                {/* Judul Film */}
                <Col md={8}>
                    <Form.Group className="mb-3">
                        <Form.Label className="fw-semibold">
                            <i className="bi bi-film me-1"></i>Judul Film *
                        </Form.Label>
                        <Form.Control
                            type="text"
                            name="judul"
                            value={formData.judul}
                            onChange={handleChange}
                            placeholder="Masukkan judul film"
                            className="py-2"
                            required
                            disabled={isSubmitting}
                        />
                    </Form.Group>
                </Col>

                {/* Genre */}
                <Col md={4}>
                    <Form.Group className="mb-3">
                        <Form.Label className="fw-semibold">
                            <i className="bi bi-tags me-1"></i>Genre *
                        </Form.Label>
                        <Form.Select
                            name="genre"
                            value={formData.genre}
                            onChange={handleChange}
                            className="py-2"
                            required
                            disabled={isSubmitting}
                        >
                            <option value="">Pilih Genre</option>
                            <option value="Action">Action</option>
                            <option value="Adventure">Adventure</option>
                            <option value="Comedy">Comedy</option>
                            <option value="Drama">Drama</option>
                            <option value="Fantasy">Fantasy</option>
                            <option value="Horror">Horror</option>
                            <option value="Romance">Romance</option>
                            <option value="Sci-Fi">Sci-Fi</option>
                            <option value="Thriller">Thriller</option>
                            <option value="Animation">Animation</option>
                            <option value="Documenter">Documenter</option>
                        </Form.Select>
                    </Form.Group>
                </Col>
            </Row>

            <Row>
                {/* Durasi Film */}
                <Col md={4}>
                    <Form.Group className="mb-3">
                        <Form.Label className="fw-semibold">
                            <i className="bi bi-clock me-1"></i>Durasi Film *
                        </Form.Label>
                        <InputGroup>
                            <Form.Control
                                type="text"
                                name="durasi_film"
                                value={formData.durasi_film}
                                onChange={handleChange}
                                placeholder="HH:MM:SS"
                                className="py-2"
                                required
                                disabled={isSubmitting}
                            />
                        </InputGroup>
                        <Form.Text className="text-muted">
                            Format: <strong>HH:MM:SS</strong> (Contoh: 01:20:30)
                        </Form.Text>
                    </Form.Group>
                </Col>

                {/* Start Date */}
                <Col md={4}>
                    <Form.Group className="mb-3">
                        <Form.Label className="fw-semibold">
                            <i className="bi bi-calendar-plus me-1"></i>Tanggal Mulai *
                        </Form.Label>
                        <Form.Control
                            type="date"
                            name="start_date"
                            value={formData.start_date}
                            onChange={handleChange}
                            min={getTodayDate()}
                            className="py-2"
                            required
                            disabled={isSubmitting}
                        />
                    </Form.Group>
                </Col>

                {/* End Date */}
                <Col md={4}>
                    <Form.Group className="mb-3">
                        <Form.Label className="fw-semibold">
                            <i className="bi bi-calendar-check me-1"></i>Tanggal Selesai
                        </Form.Label>
                        <Form.Control
                            type="date"
                            name="end_date"
                            value={formData.end_date}
                            onChange={handleChange}
                            min={formData.start_date || getTodayDate()}
                            className="py-2"
                            disabled={isSubmitting}
                        />
                        <Form.Text className="text-muted">
                            Opsional. Kosongkan jika tanpa batas waktu.
                        </Form.Text>
                    </Form.Group>
                </Col>
            </Row>

            {/* Status */}
            <Row>
                <Col md={4}>
                    <Form.Group className="mb-3">
                        <Form.Label className="fw-semibold">
                            <i className="bi bi-eye me-1"></i>Status *
                        </Form.Label>
                        <Form.Select
                            name="status"
                            value={formData.status}
                            onChange={handleChange}
                            className="py-2"
                            required
                            disabled={isSubmitting}
                        >
                            <option value="coming soon">Coming Soon</option>
                            <option value="showing">Now Showing</option>
                        </Form.Select>
                        <Form.Text className="text-muted">
                            Status penayangan film
                        </Form.Text>
                    </Form.Group>
                </Col>
            </Row>

            {/* Action Buttons */}
            <div className="d-flex gap-3 justify-content-between mt-4 pt-3 border-top">
                <div>
                    <Button
                        variant="outline-secondary"
                        onClick={handleReset}
                        disabled={isSubmitting}
                        className="py-2 px-3"
                    >
                        <i className="bi bi-arrow-counterclockwise me-1"></i>Reset
                    </Button>
                </div>
                
                <div className="d-flex gap-3">
                    <Button
                        variant="outline-secondary"
                        onClick={handleCancel}
                        disabled={isSubmitting}
                        className="py-2 px-4"
                    >
                        <i className="bi bi-x-circle me-1"></i>Batal
                    </Button>
                    <Button
                        type="submit"
                        variant="warning"
                        disabled={isSubmitting}
                        className="py-2 px-4 fw-bold text-white"
                    >
                        {isSubmitting ? (
                            <>
                                <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                Memperbarui...
                            </>
                        ) : (
                            <>
                                <i className="bi bi-check-circle me-1"></i>Update Film
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </Form>
    );
};

export default FormEditFilm;