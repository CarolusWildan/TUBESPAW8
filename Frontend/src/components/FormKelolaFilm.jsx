import { useState } from "react";
import { Form, Button, Row, Col, Alert, InputGroup } from "react-bootstrap";
import { toast } from "sonner";
import axios from 'axios';

const FormKelolaFilm = ({ 
  mode = 'create', 
  filmData = null,
  onSuccess,
  onClose 
}) => {
  const [formData, setFormData] = useState({
    judul: filmData?.judul || "",
    genre: filmData?.genre || "",
    durasi_film: filmData?.durasi_film || "",
    start_date: filmData?.start_date ? new Date(filmData.start_date).toISOString().split('T')[0] : "",
    end_date: filmData?.end_date ? new Date(filmData.end_date).toISOString().split('T')[0] : "",
    status: filmData?.status || "coming soon"
  });
  
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const API_CREATE_FILM = 'http://localhost:8000/api/films/create';
  const API_UPDATE_FILM = filmData ? `http://localhost:8000/api/films/update/${filmData.id_film}` : '';

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
    if (!formData.judul || !formData.genre || !formData.durasi_film || !formData.start_date) {
      toast.error("Field wajib harus diisi!");
      setIsSubmitting(false);
      return;
    }

    // Validasi format durasi film
    if (!validateTimeFormat(formData.durasi_film)) {
      toast.error("Format durasi film harus HH:MM:SS (contoh: 02:15:30)");
      setIsSubmitting(false);
      return;
    }

    // Validasi tanggal untuk create mode
    if (mode === 'create' && formData.end_date) {
      const startDate = new Date(formData.start_date);
      const endDate = new Date(formData.end_date);
      
      if (endDate < startDate) {
        toast.error("Tanggal selesai tidak boleh sebelum tanggal mulai");
        setIsSubmitting(false);
        return;
      }
    }

    // Validasi tanggal untuk edit mode
    if (mode === 'edit' && formData.end_date && formData.start_date) {
      const startDate = new Date(formData.start_date);
      const endDate = new Date(formData.end_date);
      
      if (endDate < startDate) {
        toast.error("Tanggal selesai tidak boleh sebelum tanggal mulai");
        setIsSubmitting(false);
        return;
      }
    }

    try {
      const token = localStorage.getItem('auth_token');
      let response;

      if (mode === 'create') {
        // Auto-set status untuk create
        const startDate = new Date(formData.start_date);
        const endDate = formData.end_date ? new Date(formData.end_date) : null;
        const today = new Date();
        
        let autoStatus = "coming soon";
        if (startDate <= today && (!endDate || today <= endDate)) {
          autoStatus = "showing";
        } else if (endDate && today > endDate) {
          autoStatus = "ended";
        }

        const finalData = {
          ...formData,
          status: autoStatus
        };

        response = await axios.post(API_CREATE_FILM, finalData, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        toast.success("Film berhasil ditambahkan!");
      } else if (mode === 'edit' && filmData) {
        const requestData = {
          judul: formData.judul,
          genre: formData.genre,
          durasi_film: formData.durasi_film,
          start_date: formData.start_date,
          end_date: formData.end_date || null,
          status: formData.status
        };

        response = await axios.post(API_UPDATE_FILM, requestData, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        toast.success("Film berhasil diperbarui!");
      }

      // Reset form untuk create mode
      if (mode === 'create') {
        setFormData({
          judul: "",
          genre: "",
          durasi_film: "",
          start_date: "",
          end_date: "",
          status: "coming soon"
        });
      }

      // Panggil callback sukses
      if (onSuccess) {
        onSuccess(response?.data);
      }

      // Tutup modal setelah 500ms
      setTimeout(() => {
        if (onClose) onClose();
      }, 500);

    } catch (err) {
      console.error(`Gagal ${mode === 'create' ? 'menambah' : 'memperbarui'} film:`, err);
      
      let errorMessage = `Gagal ${mode === 'create' ? 'menambah' : 'memperbarui'} film.`;
      
      if (err.response && err.response.data.errors) {
        const validationErrors = Object.values(err.response.data.errors).flat();
        errorMessage = validationErrors.join(' ');
      } else if (err.response && err.response.data.message) {
        errorMessage = err.response.data.message;
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

  // Render status display untuk create mode
  const renderStatusDisplay = () => {
    if (mode !== 'create' || !formData.start_date) return null;

    const startDate = new Date(formData.start_date);
    const endDate = formData.end_date ? new Date(formData.end_date) : null;
    const today = new Date();
    
    let status = "coming soon";
    let variant = "warning";
    let displayText = "Coming Soon";
    
    if (startDate <= today && (!endDate || today <= endDate)) {
      status = "showing";
      variant = "success";
      displayText = "Now Showing";
    } else if (endDate && today > endDate) {
      status = "ended";
      variant = "secondary";
      displayText = "Ended";
    }
    
    return (
      <Row>
        <Col>
          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold">Status Tayang</Form.Label>
            <div>
              <span className={`badge bg-${variant} fs-6 p-2`}>
                {displayText}
              </span>
            </div>
            <Form.Text className="text-muted">
              Status otomatis berdasarkan tanggal tayang
            </Form.Text>
          </Form.Group>
        </Col>
      </Row>
    );
  };

  return (
    <Form onSubmit={handleSubmit}>
      {/* Error Message */}
      {error && (
        <Alert variant="danger" className="mb-3 py-2">
          <small>{error}</small>
        </Alert>
      )}

      <Row>
        {/* Judul Film */}
        <Col md={8}>
          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold">
              Judul Film *
            </Form.Label>
            <Form.Control
              type="text"
              name="judul"
              value={formData.judul}
              onChange={handleChange}
              placeholder="Masukkan judul film"
              required
              disabled={isSubmitting}
            />
          </Form.Group>
        </Col>

        {/* Genre */}
        <Col md={4}>
          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold">
              Genre *
            </Form.Label>
            <Form.Select
              name="genre"
              value={formData.genre}
              onChange={handleChange}
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
              Durasi Film *
            </Form.Label>
            <InputGroup>
              <Form.Control
                type="text"
                name="durasi_film"
                value={formData.durasi_film}
                onChange={handleChange}
                placeholder="HH:MM:SS"
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
              Tanggal Mulai *
            </Form.Label>
            <Form.Control
              type="date"
              name="start_date"
              value={formData.start_date}
              onChange={handleChange}
              min={getTodayDate()}
              required
              disabled={isSubmitting}
            />
          </Form.Group>
        </Col>

        {/* End Date */}
        <Col md={4}>
          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold">
              Tanggal Selesai {mode === 'create' ? '*' : ''}
            </Form.Label>
            <Form.Control
              type="date"
              name="end_date"
              value={formData.end_date}
              onChange={handleChange}
              min={formData.start_date || getTodayDate()}
              required={mode === 'create'}
              disabled={isSubmitting}
            />
            {mode === 'edit' && (
              <Form.Text className="text-muted">
                Opsional. Kosongkan jika tanpa batas waktu.
              </Form.Text>
            )}
          </Form.Group>
        </Col>
      </Row>

      {/* Status Select untuk Edit Mode */}
      {mode === 'edit' && (
        <Row>
          <Col md={4}>
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold">Status *</Form.Label>
              <Form.Select
                name="status"
                value={formData.status}
                onChange={handleChange}
                required
                disabled={isSubmitting}
              >
                <option value="coming soon">Coming Soon</option>
                <option value="showing">Now Showing</option>
                <option value="ended">Ended</option>
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>
      )}

      {/* Status Display untuk Create Mode */}
      {mode === 'create' && renderStatusDisplay()}

      {/* Contoh Format Durasi untuk Create Mode */}
      {mode === 'create' && !formData.durasi_film && (
        <Row>
          <Col>
            <Alert variant="info" className="py-2 mb-3">
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

      {/* Submit Buttons */}
      <div className="d-flex gap-3 justify-content-end mt-4">
        <Button
          variant="outline-secondary"
          onClick={onClose}
          disabled={isSubmitting}
        >
          Batal
        </Button>
        <Button
          type="submit"
          variant={mode === 'create' ? 'success' : 'warning'}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status"></span>
              {mode === 'create' ? 'Menyimpan...' : 'Memperbarui...'}
            </>
          ) : (
            `${mode === 'create' ? 'Simpan' : 'Update'} Film`
          )}
        </Button>
      </div>
    </Form>
  );
};

export default FormKelolaFilm;