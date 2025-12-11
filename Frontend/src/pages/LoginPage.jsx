import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Row, Col, Card } from "react-bootstrap";
import FormLogin from "../components/FormLogin";

const LoginPage = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const user = localStorage.getItem("user");
        // KOREKSI LOGIKA: Jika user ada, lempar ke dashboard/home, bukan ke login lagi.
        if (user) {
            navigate("/"); 
        }
    }, [navigate]);

    return (
        <Container 
            fluid 
            className="min-vh-100 d-flex align-items-center"
            style={{
                // BACKGROUND GRADASI (Sesuai MainLayout)
                background: "linear-gradient(180deg, #4b0082 0%, #1e3c72 50%, #000000 100%)",
                backgroundSize: "cover",
                backgroundAttachment: "fixed"
            }}
        >
            <Row className="w-100 justify-content-center m-0">
                <Col xs={12} sm={8} md={6} lg={4}>
                    {/* Logo Area */}
                    <div className="text-center mb-4">
                        <h1 
                            style={{ 
                                fontSize: "48px",
                                fontWeight: "800",
                                letterSpacing: "2px",
                                background: "linear-gradient(135deg, #60a5fa, #a78bfa)", 
                                WebkitBackgroundClip: "text",
                                WebkitTextFillColor: "transparent",
                                marginBottom: "8px",
                                filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.3))"
                            }}
                        >
                            TIXIFY
                        </h1>
                    </div>

                    {/* Glass Card */}
                    <Card 
                        className="border-0"
                        style={{
                            background: "rgba(255, 255, 255, 0.05)", 
                            backdropFilter: "blur(16px)",            
                            WebkitBackdropFilter: "blur(16px)",
                            borderRadius: "24px",
                            border: "1px solid rgba(255, 255, 255, 0.1)", 
                            boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.3)"
                        }}
                    >
                        <Card.Body className="p-4 p-md-5">
                            {/* Header */}
                            <div className="text-center mb-4">
                                <h2 className="fw-bold text-white mb-2">
                                    Welcome Back!
                                </h2>
                                <p style={{ color: "rgba(255, 255, 255, 0.7)", fontSize: "0.95rem" }}>
                                    Masuk ke akun kamu untuk melanjutkan pengalaman menonton
                                </p>
                            </div>

                            <FormLogin />
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default LoginPage;