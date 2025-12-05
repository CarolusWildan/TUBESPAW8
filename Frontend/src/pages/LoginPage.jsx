import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Row, Col, Card } from "react-bootstrap";
import FormLogin from "../components/FormLogin";

const LoginPage = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const user = localStorage.getItem("user");
        if (user) {
            navigate("/login");
        }
    }, [navigate]);

    return (
        <Container fluid className="bg-light min-vh-100 d-flex align-items-center">
            <Row className="w-100 justify-content-center">
                <Col xs={12} sm={8} md={6} lg={4}>
                    {/* Logo */}
                    <div className="text-center mb-4">
                        <h1 
                            style={{ 
                                fontSize: "48px",
                                fontWeight: "bold",
                                background: "linear-gradient(135deg, #2563eb, #7c3aed)",
                                WebkitBackgroundClip: "text",
                                WebkitTextFillColor: "transparent",
                                marginBottom: "8px"
                            }}
                        >
                            Tixify
                        </h1>
                    </div>

                    <Card className="shadow border-0">
                        <Card.Body className="p-4">
                            {/* Header */}
                            <div className="text-center mb-4">
                                <h2 className="fw-bold" style={{ color: "#1f2937" }}>
                                    Hai, senang ketemu lagi!
                                </h2>
                                <p className="text-muted">
                                    Masuk ke akun kamu untuk lanjutkan pengalaman menonton
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