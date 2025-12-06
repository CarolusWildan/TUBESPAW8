import { useState, useEffect } from "react";
import { Form, Button, Row, Col, Alert, InputGroup } from "react-bootstrap";
import { toast } from "sonner";
import axios from 'axios';

const FormKelolaStudio = ({ 
  mode = 'create', // 'create' atau 'edit'
  studioData = null,
  onSuccess,
  onClose 
}) => {
  const [formData, setFormData] = useState({
    nomor_studio: "",
    kapasitas: ""
  });
  
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  const API_BASE = 'http://localhost:8000/api';
  const API_CREATE_STUDIO = `${API_BASE}/studio/create`;
  const API_UPDATE_STUDIO = studioData ? `${API_BASE}/studio/update/${studioData.id_studio || studioData.id}` : '';

  // Prefill form data untuk edit mode
  useEffect(() => {
    if (mode === 'edit' && studioData) {
      setFormData({
        nomor_studio: studioData.nomor_studio || "",
        kapasitas: studioData.kapasitas || ""
      });
    }
  }, [mode, studioData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear validation error untuk field ini
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.nomor_studio || formData.nomor_studio < 1) {
      errors.nomor_studio = "Nomor studio harus lebih dari 0";
    }
    
    if (!formData.kapasitas || formData.kapasitas < 1) {
      errors.kapasitas = "Kapasitas harus lebih dari 0";
    } else if (formData.kapasitas > 500) {
      errors.kapasitas = "Kapasitas maksimal 500 kursi";
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    
    if (!validateForm()) {
      toast.error("Periksa kembali form yang diisi");
      return;
    }

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new Error("Token tidak ditemukan. Silakan login ulang.");
      }

      const requestData = {
        nomor_studio: parseInt(formData.nomor_studio),
        kapasitas: parseInt(formData.kapasitas)
      };

      let response;

      if (mode === 'create') {
        response = await axios.post(API_CREATE_STUDIO, requestData, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        toast.success("Studio berhasil ditambahkan!");
        
        // Reset form untuk create mode
        setFormData({
          nomor_studio: "",
          kapasitas: ""
        });
        
      } else if (mode === 'edit' && studioData) {
        response = await axios.post(API_UPDATE_STUDIO, requestData, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        toast.success("Studio berhasil diperbarui!");
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
      console.error(`Gagal ${mode === 'create' ? 'menambah' : 'memperbarui'} studio:`, err);
      
      let errorMessage = `Gagal ${mode === 'create' ? 'menambah' : 'memperbarui'} studio. `;
      
      if (err.response?.status === 422 && err.response.data?.errors) {
        // Validation errors dari server
        const serverErrors = err.response.data.errors;
        Object.keys(serverErrors).forEach(key => {
          setValidationErrors(prev => ({
            ...prev,
            [key]: serverErrors[key][0]
          }));
        });
        errorMessage = "Periksa kembali form yang diisi";
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      toast.error(errorMessage);
      
    } finally {
      setIsSubmitting(false);
    }
  };

  // Fungsi untuk batal
  const handleCancel = () => {
    if (onClose) onClose();
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
        {/* Nomor Studio */}
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold">
              Nomor Studio *
            </Form.Label>
            <InputGroup>
              <InputGroup.Text>
                <i className="bi bi-123"></i>
              </InputGroup.Text>
              <Form.Control
                type="number"
                name="nomor_studio"
                value={formData.nomor_studio}
                onChange={handleChange}
                placeholder="Masukkan nomor studio"
                min="1"
                required
                disabled={isSubmitting}
                isInvalid={!!validationErrors.nomor_studio}
              />
            </InputGroup>
            {validationErrors.nomor_studio && (
              <Form.Control.Feedback type="invalid">
                {validationErrors.nomor_studio}
              </Form.Control.Feedback>
            )}
            <Form.Text className="text-muted">
              Nomor unik untuk identifikasi studio
            </Form.Text>
          </Form.Group>
        </Col>

        {/* Kapasitas */}
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold">
              Kapasitas *
            </Form.Label>
            <InputGroup>
              <InputGroup.Text>
                <i className="bi bi-people-fill"></i>
              </InputGroup.Text>
              <Form.Control
                type="number"
                name="kapasitas"
                value={formData.kapasitas}
                onChange={handleChange}
                placeholder="Jumlah kursi"
                min="1"
                max="500"
                required
                disabled={isSubmitting}
                isInvalid={!!validationErrors.kapasitas}
              />
            </InputGroup>
            {validationErrors.kapasitas && (
              <Form.Control.Feedback type="invalid">
                {validationErrors.kapasitas}
              </Form.Control.Feedback>
            )}
            <Form.Text className="text-muted">
              Jumlah kursi (1-500)
            </Form.Text>
          </Form.Group>
        </Col>
      </Row>

      {/* Info Card */}
      <Alert variant="info" className="py-2 mb-3">
        <div className="d-flex">
          <i className="bi bi-info-circle-fill me-2 mt-1"></i>
          <div>
            <small>
              <strong>Informasi:</strong><br/>
              • Nomor studio harus unik<br/>
              • Kapasitas maksimal 500 kursi per studio<br/>
              • Studio dapat digunakan untuk penjadwalan film
            </small>
          </div>
        </div>
      </Alert>

      {/* Submit Buttons */}
      <div className="d-flex gap-3 justify-content-end mt-4">
        <Button
          variant="outline-secondary"
          onClick={handleCancel}
          disabled={isSubmitting}
          className="px-4"
        >
          Batal
        </Button>
        <Button
          type="submit"
          variant={mode === 'create' ? 'success' : 'warning'}
          disabled={isSubmitting}
          className="px-4"
        >
          {isSubmitting ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status"></span>
              {mode === 'create' ? 'Menyimpan...' : 'Memperbarui...'}
            </>
          ) : (
            <>
              <i className={`bi ${mode === 'create' ? 'bi-plus-circle' : 'bi-check-circle'} me-1`}></i>
              {mode === 'create' ? 'Simpan Studio' : 'Update Studio'}
            </>
          )}
        </Button>
      </div>
    </Form>
  );
};

export default FormKelolaStudio;