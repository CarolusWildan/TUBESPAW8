import { Form, Button } from "react-bootstrap";
import { useNavigate, Link } from "react-router-dom";
import { useState } from "react";
import { toast } from "sonner";
import axios from 'axios';

const FormRegister = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        nama: "",
        email: "", 
        password: "",
        role: "user"
    });
    const [error, setError] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const API_REGISTER_URL = 'http://localhost:8000/api/register';

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        // Validasi field
        if (!formData.nama || !formData.email || !formData.password) {
            toast.error("Semua field wajib diisi!");
            setIsSubmitting(false);
            return;
        }

        // Validasi format email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            toast.error("Format email tidak valid!");
            setIsSubmitting(false);
            return;
        }

        // Validasi panjang password
        if (formData.password.length < 8) {
            toast.error("Password harus minimal 8 karakter!");
            setIsSubmitting(false);
            return;
        }

        try {
            console.log("📤 Data yang dikirim ke backend:", formData);
            console.log("🔗 Endpoint:", API_REGISTER_URL);
            
            const response = await axios.post(API_REGISTER_URL, formData);
            
            console.log("✅ Response dari API:", response.data);
            console.log("📊 Status Code:", response.status);

            toast.success("Registrasi Berhasil! Silakan Login.");
            
            setTimeout(() => {
                navigate('/login');
            }, 1500);

        } catch (err) {
            console.error("❌ Registrasi Gagal:", err);
            
            // Debug lebih detail
            if (err.response) {
                console.error("📊 Status Error:", err.response.status);
                console.error("📝 Error Data:", err.response.data);
                console.error("📋 Error Headers:", err.response.headers);
                
                if (err.response.data?.errors) {
                    const validationErrors = Object.values(err.response.data.errors).flat();
                    setError(validationErrors.join(' '));
                    toast.error(validationErrors.join(', '));
                } else if (err.response.data?.message) {
                    setError(err.response.data.message);
                    toast.error(err.response.data.message);
                }
            } else if (err.request) {
                console.error("🚫 Tidak ada response:", err.request);
                setError("Tidak ada respon dari server. Cek koneksi internet atau backend.");
                toast.error("Server tidak merespon. Cek apakah backend berjalan.");
            } else {
                console.error("⚠️ Error lain:", err.message);
                setError("Terjadi kesalahan saat registrasi.");
                toast.error("Terjadi kesalahan saat registrasi.");
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Form onSubmit={handleSubmit}>
            {/* Nama Field */}
            <Form.Group className="mb-3">
                <Form.Label className="fw-medium">Nama Lengkap</Form.Label>
                <Form.Control
                    type="text"
                    name="nama"
                    value={formData.nama}
                    onChange={handleChange}
                    placeholder="Masukkan nama lengkap kamu"
                    style={{
                        padding: "12px 16px",
                        borderRadius: "8px",
                        border: "1.5px solid #d1d5db"
                    }}
                    required
                    disabled={isSubmitting}
                />
            </Form.Group>

            {/* Email Field */}
            <Form.Group className="mb-3">
                <Form.Label className="fw-medium">Email</Form.Label>
                <Form.Control
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Contoh: user@email.com"
                    style={{
                        padding: "12px 16px",
                        borderRadius: "8px",
                        border: "1.5px solid #d1d5db"
                    }}
                    required
                    disabled={isSubmitting}
                />
            </Form.Group>

            {/* Password Field */}
            <Form.Group className="mb-3">
                <Form.Label className="fw-medium">Password</Form.Label>
                <Form.Control
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Minimal 8 karakter"
                    style={{
                        padding: "12px 16px",
                        borderRadius: "8px",
                        border: "1.5px solid #d1d5db"
                    }}
                    required
                    disabled={isSubmitting}
                />
            </Form.Group>

            {/* Role Field */}
            <Form.Group className="mb-4">
                <Form.Label className="fw-medium">Role</Form.Label>
                <Form.Select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    style={{
                        padding: "12px 16px",
                        borderRadius: "8px",
                        border: "1.5px solid #d1d5db"
                    }}
                    disabled={isSubmitting}
                >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                </Form.Select>
                <Form.Text className="text-muted">
                    Pilih role sesuai kebutuhan kamu
                </Form.Text>
            </Form.Group>

            {/* Error Message */}
            {error && (
                <div className="alert alert-danger" role="alert">
                    {error}
                </div>
            )}

            {/* Register Button */}
            <Button
                type="submit"
                className="w-100 py-3 fw-bold mb-3"
                style={{
                    background: "linear-gradient(135deg, #2563eb, #7c3aed)",
                    border: "none",
                    borderRadius: "8px",
                    fontSize: "16px"
                }}
                disabled={isSubmitting}
            >
                {isSubmitting ? (
                    <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Mendaftarkan...
                    </>
                ) : (
                    "Daftar"
                )}
            </Button>

            {/* Login Link */}
            <div className="text-center">
                <p className="text-muted mb-0">
                    Sudah punya akun?{" "}
                    <Link 
                        to="/login"
                        style={{
                            color: "#2563eb",
                            textDecoration: "none",
                            fontWeight: "500"
                        }}
                    >
                        Login di sini
                    </Link>
                </p>
            </div>
        </Form>
    );
};

export default FormRegister;