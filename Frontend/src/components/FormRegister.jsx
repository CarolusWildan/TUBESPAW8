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

    const inputStyle = {
        background: "rgba(0, 0, 0, 0.2)",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        color: "white",
        padding: "12px 16px",
        borderRadius: "12px",
        fontSize: "0.95rem"
    };

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

            const response = await axios.post(API_REGISTER_URL, formData);

            console.log("✅ Response dari API:", response.data);

            toast.success("Registrasi Berhasil! Silakan Login.");

            setTimeout(() => {
                navigate('/login');
            }, 1500);

        } catch (err) {
            console.error("❌ Registrasi Gagal:", err);

            if (err.response) {
                if (err.response.data?.errors) {
                    const validationErrors = Object.values(err.response.data.errors).flat();
                    setError(validationErrors.join(' '));
                    toast.error(validationErrors.join(', '));
                } else if (err.response.data?.message) {
                    setError(err.response.data.message);
                    toast.error(err.response.data.message);
                }
            } else if (err.request) {
                setError("Tidak ada respon dari server. Cek koneksi internet atau backend.");
                toast.error("Server tidak merespon. Cek apakah backend berjalan.");
            } else {
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
                <Form.Label className="fw-medium text-white">Nama Lengkap</Form.Label>
                <Form.Control
                    type="text"
                    name="nama"
                    value={formData.nama}
                    onChange={handleChange}
                    placeholder="Masukkan nama lengkap kamu"
                    style={inputStyle}
                    required
                    disabled={isSubmitting}
                />
            </Form.Group>

            {/* Email Field */}
            <Form.Group className="mb-3">
                <Form.Label className="fw-medium text-white">Email</Form.Label>
                <Form.Control
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Contoh: user@email.com"
                    style={inputStyle}
                    required
                    disabled={isSubmitting}
                />
            </Form.Group>

            {/* Password Field */}
            <Form.Group className="mb-3">
                <Form.Label className="fw-medium text-white">Password</Form.Label>
                <Form.Control
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Minimal 8 karakter"
                    style={inputStyle}
                    required
                    disabled={isSubmitting}
                />
            </Form.Group>

            {/* Role Field */}
            <Form.Group className="mb-4">
                <Form.Label className="fw-medium text-white">Role</Form.Label>
                <Form.Select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    style={inputStyle}
                    disabled={isSubmitting}
                    className="custom-select-dark"
                >
                    <option value="user" style={{ color: "black" }}>User</option>
                    <option value="admin" style={{ color: "black" }}>Admin</option>
                </Form.Select>
                <Form.Text style={{ color: "rgba(255,255,255,0.5)" }}>
                    Pilih role sesuai kebutuhan kamu
                </Form.Text>
            </Form.Group>

            {/* Error Message */}
            {error && (
                <div className="alert alert-danger py-2" style={{ fontSize: "0.9rem" }} role="alert">
                    {error}
                </div>
            )}

            {/* Register Button (Gradient) */}
            <Button
                type="submit"
                className="w-100 py-3 fw-bold mb-3"
                style={{
                    background: "linear-gradient(90deg, #6a11cb 0%, #2575fc 100%)",
                    border: "none",
                    borderRadius: "50px", // Rounded pill
                    fontSize: "16px",
                    boxShadow: "0 4px 15px rgba(37, 117, 252, 0.4)",
                    transition: "transform 0.2s"
                }}
                disabled={isSubmitting}
                onMouseEnter={(e) => e.target.style.transform = "scale(1.02)"}
                onMouseLeave={(e) => e.target.style.transform = "scale(1)"}
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
                <p className="mb-0" style={{ fontSize: "14px", color: "rgba(255,255,255,0.7)" }}>
                    Sudah punya akun?{" "}
                    <Link
                        to="/login"
                        style={{
                            color: "#60a5fa",
                            textDecoration: "none",
                            fontWeight: "600"
                        }}
                    >
                        Login di sini
                    </Link>
                </p>
            </div>

            {/* CSS Helper untuk Input Focus & Autofill */}
            <style jsx>{`
                .form-control:focus, .form-select:focus {
                    background: rgba(0, 0, 0, 0.4) !important;
                    border-color: #a78bfa !important;
                    color: white !important;
                    box-shadow: 0 0 0 0.25rem rgba(167, 139, 250, 0.25);
                }
                /* Mengatasi warna background kuning saat autofill browser */
                input:-webkit-autofill,
                input:-webkit-autofill:hover, 
                input:-webkit-autofill:focus, 
                input:-webkit-autofill:active{
                    -webkit-box-shadow: 0 0 0 30px #1a1a2e inset !important;
                    -webkit-text-fill-color: white !important;
                    transition: background-color 5000s ease-in-out 0s;
                }
                /* Memperbaiki icon dropdown select agar terlihat putih (opsional tergantung browser) */
                .custom-select-dark {
                    background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3e%3cpath fill='none' stroke='%23ffffff' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M2 5l6 6 6-6'/%3e%3c/svg%3e");
                }
                /* Menargetkan placeholder pada semua input dan select di dalam form ini */
                .form-control::placeholder {
                    color: rgba(255, 255, 255, 0.6) !important; /* Ubah angka 0.6 untuk mengatur transparansi (1.0 = Putih Solid) */
                    opacity: 1; /* Diperlukan untuk Firefox */
                }
            `}</style>
        </Form>
    );
};

export default FormRegister;