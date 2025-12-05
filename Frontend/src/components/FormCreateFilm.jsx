import { Form, Button, Row, Col, Alert, InputGroup } from "react-bootstrap";
import { useState } from "react";
import { toast } from "sonner";
import axios from 'axios';
import { useNavigate } from "react-router-dom"; 

const FormCreateFilm = () => {
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

    const API_FILM_URL = 'http://localhost:8000/api/films/create';

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Validasi format time HH:MM:SS
    const validateTimeFormat = (timeString) => {
        const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/;
        return timeRegex.test(timeString);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        // Validasi form wajib
        if (!formData.judul || !formData.genre || !formData.durasi_film || !formData.start_date || !formData.end_date) {
            toast.error("Semua field wajib diisi!");
            setIsSubmitting(false);
            return;
        }

        // Validasi format durasi film (HH:MM:SS)
        if (!validateTimeFormat(formData.durasi_film)) {
            toast.error("Format durasi film harus HH:MM:SS (contoh: 02:15:30)");
            setIsSubmitting(false);
            return;
        }

        // Validasi tanggal
        const startDate = new Date(formData.start_date);
        const endDate = new Date(formData.end_date);
        
        if (endDate < startDate) {
            toast.error("Tanggal selesai tidak boleh sebelum tanggal mulai");
            setIsSubmitting(false);
            return;
        }

        // 👇 AUTO-SET STATUS SESUAI DATABASE
        const today = new Date();
        let autoStatus = "coming soon";

        if (startDate <= today && today <= endDate) {
            autoStatus = "showing";
        } else if (today > endDate) {
            autoStatus = "coming soon";
        }

        const finalData = {
            ...formData,
            status: autoStatus
        };

        try {
            // Kirim request ke API
            const token = localStorage.getItem('auth_token');
            const response = await axios.post(API_FILM_URL, finalData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            toast.success("Film berhasil ditambahkan!");
            
            // Reset form setelah berhasil
            setFormData({
                judul: "",
                genre: "",
                durasi_film: "",
                start_date: "",
                end_date: "",
                status: "coming soon"
            });

            // TAMBAHKAN: Redirect ke kelola-film setelah 1.5 detik
            setTimeout(() => {
                navigate("/kelola-film");
            }, 1500);

        } catch (err) {
            console.error("Gagal menambah film:", err);
            
            if (err.response && err.response.data.errors) {
                const validationErrors = Object.values(err.response.data.errors).flat();
                setError(validationErrors.join(' '));
                toast.error(validationErrors.join(', '));
            } else if (err.response && err.response.data.message) {
                setError(err.response.data.message);
                toast.error(err.response.data.message);
            } else {
                setError("Terjadi kesalahan saat menambah film.");
                toast.error("Terjadi kesalahan saat menambah film.");
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    // Fungsi untuk mendapatkan tanggal minimal (hari ini)
    const getTodayDate = () => {
        return new Date().toISOString().split('T')[0];
    };

    // Fungsi untuk batal
    const handleCancel = () => {
        navigate("/kelola-film");
    };

    return (
        <Form onSubmit={handleSubmit}>
            {/* Error Message */}
            {error && (
                <Alert variant="danger" className="mb-4">
                    {error}
                </Alert>
            )}

            <Row>
                {/* Judul Film */}
                <Col md={8}>
                    <Form.Group className="mb-3">
                        <Form.Label className="fw-semibold">Judul Film *</Form.Label>
                        <Form.Control
                            type="text"
                            name="judul"
                            value={formData.judul}
                            onChange={handleChange}
                            placeholder="Masukkan judul film"
                            style={{
                                padding: "12px 16px",
                                borderRadius: "8px",
                                border: "1.5px solid #d1d5db"
                            }}
                            required
                            disabled={isSubmitting}
                        />
                    </Form.Group>
                </Col>

                {/* Genre */}
                <Col md={4}>
                    <Form.Group className="mb-3">
                        <Form.Label className="fw-semibold">Genre *</Form.Label>
                        <Form.Select
                            name="genre"
                            value={formData.genre}
                            onChange={handleChange}
                            style={{
                                padding: "12px 16px",
                                borderRadius: "8px",
                                border: "1.5px solid #d1d5db"
                            }}
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
                {/* Durasi Film - Manual Input */}
                <Col md={4}>
                    <Form.Group className="mb-3">
                        <Form.Label className="fw-semibold">Durasi Film *</Form.Label>
                        <InputGroup>
                            <Form.Control
                                type="text"
                                name="durasi_film"
                                value={formData.durasi_film}
                                onChange={handleChange}
                                placeholder="HH:MM:SS"
                                style={{
                                    padding: "12px 16px",
                                    borderRadius: "8px",
                                    border: "1.5px solid #d1d5db"
                                }}
                                required
                                disabled={isSubmitting}
                            />
                        </InputGroup>
                        <Form.Text className="text-muted">
                            Format: <strong>HH:MM:SS</strong> (Contoh: 01:20:30 untuk 1 jam 20 menit 30 detik)
                        </Form.Text>
                    </Form.Group>
                </Col>

                {/* Start Date */}
                <Col md={4}>
                    <Form.Group className="mb-3">
                        <Form.Label className="fw-semibold">Tanggal Mulai Tayang *</Form.Label>
                        <Form.Control
                            type="date"
                            name="start_date"
                            value={formData.start_date}
                            onChange={handleChange}
                            min={getTodayDate()}
                            style={{
                                padding: "12px 16px",
                                borderRadius: "8px",
                                border: "1.5px solid #d1d5db"
                            }}
                            required
                            disabled={isSubmitting}
                        />
                    </Form.Group>
                </Col>

                {/* End Date */}
                <Col md={4}>
                    <Form.Group className="mb-3">
                        <Form.Label className="fw-semibold">Tanggal Selesai Tayang *</Form.Label>
                        <Form.Control
                            type="date"
                            name="end_date"
                            value={formData.end_date}
                            onChange={handleChange}
                            min={formData.start_date || getTodayDate()}
                            style={{
                                padding: "12px 16px",
                                borderRadius: "8px",
                                border: "1.5px solid #d1d5db"
                            }}
                            required
                            disabled={isSubmitting}
                        />
                    </Form.Group>
                </Col>
            </Row>

            {/* Contoh Format Durasi */}
            {!formData.durasi_film && (
                <Row>
                    <Col>
                        <Alert variant="info" className="py-2">
                            <small>
                                <strong>Contoh format durasi:</strong><br/>
                                • 01:30:00 = 1 jam 30 menit<br/>
                                • 02:15:30 = 2 jam 15 menit 30 detik<br/>
                                • 00:45:00 = 45 menit
                            </small>
                        </Alert>
                    </Col>
                </Row>
            )}

            {/* Status Display */}
            {formData.start_date && formData.end_date && (
                <Row>
                    <Col>
                        <Form.Group className="mb-3">
                            <Form.Label className="fw-semibold">Status Tayang</Form.Label>
                            <div>
                                {(() => {
                                    const startDate = new Date(formData.start_date);
                                    const endDate = new Date(formData.end_date);
                                    const today = new Date();
                                    
                                    let status = "coming soon";
                                    let variant = "warning";
                                    let displayText = "Coming Soon";
                                    
                                    if (startDate <= today && today <= endDate) {
                                        status = "showing";
                                        variant = "success";
                                        displayText = "Now Showing";
                                    } else if (today > endDate) {
                                        status = "coming soon";
                                        variant = "secondary";
                                        displayText = "Coming Soon";
                                    }
                                    
                                    return (
                                        <span className={`badge bg-${variant} fs-6 p-2`}>
                                            {displayText}
                                        </span>
                                    );
                                })()}
                            </div>
                            <Form.Text className="text-muted">
                                Status otomatis berdasarkan tanggal tayang
                            </Form.Text>
                        </Form.Group>
                    </Col>
                </Row>
            )}

            {/* Submit Buttons */}
            <div className="d-flex gap-3 justify-content-end mt-4">
                <Button
                    variant="outline-secondary"
                    onClick={handleCancel} // UBAH MENJADI handleCancel
                    disabled={isSubmitting}
                    style={{
                        padding: "12px 24px",
                        borderRadius: "8px",
                        fontWeight: "600"
                    }}
                >
                    Batal
                </Button>
                <Button
                    type="submit"
                    disabled={isSubmitting}
                    style={{
                        background: "linear-gradient(135deg, #2563eb, #7c3aed)",
                        border: "none",
                        padding: "12px 24px",
                        borderRadius: "8px",
                        fontWeight: "600"
                    }}
                >
                    {isSubmitting ? (
                        <>
                            <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                            Menyimpan...
                        </>
                    ) : (
                        "🎬 Simpan Film"
                    )}
                </Button>
            </div>
        </Form>
    );
};

export default FormCreateFilm;