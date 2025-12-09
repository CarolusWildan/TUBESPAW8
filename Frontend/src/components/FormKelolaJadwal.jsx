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
        jam_tayang: "",
        harga: "" // State sudah ada
    });
    
    const [selectedFilmDetails, setSelectedFilmDetails] = useState(null);
    const [endTime, setEndTime] = useState("");
    const [errors, setErrors] = useState({});

    // Initialize form data
    useEffect(() => {
        const today = new Date().toISOString().split('T')[0];
        
        if (mode === "edit" && jadwalData) {
            setFormData({
                id_film: jadwalData.id_film || "",
                id_studio: jadwalData.id_studio || "",
                tanggal_tayang: jadwalData.tanggal_tayang ? new Date(jadwalData.tanggal_tayang).toISOString().split('T')[0] : today,
                jam_tayang: jadwalData.jam_tayang || "",
                harga: jadwalData.harga || ""
            });
            
            if (jadwalData.id_film && films.length > 0) {
                const film = films.find(f => f.id_film === jadwalData.id_film);
                if (film) {
                    setSelectedFilmDetails(film);
                    calculateEndTime(jadwalData.jam_tayang, film.durasi);
                }
            }
        } else {
            setFormData({
                id_film: "",
                id_studio: "",
                tanggal_tayang: today,
                jam_tayang: "",
                harga: ""
            });
            setSelectedFilmDetails(null);
        }
    }, [mode, jadwalData, films]);

    // Update film details
    useEffect(() => {
        if (formData.id_film && films.length > 0) {
            const film = films.find(f => f.id_film.toString() === formData.id_film.toString());
            setSelectedFilmDetails(film || null);
        } else {
            setSelectedFilmDetails(null);
        }
    }, [formData.id_film, films]);

    // Update end time
    useEffect(() => {
        if (formData.jam_tayang && selectedFilmDetails?.durasi) {
            calculateEndTime(formData.jam_tayang, selectedFilmDetails.durasi);
        } else {
            setEndTime("");
        }
    }, [formData.jam_tayang, selectedFilmDetails]);

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

    const getTodayDate = () => {
        return new Date().toISOString().split('T')[0];
    };

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

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ""
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        
        if (!formData.id_film) newErrors.id_film = "Pilih film wajib diisi";
        if (!formData.id_studio) newErrors.id_studio = "Pilih studio wajib diisi";
        if (!formData.tanggal_tayang) newErrors.tanggal_tayang = "Tanggal tayang wajib diisi";
        if (!formData.jam_tayang) newErrors.jam_tayang = "Jam tayang wajib diisi";
        
        // Validasi Harga
        if (!formData.harga) {
            newErrors.harga = "Harga wajib diisi";
        } else if (formData.harga < 0) {
            newErrors.harga = "Harga tidak boleh negatif";
        }
        
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
            
            const submitData = {
                id_film: parseInt(formData.id_film),
                id_studio: parseInt(formData.id_studio),
                tanggal_tayang: formData.tanggal_tayang,
                jam_tayang: formData.jam_tayang,
                harga: parseFloat(formData.harga) // Pastikan harga dikirim sebagai angka
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
            }
            
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

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
                    disabled={loading || films.length === 0}
                >
                    <option value="">-- Pilih Film --</option>
                    {films.map((film) => (
                        <option key={film.id_film} value={film.id_film}>
                            {film.judul} ({film.genre}) - {film.durasi} menit
                        </option>
                    ))}
                </Form.Select>
                <Form.Control.Feedback type="invalid">
                    {errors.id_film}
                </Form.Control.Feedback>
                
                {/* Info Detail Film (Opsional, agar user yakin) */}
                {selectedFilmDetails && (
                    <div className="mt-2 p-2 bg-light border rounded small">
                        <strong>Info:</strong> {selectedFilmDetails.judul} | Durasi: {selectedFilmDetails.durasi} Menit
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
                    {studios.map((studio) => (
                        <option key={studio.id_studio} value={studio.id_studio}>
                            Studio {studio.nomor_studio} ({studio.kapasitas} kursi)
                        </option>
                    ))}
                </Form.Select>
                <Form.Control.Feedback type="invalid">
                    {errors.id_studio}
                </Form.Control.Feedback>
            </Form.Group>
            
            {/* Date, Time, and Price Row - 3 KOLOM */}
            <Row className="mb-3">
                <Col md={4}>
                    <Form.Group>
                        <Form.Label className="fw-semibold">
                            <i className="bi bi-calendar me-1 text-primary"></i> Tanggal
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
                
                <Col md={4}>
                    <Form.Group>
                        <Form.Label className="fw-semibold">
                            <i className="bi bi-clock me-1 text-primary"></i> Jam Mulai
                        </Form.Label>
                        <Form.Select
                            name="jam_tayang"
                            value={formData.jam_tayang}
                            onChange={handleInputChange}
                            isInvalid={!!errors.jam_tayang}
                            required
                            disabled={loading}
                        >
                            <option value="">-- Pilih --</option>
                            {generateTimeOptions().map((time) => (
                                <option key={time} value={time}>{time}</option>
                            ))}
                        </Form.Select>
                        <Form.Control.Feedback type="invalid">
                            {errors.jam_tayang}
                        </Form.Control.Feedback>
                    </Form.Group>
                </Col>

                {/* KOLOM HARGA TIKET (DITAMBAHKAN) */}
                <Col md={4}>
                    <Form.Group>
                        <Form.Label className="fw-semibold">
                            <i className="bi bi-cash-coin me-1 text-primary"></i> Harga
                        </Form.Label>
                        <InputGroup hasValidation>
                            <InputGroup.Text>Rp</InputGroup.Text>
                            <Form.Control
                                type="number"
                                name="harga"
                                value={formData.harga}
                                onChange={handleInputChange}
                                isInvalid={!!errors.harga}
                                placeholder="0"
                                min="0"
                                required
                                disabled={loading}
                            />
                            <Form.Control.Feedback type="invalid">
                                {errors.harga}
                            </Form.Control.Feedback>
                        </InputGroup>
                    </Form.Group>
                </Col>
            </Row>

            {/* Time Info / Preview Selesai */}
            {formData.jam_tayang && selectedFilmDetails?.durasi && endTime && (
                <Alert variant="info" className="py-2 mb-4 small">
                    <i className="bi bi-info-circle me-2"></i>
                    Film akan selesai pukul <strong>{endTime}</strong> (Durasi: {selectedFilmDetails.durasi} menit)
                </Alert>
            )}
            
            {/* Action Buttons */}
            <div className="d-flex justify-content-end gap-2 pt-3 border-top">
                <Button
                    variant="outline-secondary"
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