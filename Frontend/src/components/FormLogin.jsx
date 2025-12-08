import { Form, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { toast } from "sonner";
import axios from 'axios';

const FormLogin = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: "",
        password: ""
    });
    const [error, setError] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const API_LOGIN_URL = 'http://localhost:8000/api/login';

    // Style Input Gelap
    const inputStyle = {
        background: "rgba(0, 0, 0, 0.2)", // Gelap transparan
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

        if (!formData.email || !formData.password) {
            toast.error("Email dan password harus diisi!");
            setIsSubmitting(false);
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            toast.error("Format email tidak valid!");
            setIsSubmitting(false);
            return;
        }

        try {
            const response = await axios.post(API_LOGIN_URL, formData);
            
            const token = response.data.token;
            const userData = response.data.detail; 
            
            localStorage.setItem('auth_token', token);
            localStorage.setItem('user', JSON.stringify(userData)); 
            localStorage.setItem('login_time', new Date().toISOString()); 

            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

            toast.success("Login berhasil! Selamat Datang.");
            
            setTimeout(() => {
                navigate('/');
            }, 1000);

        } catch (err) {
            console.error("Login Gagal:", err.response ? err.response.data : err.message);
            
            if (err.response && err.response.status === 401) {
                setError("Email atau Password salah.");
                toast.error("Email atau Password salah.");
            } else if (err.response && err.response.data.errors) {
                const validationErrors = Object.values(err.response.data.errors).flat();
                setError(validationErrors.join(' '));
                toast.error(validationErrors.join(', '));
            } else {
                setError("Terjadi kesalahan koneksi atau server.");
                toast.error("Terjadi kesalahan koneksi atau server.");
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Form onSubmit={handleSubmit}>
            {/* Email Field */}
            <Form.Group className="mb-3">
                <Form.Label className="fw-medium text-white">Email</Form.Label>
                <Form.Control
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Masukkan email kamu"
                    style={inputStyle}
                    className="custom-input-dark" 
                    required
                    disabled={isSubmitting}
                />
            </Form.Group>

            {/* Password Field */}
            <Form.Group className="mb-4">
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
                <Form.Text style={{ color: "rgba(255,255,255,0.5)" }}>
                    Password harus minimal 8 karakter
                </Form.Text>
            </Form.Group>

            {/* Error Message */}
            {error && (
                <div className="alert alert-danger py-2" style={{ fontSize: "0.9rem" }} role="alert">
                    {error}
                </div>
            )}

            {/* Login Button (Gradient) */}
            <Button
                type="submit"
                className="w-100 py-3 fw-bold"
                style={{
                    background: "linear-gradient(90deg, #6a11cb 0%, #2575fc 100%)",
                    border: "none",
                    borderRadius: "50px", // Rounded pill agar modern
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
                        Loading...
                    </>
                ) : (
                    "Login"
                )}
            </Button>

            {/* Divider */}
            <div className="position-relative text-center my-4">
                <hr style={{ borderColor: "rgba(255,255,255,0.2)" }} />
                <span 
                    className="position-absolute top-50 start-50 translate-middle px-3"
                    style={{ 
                        fontSize: "14px", 
                        color: "rgba(255,255,255,0.6)",
                        background: "transparent"
                    }}
                >
                    <span style={{ background: "#2e2550", padding: "0 10px", borderRadius: "4px" }}>
                        atau
                    </span>
                </span>
            </div>

            {/* Register Link (Ghost Button Style) */}
            <div className="text-center">
                <p className="mb-2" style={{ fontSize: "14px", color: "rgba(255,255,255,0.7)" }}>
                    Gak punya akun?
                </p>
                <Button
                    variant="outline-light" // Menggunakan varian light agar terlihat di dark bg
                    className="w-100"
                    style={{
                        borderRadius: "50px",
                        padding: "10px",
                        fontWeight: "500",
                        borderColor: "rgba(255,255,255,0.3)",
                        color: "rgba(255,255,255,0.9)"
                    }}
                    onClick={() => navigate("/register")}
                    disabled={isSubmitting}
                >
                    Yuk, buat akun
                </Button>
            </div>
            
            {/* CSS Helper untuk Input Focus & Autofill */}
            <style jsx>{`
                .form-control:focus {
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
                /* Menargetkan placeholder pada semua input dan select di dalam form ini */
                .form-control::placeholder {
                    color: rgba(255, 255, 255, 0.6) !important; /* Ubah angka 0.6 untuk mengatur transparansi (1.0 = Putih Solid) */
                    opacity: 1; /* Diperlukan untuk Firefox */
                }
            `}</style>
        </Form>
    );
};

export default FormLogin;