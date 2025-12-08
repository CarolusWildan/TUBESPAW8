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
    
    // Selected film details
    const [selectedFilmDetails, setSelectedFilmDetails] = useState(null);
    
    // Calculate end time
    const [endTime, setEndTime] = useState("");
    
    // Validation errors
    const [errors, setErrors] = useState({});

    // Initialize form data
    useEffect(() => {
        const today = new Date().toISOString().split('T')[0];
        
        if (mode === "edit" && jadwalData) {
            setFormData({
                id_film: jadwalData.id_film || "",
                id_studio: jadwalData.id_studio || "",
                tanggal_tayang: jadwalData.tanggal_tayang ? new Date(jadwalData.tanggal_tayang).toISOString().split('T')[0] : today,
                jam_tayang: jadwalData.jam_tayang || ""
            });
            
            // Set film details
            if (jadwalData.id_film && films.length > 0) {
                const film = films.find(f => f.id_film === jadwalData.id_film);
                if (film) {
                    setSelectedFilmDetails(film);
                    calculateEndTime(jadwalData.jam_tayang, film.durasi);
                }
            }
        } else {
            // Reset form for create mode
            setFormData({
                id_film: "",
                id_studio: "",
                tanggal_tayang: today,
                jam_tayang: ""
            });
            setSelectedFilmDetails(null);
        }
    }, [mode, jadwalData, films]);

    // Update film details when film selection changes
    useEffect(() => {
        if (formData.id_film && films.length > 0) {
            const film = films.find(f => f.id_film.toString() === formData.id_film.toString());
            setSelectedFilmDetails(film || null);
        } else {
            setSelectedFilmDetails(null);
        }
    }, [formData.id_film, films]);

    // Update end time when start time or film duration changes
    useEffect(() => {
        if (formData.jam_tayang && selectedFilmDetails?.durasi) {
            calculateEndTime(formData.jam_tayang, selectedFilmDetails.durasi);
        } else {
            setEndTime("");
        }
    }, [formData.jam_tayang, selectedFilmDetails]);

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
            
            // Format 24 jam (tanpa AM/PM)
            setEndTime(`${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`);
        } catch {
            setEndTime("");
        }
    };

    // Get today's date for date input
    const getTodayDate = () => {
        return new Date().toISOString().split('T')[0];
    };

    // Generate time options (08:00 - 23:45 dengan interval 15 menit)
    const generateTimeOptions = () => {
        const times = [];
        for (let hour = 8; hour <= 23; hour++) {
            for (let minute = 0; minute < 60; minute += 15) {
                if (hour === 23 && minute > 45) break;
                const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
                times.push(timeString);
            }
        }
        return times;
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
            
            console.log("Submitting jadwal data:", submitData);
            
            let response;
            
            if (mode === "create") {
                response = await axios.post("http://localhost:8000/api/jadwal/create", submitData, { headers });
            } else {
                const jadwalId = jadwalData.id_jadwal || jadwalData.id;
                response = await axios.post(`http://localhost:8000/api/jadwal/update/${jadwalId}`, submitData, { headers });
            }
            
            console.log("Response from API:", response.data);
            
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

    // Format date for display
    const formatDisplayDate = (dateString) => {
        if (!dateString) return "";
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('id-ID', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });
        } catch {
            return dateString;
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
            
            {/* Film Selection - DIPERBAIKI LAGI */}
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
                    disabled={loading || films.length === 0}
                >
                    <option value="">-- Pilih Film --</option>
                    {films.length === 0 ? (
                        <option value="" disabled>Memuat film...</option>
                    ) : (
                        films.map((film) => {
                            // Pastikan ada judul film
                            const judulFilm = film.judul || film.title || `Film ID: ${film.id_film}`;
                            const genre = film.genre || "Unknown";
                            const durasi = film.durasi || film.duration || 0;
                            
                            return (
                                <option key={film.id_film} value={film.id_film}>
                                    {judulFilm} ({genre}) - {durasi} menit
                                </option>
                            );
                        })
                    )}
                </Form.Select>
                <Form.Control.Feedback type="invalid">
                    {errors.id_film}
                </Form.Control.Feedback>
                
                {/* Film Details */}
                {selectedFilmDetails && (
                    <div className="mt-2 p-3 bg-light rounded border">
                        <h6 className="fw-bold mb-2">Detail Film</h6>
                        <div className="row small">
                            <div className="col-6">
                                <div className="mb-1">
                                    <span className="text-muted">Judul:</span>
                                    <div className="fw-medium">{selectedFilmDetails.judul}</div>
                                </div>
                            </div>
                            <div className="col-3">
                                <div className="mb-1">
                                    <span className="text-muted">Genre:</span>
                                    <div>{selectedFilmDetails.genre}</div>
                                </div>
                            </div>
                            <div className="col-3">
                                <div className="mb-1">
                                    <span className="text-muted">Durasi:</span>
                                    <div className="fw-medium">{selectedFilmDetails.durasi} menit</div>
                                </div>
                            </div>
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
                    disabled={loading || studios.length === 0}
                >
                    <option value="">-- Pilih Studio --</option>
                    {studios.length === 0 ? (
                        <option value="" disabled>Memuat studio...</option>
                    ) : (
                        studios.map((studio) => (
                            <option key={studio.id_studio} value={studio.id_studio}>
                                Studio {studio.nomor_studio} ({studio.kapasitas} kursi)
                            </option>
                        ))
                    )}
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
                        {formData.tanggal_tayang && (
                            <div className="mt-1 text-muted small">
                                <i className="bi bi-calendar-check me-1"></i>
                                {formatDisplayDate(formData.tanggal_tayang)}
                            </div>
                        )}
                    </Form.Group>
                </Col>
                
                <Col md={6}>
                    <Form.Group>
                        <Form.Label className="fw-semibold">
                            <i className="bi bi-clock me-1 text-primary"></i> Jam Tayang (24 Jam)
                        </Form.Label>
                        <Form.Select
                            name="jam_tayang"
                            value={formData.jam_tayang}
                            onChange={handleInputChange}
                            isInvalid={!!errors.jam_tayang}
                            required
                            disabled={loading}
                        >
                            <option value="">-- Pilih Jam --</option>
                            {generateTimeOptions().map((time) => (
                                <option key={time} value={time}>
                                    {time}
                                </option>
                            ))}
                        </Form.Select>
                        <Form.Control.Feedback type="invalid">
                            {errors.jam_tayang}
                        </Form.Control.Feedback>
                        
                        {/* Time Info */}
                        <div className="mt-2">
                            {formData.jam_tayang && selectedFilmDetails?.durasi && endTime && (
                                <div className="p-2 bg-light rounded small">
                                    <div className="d-flex justify-content-between">
                                        <span className="text-muted">Mulai:</span>
                                        <span className="fw-medium">{formData.jam_tayang}</span>
                                    </div>
                                    <div className="d-flex justify-content-between">
                                        <span className="text-muted">Selesai:</span>
                                        <span className="fw-medium">{endTime}</span>
                                    </div>
                                    <div className="d-flex justify-content-between">
                                        <span className="text-muted">Durasi:</span>
                                        <span>{selectedFilmDetails.durasi} menit</span>
                                    </div>
                                </div>
                            )}
                            <Form.Text className="text-muted d-block mt-1">
                                <i className="bi bi-info-circle me-1"></i>
                                Jam operasional: 08:00 - 23:59
                            </Form.Text>
                        </div>
                    </Form.Group>
                </Col>
            </Row>
            
            {/* Summary Card */}
            {(formData.id_film && formData.id_studio && formData.tanggal_tayang && formData.jam_tayang) && (
                <div className="mb-4 p-3 bg-info bg-opacity-10 rounded border border-info">
                    <h6 className="fw-bold mb-2 text-info">
                        <i className="bi bi-clipboard-check me-1"></i> Ringkasan Jadwal
                    </h6>
                    <div className="row small">
                        <div className="col-6">
                            <div className="mb-2">
                                <span className="text-muted">Film:</span>
                                <div className="fw-medium">{selectedFilmDetails?.judul}</div>
                                <div className="text-muted small">
                                    <i className="bi bi-tag me-1"></i>
                                    {selectedFilmDetails?.genre} • {selectedFilmDetails?.durasi} menit
                                </div>
                            </div>
                            <div className="mb-2">
                                <span className="text-muted">Studio:</span>
                                <div className="fw-medium">
                                    Studio {studios.find(s => s.id_studio.toString() === formData.id_studio.toString())?.nomor_studio}
                                </div>
                                <div className="text-muted small">
                                    <i className="bi bi-people me-1"></i>
                                    {studios.find(s => s.id_studio.toString() === formData.id_studio.toString())?.kapasitas} kursi
                                </div>
                            </div>
                        </div>
                        <div className="col-6">
                            <div className="mb-2">
                                <span className="text-muted">Tanggal:</span>
                                <div className="fw-medium">
                                    <i className="bi bi-calendar3 me-1"></i>
                                    {formatDisplayDate(formData.tanggal_tayang)}
                                </div>
                            </div>
                            <div className="mb-2">
                                <span className="text-muted">Waktu:</span>
                                <div className="fw-medium">
                                    <i className="bi bi-clock me-1"></i>
                                    {formData.jam_tayang} - {endTime}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Debug Info (Hapus di production) */}
            {process.env.NODE_ENV === 'development' && (
                <div className="mb-3 p-2 bg-dark text-white rounded small">
                    <div className="fw-bold mb-1">Debug Info:</div>
                    <div>Selected Film ID: {formData.id_film || "none"}</div>
                    <div>Films Count: {films.length}</div>
                    <div>First Film: {films[0]?.judul || "none"}</div>
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