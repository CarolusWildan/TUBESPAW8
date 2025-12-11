import { useState, useEffect } from "react";
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
    judul: "",
    genre: "",
    durasi_film: "",
    start_date: "",
    end_date: "",
    status: "coming soon"
  });

  const [coverFile, setCoverFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const API_CREATE_FILM = 'http://localhost:8000/api/films/create';
  // ID digunakan di URL untuk update
  const API_UPDATE_FILM = filmData ? `http://localhost:8000/api/films/update/${filmData.id_film}` : '';

  useEffect(() => {
    if (mode === 'edit' && filmData) {
      setFormData({
        judul: filmData.judul || "",
        genre: filmData.genre || "",
        durasi_film: filmData.durasi_film || "",
        start_date: filmData.start_date ? new Date(filmData.start_date).toISOString().split('T')[0] : "",
        end_date: filmData.end_date ? new Date(filmData.end_date).toISOString().split('T')[0] : "",
        status: filmData.status || "coming soon"
      });
      // Tampilkan preview gambar lama jika ada
      if (filmData.cover_path) {
        setPreviewUrl(`http://localhost:8000/storage/${filmData.cover_path}`);
      }
    }
  }, [mode, filmData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error("Ukuran file maksimal 2MB");
        return;
      }
      setCoverFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const validateTimeFormat = (timeString) => {
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/;
    return timeRegex.test(timeString);
  };

  const getTodayDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    // Validasi Wajib
    if (!formData.judul || !formData.genre || !formData.durasi_film || !formData.start_date) {
      toast.error("Field wajib harus diisi!");
      setIsSubmitting(false);
      return;
    }

    // Validasi Cover: Hanya wajib saat Create
    if (mode === 'create' && !coverFile) {
      toast.error("Cover film wajib diupload!");
      setIsSubmitting(false);
      return;
    }

    if (!validateTimeFormat(formData.durasi_film)) {
      toast.error("Format durasi film harus HH:MM:SS");
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

    try {
      const token = localStorage.getItem('auth_token');
      const dataToSend = new FormData();

      // Append data teks
      dataToSend.append('judul', formData.judul);
      dataToSend.append('genre', formData.genre);
      dataToSend.append('durasi_film', formData.durasi_film);
      dataToSend.append('start_date', formData.start_date);
      if (formData.end_date) dataToSend.append('end_date', formData.end_date);

      // Append Status
      let statusToSend = formData.status;
      if (mode === 'create') {
        const startDate = new Date(formData.start_date);
        const endDate = formData.end_date ? new Date(formData.end_date) : null;
        const today = new Date();
        if (startDate <= today && (!endDate || today <= endDate)) statusToSend = "showing";
        else if (endDate && today > endDate) statusToSend = "ended";
        else statusToSend = "coming soon";
      }
      dataToSend.append('status', statusToSend);

      // Append File (Hanya jika ada file baru dipilih)
      if (coverFile) {
        dataToSend.append('cover_path', coverFile);
      }

      if (mode === 'edit') {
        dataToSend.append('_method', 'PUT');
      }

      const config = {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      };

      let response;
      if (mode === 'create') {
        response = await axios.post(API_CREATE_FILM, dataToSend, config);
        toast.success("Film berhasil ditambahkan!");
      } else if (mode === 'edit') {
        // Tetap gunakan axios.post secara fisik
        response = await axios.post(API_UPDATE_FILM, dataToSend, config);
        toast.success("Film berhasil diperbarui!");
      }

      if (onSuccess) onSuccess(response?.data);
      setTimeout(() => { if (onClose) onClose(); }, 500);

    } catch (err) {
      console.error(`Gagal ${mode}:`, err);
      let errorMessage = "Terjadi kesalahan.";
      if (err.response) {
        if (err.response.data.errors) {
          errorMessage = Object.values(err.response.data.errors).flat().join('\n');
        } else if (err.response.data.message) {
          errorMessage = err.response.data.message;
        }
      }
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStatusDisplay = () => {
    if (mode !== 'create' || !formData.start_date) return null;
    const startDate = new Date(formData.start_date);
    const endDate = formData.end_date ? new Date(formData.end_date) : null;
    const today = new Date();

    let displayText = "Coming Soon";
    let variant = "warning";

    if (startDate <= today && (!endDate || today <= endDate)) {
      variant = "success";
      displayText = "Now Showing";
    } else if (endDate && today > endDate) {
      variant = "secondary";
      displayText = "Ended";
    }

    return (
      <Row>
        <Col>
          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold">Status Tayang</Form.Label>
            <div><span className={`badge bg-${variant} fs-6 p-2`}>{displayText}</span></div>
          </Form.Group>
        </Col>
      </Row>
    );
  };

  return (
    <Form onSubmit={handleSubmit}>
      {error && (
        <Alert variant="danger" className="mb-3 py-2" style={{ whiteSpace: 'pre-line' }}>
          <small>{error}</small>
        </Alert>
      )}

      <Row>
        <Col md={8}>
          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold">Judul Film *</Form.Label>
            <Form.Control
              type="text"
              name="judul"
              value={formData.judul}
              onChange={handleChange}
              required
              disabled={isSubmitting}
            />
          </Form.Group>
        </Col>

        <Col md={8}>
          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold">
              Cover Film {mode === 'create' ? '*' : '(Opsional)'}
            </Form.Label>
            <Form.Control
              type="file"
              name="cover_path"
              onChange={handleFileChange}
              accept="image/jpg, image/jpeg, image/png"
              required={mode === 'create'}
              disabled={isSubmitting}
            />
            <Form.Text className="text-muted">Format: JPG, JPEG, PNG. Maks 2MB.</Form.Text>

            {/* Preview Gambar */}
            {previewUrl && (
              <div className="mt-2">
                <p className="mb-1 small text-muted">Preview:</p>
                <img src={previewUrl} alt="Preview" style={{ height: '100px', borderRadius: '8px', objectFit: 'cover' }} />
              </div>
            )}
          </Form.Group>
        </Col>

        <Col md={4}>
          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold">Genre *</Form.Label>
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
                required
                disabled={isSubmitting}
              />
            </InputGroup>
          </Form.Group>
        </Col>

        <Col md={4}>
          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold">Tanggal Mulai *</Form.Label>
            <Form.Control
              type="date"
              name="start_date"
              value={formData.start_date}
              onChange={handleChange}
              required
              disabled={isSubmitting}
            />
          </Form.Group>
        </Col>

        <Col md={4}>
          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold">Tanggal Selesai</Form.Label>
            <Form.Control
              type="date"
              name="end_date"
              value={formData.end_date}
              onChange={handleChange}
              disabled={isSubmitting}
            />
          </Form.Group>
        </Col>
      </Row>

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

      {mode === 'create' && renderStatusDisplay()}

      <div className="d-flex gap-3 justify-content-end mt-4">
        <Button variant="outline-secondary" onClick={onClose} disabled={isSubmitting}>Batal</Button>
        <Button type="submit" variant={mode === 'create' ? 'success' : 'warning'} disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status"></span>
              Loading...
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


