import { Form, Button } from "react-bootstrap";
import { useNavigate, Link } from "react-router-dom";
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

        // Validasi form
        if (!formData.email || !formData.password) {
            toast.error("Email dan password harus diisi!");
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

        try {
            // Kirim request login ke API Laravel
            const response = await axios.post(API_LOGIN_URL, formData);
            
            // Ambil token dan data user dari response
            const token = response.data.token;
            const userData = response.data.detail; 
            
            // Simpan token dan data user ke localStorage
            localStorage.setItem('auth_token', token);
            localStorage.setItem('user', JSON.stringify(userData)); 
            localStorage.setItem('login_time', new Date().toISOString()); 

            // Set header Authorization untuk request selanjutnya
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

            toast.success("Login berhasil! Selamat Datang.");
            
            // Redirect ke dashboard setelah login berhasil
            setTimeout(() => {
                navigate('/');
            }, 1000);

        } catch (err) {
            console.error("Login Gagal:", err.response ? err.response.data : err.message);
            
            // Handle error response dari API
            if (err.response && err.response.status === 401) {
                setError("Email atau Password salah.");
                toast.error("Email atau Password salah.");
            } else if (err.response && err.response.data.errors) {
                // Handle validation errors dari Laravel
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
                <Form.Label className="fw-medium">Email</Form.Label>
                <Form.Control
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Masukkan email kamu"
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
            <Form.Group className="mb-4">
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
                <Form.Text className="text-muted">
                    Password harus minimal 8 karakter
                </Form.Text>
            </Form.Group>

            {/* Error Message */}
            {error && (
                <div className="alert alert-danger" role="alert">
                    {error}
                </div>
            )}

            {/* Login Button */}
            <Button
                type="submit"
                className="w-100 py-3 fw-bold"
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
                        Loading...
                    </>
                ) : (
                    "Login"
                )}
            </Button>

            {/* Divider */}
            <div className="position-relative text-center my-4">
                <hr />
                <span 
                    className="position-absolute top-50 start-50 translate-middle bg-white px-3 text-muted"
                    style={{ fontSize: "14px" }}
                >
                    atau
                </span>
            </div>

            {/* Register Link */}
            <div className="text-center">
                <p className="text-muted mb-2" style={{ fontSize: "14px" }}>
                    Gak punya akun?
                </p>
                <Button
                    variant="outline-primary"
                    className="w-100"
                    style={{
                        border: "1.5px solid #2563eb",
                        color: "#2563eb",
                        borderRadius: "8px",
                        padding: "10px",
                        fontWeight: "500"
                    }}
                    onClick={() => navigate("/register")}
                    disabled={isSubmitting}
                >
                    Yuk, buat akun
                </Button>
            </div>
        </Form>
    );
};

export default FormLogin;