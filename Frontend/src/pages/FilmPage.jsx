import { useState } from "react";
import { Container, Row, Col, Card, Badge, Button } from "react-bootstrap";
import imgFilm1 from "../assets/images/film1.png";
import imgFilm2 from "../assets/images/film2.png";
import imgFilm3 from "../assets/images/film3.png";
import imgFilm4 from "../assets/images/film4.png";
import imgFilm5 from "../assets/images/film5.png";
import imgFilm6 from "../assets/images/film6.png";
import imgFilm7 from "../assets/images/film7.png";
import imgFilm8 from "../assets/images/film8.png";
import imgFilm9 from "../assets/images/film9.png";

const FilmPage = () => {
    const [activeTab, setActiveTab] = useState("now_playing");

    // Data film - Sedang Tayang
    const nowPlayingFilms = [
        {
            id: 1,
            title: "MONSTA X: CONNECT X IN CINEMAS",
            image: imgFilm1,
            genre: "Music",
            duration: "120 min"
        },
        {
            id: 2,
            title: "RIBA",
            image: imgFilm2,
            genre: "Horror",
            duration: "95 min"
        },
        {
            id: 3,
            title: "MERTUA NGERI KALI",
            image: imgFilm3,
            genre: "Comedy",
            duration: "192 min"
        },
        {
            id: 4,
            title: "AGAK LAEN",
            image: imgFilm4,
            genre: "Comedy",
            duration: "161 min"
        }
    ];

    // Data film - Akan Tayang
    const comingSoonFilms = [
        {
            id: 5,
            title: "PANGKU",
            image: imgFilm5,
            genre: "Drama",
            duration: "140 min"
        },
        {
            id: 6,
            title: "AIR MATA MUALAF",
            image: imgFilm6,
            genre: "Drama",
            duration: "175 min"
        },
        {
            id: 7,
            title: "SAMPAI TITIK TERAKHIRMU",
            image: imgFilm7,
            genre: "Drama",
            duration: "150 min"
        },
        {
            id: 8,
            title: "NOW YOU SEE MEE",
            image: imgFilm8,
            genre: "Action",
            duration: "110 min"
        },
        {
            id: 9,
            title: "ZOOTOPIA 2",
            image: imgFilm9,
            genre: "Animation",
            duration: "145 min"
        }
    ];

    const films = activeTab === "now_playing" ? nowPlayingFilms : comingSoonFilms;

    return (
        <Container className="mt-4" style={{ maxWidth: "1200px" }}>
            {/* Header */}
            <Row className="mb-3">
                <Col>
                    <div className="d-flex align-items-center mb-2">
                        <Badge 
                            bg="light" 
                            text="dark"
                            style={{ 
                                fontSize: "14px",
                                padding: "6px 12px",
                                border: "1px solid #dee2e6"
                            }}
                        >
                            JABODETABEK
                        </Badge>
                    </div>
                    
                    <nav aria-label="breadcrumb">
                        <ol className="breadcrumb" style={{ fontSize: "14px", marginBottom: "5px" }}>
                            <li className="breadcrumb-item"><a href="/" style={{ textDecoration: "none" }}>Beranda</a></li>
                            <li className="breadcrumb-item active">Film</li>
                        </ol>
                    </nav>
                    
                    <h2 className="fw-bold" style={{ fontSize: "28px", color: "#1a1a1a" }}>Film</h2>
                </Col>
            </Row>

            {/* Tab Navigation */}
            <Row className="mb-4">
                <Col>
                    <div className="d-flex border-bottom">
                        <Button
                            variant="link"
                            className={`text-decoration-none px-3 py-2 fw-bold ${
                                activeTab === "now_playing" 
                                ? "text-primary border-primary border-bottom-2" 
                                : "text-muted"
                            }`}
                            style={{
                                borderBottom: activeTab === "now_playing" ? "3px solid #2563eb" : "none",
                                borderRadius: 0
                            }}
                            onClick={() => setActiveTab("now_playing")}
                        >
                            Lagi tayang
                        </Button>
                        <Button
                            variant="link"
                            className={`text-decoration-none px-3 py-2 fw-bold ${
                                activeTab === "coming_soon" 
                                ? "text-primary border-primary border-bottom-2" 
                                : "text-muted"
                            }`}
                            style={{
                                borderBottom: activeTab === "coming_soon" ? "3px solid #2563eb" : "none",
                                borderRadius: 0
                            }}
                            onClick={() => setActiveTab("coming_soon")}
                        >
                            Akan tayang
                        </Button>
                    </div>
                </Col>
            </Row>

            {/* Film Grid */}
            <Row>
                {films.map((film) => (
                    <Col key={film.id} xs={12} sm={6} md={4} lg={3} className="mb-4">
                        <Card 
                            className="h-100 border-0 shadow-sm" 
                            style={{ 
                                borderRadius: "12px",
                                overflow: "hidden",
                                transition: "transform 0.2s ease"
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = "translateY(-4px)";
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = "translateY(0)";
                            }}
                        >
                            {/* Film Image - TANPA LABEL BADGE */}
                            <Card.Img 
                                variant="top" 
                                src={film.image} 
                                style={{ 
                                    height: "300px", 
                                    objectFit: "cover",
                                    width: "100%"
                                }}
                            />

                            <Card.Body className="p-3 d-flex flex-column">
                                {/* Film Title */}
                                <Card.Title 
                                    className="fw-bold mb-2" 
                                    style={{ 
                                        fontSize: "16px",
                                        lineHeight: "1.3",
                                        minHeight: "42px",
                                        display: "-webkit-box",
                                        WebkitLineClamp: 2,
                                        WebkitBoxOrient: "vertical",
                                        overflow: "hidden"
                                    }}
                                >
                                    {film.title}
                                </Card.Title>

                                {/* Film Info */}
                                <div className="mb-3">
                                    <small className="text-muted d-block" style={{ fontSize: "12px" }}>
                                        {film.genre}
                                    </small>
                                    <small className="text-muted" style={{ fontSize: "12px" }}>
                                        {film.duration}
                                    </small>
                                </div>

                                {/* Action Button */}
                                <div className="mt-auto">
                                    <Button 
                                        className="w-100"
                                        style={{
                                            background: "linear-gradient(135deg, #2563eb, #7c3aed)",
                                            border: "none",
                                            borderRadius: "8px",
                                            padding: "10px",
                                            fontSize: "14px",
                                            fontWeight: "600"
                                        }}
                                    >
                                        {activeTab === "now_playing" ? "Pesan Tiket" : "Notify Me"}
                                    </Button>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>

            {/* Info Text */}
            <Row className="mt-4">
                <Col>
                    <div className="text-center">
                        <p className="text-muted" style={{ fontSize: "14px" }}>
                            {films.length} film {activeTab === "now_playing" ? "sedang tayang" : "akan tayang"} di TixifyID
                        </p>
                    </div>
                </Col>
            </Row>
        </Container>
    );
};

export default FilmPage;