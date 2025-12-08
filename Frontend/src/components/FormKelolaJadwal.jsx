import { useState, useEffect } from "react";
import { Form, Button, Row, Col, Alert, Spinner, InputGroup } from "react-bootstrap";
import { toast } from "sonner";
import axios from "axios";

const FormKelolaJadwal = ({ mode, jadwalData, films, studios, onSuccess, onClose }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    
    // Form states
    const [formData, setFormData] = useState({
        id_film: "",
        id_studio: "",
        tanggal_tayang: "",
        jam_tayang: ""
    });
    
    // Filtered studios based on selected film's duration
    const [availableStudios, setAvailableStudios] = useState(studios);
    
    // Film duration for end time calculation
    const [selectedFilmDuration, setSelectedFilmDuration] = useState(0);
    
    // Calculate end time
    const [endTime, setEndTime] = useState("");
    
    // Validation errors
    const [errors, setErrors] = useState({});

    // Initialize form data
    useEffect(() => {
        if (mode === "edit" && jadwalData) {
            setFormData({
                id_film: jadwalData.id_film || "",
                id_studio: jadwalData.id_studio || "",
                tanggal_tayang: jadwalData.tanggal_tayang ? new Date(jadwalData.tanggal_tayang).toISOString().split('T')[0] : "",
                jam_tayang: jadwalData.jam_tayang || ""
            });
            
            // Set film duration
            if (jadwalData.id_film) {
                const film = films.find(f => f.id_film === jadwalData.id_film);
                if (film) {
                    setSelectedFilmDuration(film.durasi || 0);
                    calculateEndTime(jadwalData.jam_tayang, film.durasi);
                }
            }
        } else {
            // Reset form for create mode
            const today = new Date().toISOString().split('T')[0];
            setFormData({
                id_film: "",
                id_studio: "",
                tanggal_tayang: today,
                jam_tayang: ""
            });
        }
    }, [mode, jadwalData, films]);

    // Update available studios when film changes
    useEffect(() => {
        if (formData.id_film) {
            const film = films.find(f => f.id_film.toString() === formData.id_film.toString());
            if (film) {
                setSelectedFilmDuration(film.durasi || 0);
                // Filter studios based on film requirements if needed
                setAvailableStudios(studios);
                calculateEndTime(formData.jam_tayang, film.durasi);
            }
        } else {
            setAvailableStudios(studios);
            setSelectedFilmDuration(0);
            setEndTime("");
        }
    }, [formData.id_film, films, studios]);

    // Update end time when start time changes
    useEffect(() => {
        if (formData.jam_tayang && selectedFilmDuration > 0) {
            calculateEndTime(formData.jam_tayang, selectedFilmDuration);
        } else {
            setEndTime("");
        }
    }, [formData.jam_tayang, selectedFilmDuration]);

    // Calculate end time
    const calculateEndTime = (startTime, durationMinutes) => {
        if (!startTime || !durationMinutes) {
            setEndTime("");
            return;
        }
        
        try {
            const [hours, minutes] = startTime.split(':').map(Number);
            const totalMinutes = hours * 60 + minutes + durationMinutes;
            
            const endHours = Math.floor(totalMinutes / 60) % 24;
            const endMinutes = totalMinutes % 60;
            
            setEndTime(`${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`);
        } catch {
            setEndTime("");
        }
    };

    // Get today's date for date input
    const getTodayDate = () => {
        return new Date().toISOString().split('T')[0];
    };

    // Get film title by id
    const getFilmTitle = (idFilm) => {
        const film = films.find(f => f.id_film.toString() === idFilm.toString());
        return film?.judul_film || "Pilih Film";
    };

    // Get studio number by id
    const getStudioNumber = (idStudio) => {
        const studio = studios.find(s => s.id_studio.toString() === idStudio.toString());
        return studio?.nomor_studio || "Pilih Studio";
    };

    // Get film duration by id
    const getFilmDuration = (idFilm) => {
        const film = films.find(f => f.id_film.toString() === idFilm.toString());
        return film?.durasi || 0;
    };

    // Handle form input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        
        // Clear error for this field
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ""
            }));
        }
    };

    // Validate form
    const validateForm = () => {
        const newErrors = {};
        
        if (!formData.id_film) newErrors.id_film = "Pilih film wajib diisi";
        if (!formData.id_studio) newErrors.id_studio = "Pilih studio wajib diisi";
        if (!formData.tanggal_tayang) newErrors.tanggal_tayang = "Tanggal tayang wajib diisi";
        if (!formData.jam_tayang) newErrors.jam_tayang = "Jam tayang wajib diisi";
        
        // Date validation
        if (formData.tanggal_tayang) {
            const selectedDate = new Date(formData.tanggal_tayang);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            if (selectedDate < today) {
                newErrors.tanggal_tayang = "Tanggal tidak boleh di masa lalu";
            }
        }
        
        // Time validation
        if (formData.jam_tayang) {
            const [hours, minutes] = formData.jam_tayang.split(':').map(Number);
            if (hours < 8 || hours > 23) {
                newErrors.jam_tayang = "Jam tayang harus antara 08:00 - 23:59";
            }
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            toast.error("Harap perbaiki kesalahan pada form");
            return;
        }
        
        setLoading(true);
        setError("");
        
        try {
            const token = localStorage.getItem('auth_token');
            const headers = {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            };
            
            // Prepare data
            const submitData = {
                id_film: parseInt(formData.id_film),
                id_studio: parseInt(formData.id_studio),
                tanggal_tayang: formData.tanggal_tayang,
                jam_tayang: formData.jam_tayang
            };
            
            let response;
            
            if (mode === "create") {
                response = await axios.post("http://localhost:8000/api/jadwal/create", submitData, { headers });
            } else {
                const jadwalId = jadwalData.id_jadwal || jadwalData.id;
                response = await axios.post(`http://localhost:8000/api/jadwal/update/${jadwalId}`, submitData, { headers });
            }
            
            if (response.data.status === "success") {
                toast.success(response.data.message || "Jadwal berhasil disimpan");
                onSuccess();
                onClose();
            } else {
                throw new Error(response.data.message || "Gagal menyimpan jadwal");
            }
            
        } catch (err) {
            console.error("Error saving jadwal:", err);
            
            let errorMessage = "Gagal menyimpan jadwal";
            
            if (err.response?.status === 409) {
                errorMessage = "Jadwal bentrok! Studio sudah dipakai pada waktu tersebut.";
            } else if (err.response?.status === 422) {
                const validationErrors = err.response.data.errors;
                if (validationErrors) {
                    const errorMessages = Object.values(validationErrors).flat().join(", ");
                    errorMessage = `Validasi gagal: ${errorMessages}`;
                    setErrors(validationErrors);
                }
            } else if (err.response?.data?.message) {
                errorMessage = err.response.data.message;
            } else if (err.message) {
                errorMessage = err.message;
            }
            
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Form onSubmit={handleSubmit}>
            {error && (
                <Alert variant="danger" className="py-2 mb-3">
                    <i className="bi bi-exclamation-triangle-fill me-1"></i>
                    {error}
                </Alert>
            )}
            
            {/* Film Selection */}
            <Form.Group className="mb-3">
                <Form.Label className="fw-semibold">
                    <i className="bi bi-film me-1 text-primary"></i> Pilih Film
                </Form.Label>
                <Form.Select
                    name="id_film"
                    value={formData.id_film}
                    onChange={handleInputChange}
                    isInvalid={!!errors.id_film}
                    required
                    disabled={loading}
                >
                    <option value="">-- Pilih Film --</option>
                    {films.map((film) => (
                        <option key={film.id_film} value={film.id_film}>
                            {film.judul_film} ({film.genre}) - {film.durasi} menit
                        </option>
                    ))}
                </Form.Select>
                <Form.Control.Feedback type="invalid">
                    {errors.id_film}
                </Form.Control.Feedback>
                {formData.id_film && (
                    <div className="mt-2 p-2 bg-light rounded small">
                        <div className="d-flex justify-content-between">
                            <span className="text-muted">Durasi Film:</span>
                            <span className="fw-medium">{getFilmDuration(formData.id_film)} menit</span>
                        </div>
                    </div>
                )}
            </Form.Group>
            
            {/* Studio Selection */}
            <Form.Group className="mb-3">
                <Form.Label className="fw-semibold">
                    <i className="bi bi-building me-1 text-primary"></i> Pilih Studio
                </Form.Label>
                <Form.Select
                    name="id_studio"
                    value={formData.id_studio}
                    onChange={handleInputChange}
                    isInvalid={!!errors.id_studio}
                    required
                    disabled={loading}
                >
                    <option value="">-- Pilih Studio --</option>
                    {availableStudios.map((studio) => (
                        <option key={studio.id_studio} value={studio.id_studio}>
                            Studio {studio.nomor_studio} ({studio.kapasitas} kursi)
                        </option>
                    ))}
                </Form.Select>
                <Form.Control.Feedback type="invalid">
                    {errors.id_studio}
                </Form.Control.Feedback>
            </Form.Group>
            
            {/* Date and Time */}
            <Row className="mb-3">
                <Col md={6}>
                    <Form.Group>
                        <Form.Label className="fw-semibold">
                            <i className="bi bi-calendar me-1 text-primary"></i> Tanggal Tayang
                        </Form.Label>
                        <Form.Control
                            type="date"
                            name="tanggal_tayang"
                            value={formData.tanggal_tayang}
                            onChange={handleInputChange}
                            isInvalid={!!errors.tanggal_tayang}
                            min={getTodayDate()}
                            required
                            disabled={loading}
                        />
                        <Form.Control.Feedback type="invalid">
                            {errors.tanggal_tayang}
                        </Form.Control.Feedback>
                    </Form.Group>
                </Col>
                
                <Col md={6}>
                    <Form.Group>
                        <Form.Label className="fw-semibold">
                            <i className="bi bi-clock me-1 text-primary"></i> Jam Tayang
                        </Form.Label>
                        <InputGroup>
                            <Form.Control
                                type="time"
                                name="jam_tayang"
                                value={formData.jam_tayang}
                                onChange={handleInputChange}
                                isInvalid={!!errors.jam_tayang}
                                required
                                disabled={loading}
                            />
                            {endTime && (
                                <InputGroup.Text className="bg-light">
                                    <small className="text-muted">
                                        s/d <span className="fw-medium">{endTime}</span>
                                    </small>
                                </InputGroup.Text>
                            )}
                        </InputGroup>
                        <Form.Control.Feedback type="invalid">
                            {errors.jam_tayang}
                        </Form.Control.Feedback>
                        <Form.Text className="text-muted">
                            Jam operasional: 08:00 - 23:59
                        </Form.Text>
                    </Form.Group>
                </Col>
            </Row>
            
            {/* Summary Card */}
            {(formData.id_film && formData.id_studio && formData.jam_tayang) && (
                <div className="mb-4 p-3 bg-light rounded border">
                    <h6 className="fw-bold mb-2">
                        <i className="bi bi-info-circle me-1 text-primary"></i> Ringkasan Jadwal
                    </h6>
                    <div className="row small">
                        <div className="col-6">
                            <div className="mb-2">
                                <span className="text-muted">Film:</span>
                                <div className="fw-medium">{getFilmTitle(formData.id_film)}</div>
                            </div>
                            <div className="mb-2">
                                <span className="text-muted">Studio:</span>
                                <div className="fw-medium">Studio {getStudioNumber(formData.id_studio)}</div>
                            </div>
                        </div>
                        <div className="col-6">
                            <div className="mb-2">
                                <span className="text-muted">Tanggal:</span>
                                <div className="fw-medium">
                                    {new Date(formData.tanggal_tayang).toLocaleDateString('id-ID', {
                                        weekday: 'long',
                                        day: 'numeric',
                                        month: 'long',
                                        year: 'numeric'
                                    })}
                                </div>
                            </div>
                            <div className="mb-2">
                                <span className="text-muted">Waktu:</span>
                                <div className="fw-medium">
                                    {formData.jam_tayang} - {endTime} ({selectedFilmDuration} menit)
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Action Buttons */}
            <div className="d-flex justify-content-end gap-2 pt-3 border-top">
                <Button
                    variant="secondary"
                    onClick={onClose}
                    disabled={loading}
                    size="sm"
                >
                    Batal
                </Button>
                <Button
                    variant={mode === "create" ? "success" : "warning"}
                    type="submit"
                    disabled={loading}
                    size="sm"
                >
                    {loading ? (
                        <>
                            <Spinner size="sm" className="me-1" />
                            Menyimpan...
                        </>
                    ) : (
                        <>
                            <i className={`bi bi-${mode === "create" ? "check-circle" : "pencil"} me-1`}></i>
                            {mode === "create" ? "Simpan Jadwal" : "Update Jadwal"}
                        </>
                    )}
                </Button>
            </div>
        </Form>
    );
};

export default FormKelolaJadwal;