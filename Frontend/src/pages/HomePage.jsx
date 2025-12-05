import { Container, Row, Col, Card, Button } from "react-bootstrap";
import { useState } from "react";
import ImageCarousel from "../components/ImageCarousel";
import imgFeaturette1 from "../assets/images/featurette1.png";
import imgFeaturette2 from "../assets/images/featurette2.png";
import imgFeaturette3 from "../assets/images/featurette3.png";
import imgFeaturette4 from "../assets/images/featurette4.png";
import imgFeaturette5 from "../assets/images/featurette5.png";
import imgFeaturette6 from "../assets/images/featurette6.png";
import imgFilm1 from "../assets/images/film1.png";
import imgFilm2 from "../assets/images/film2.png";
import imgFilm3 from "../assets/images/film3.png";
import imgFilm4 from "../assets/images/film4.png";
import imgFilm10 from "../assets/images/film10.png";
import imgFilm11 from "../assets/images/film11.png";
import imgCarousel1 from "../assets/images/carousel1.png";
import imgCarousel2 from "../assets/images/carousel2.png";
import imgCarousel3 from "../assets/images/carousel3.png";
import imgStudio1 from "../assets/images/studio1.png";
import imgStudio2 from "../assets/images/studio2.png";
import imgStudio3 from "../assets/images/studio3.png";

// === CAROUSEL IMAGES ===
const images = [
    {   
        img: imgCarousel1, 
        title: "Film 1", 
        description: "" 
    },
    { 
        img: imgCarousel2, 
        title: "Film 2", 
        description: "" 
    },
    { 
        img: imgCarousel3, 
        title: "Film 3", 
        description: "" 
    },
];

// === FILM LAGI TAYANG ===
const nowShowing = [
    { 
        img: imgFilm1, 
        title: "MONSTA X: CONNECT X IN CINEMAS",  
    },
    { 
        img: imgFilm2, 
        title: "RIBA", 
    },
    { 
        img: imgFilm3, 
        title: "MERTUA NGERI KALI",  
    },
    { 
        img: imgFilm4, 
        title: "AGAK LAEN", 
    },
    {
        img: imgFilm10, 
        title: "WICKED", 
    },
    {
        img: imgFilm11, 
        title: "SAMPAI TITIK TERAKHIRMU", 
    },
];

// === FILM SEGERA TAYANG ===
const comingSoon = [
    { 
        img: imgFeaturette1, 
        title: "JUJUTSU KAISEN" 
    },
    { 
        img: imgFeaturette2, 
        title: "FIVE NIGHTS AT FREDDYS 2" 
    },
    { 
        img: imgFeaturette3, 
        title: "TERE ISHK MEIN" 
    },
    { 
        img: imgFeaturette4, 
        title: "OTHER" 
    },
    { 
        img: imgFeaturette5, 
        title: "13 DAYS 13 NIGHTS" 
    },
    { 
        img: imgFeaturette6, 
        title: "OZORA" 
    },
];

// === STUDIO DATA ===
const studiosData = {
    studio1: {
        image: imgStudio1,
        title: "Studio 1",
        description: "Nikmati fontonen dengan kursi yang nyaman dan harga terjangkau.",
        features: ["Kursi nyaman", "Harga terjangkau", "Sound system premium", "Tempat duduk luas"]
    },
    studio2: {
        image: imgStudio2,
        title: "Studio 2",
        description: "Rasakan kemewahan kursi premium serta makanan ala restoran dengan servis terbaik.",
        features: ["Kursi premium", "Makanan restoran", "Servis terbaik", "Pengalaman eksklusif"]
    },
    studio3: {
        image: imgStudio3,
        title: "Studio 3",
        description: "Rasakan bedanya nonton film high-definition dengan sistem proyeksi laser 4K.",
        features: ["Proyeksi laser 4K", "Sound surround", "Layar besar", "Pengalaman imersif"]
    },
};

const HomePage = () => {
    const [activeStudio, setActiveStudio] = useState("studio1");

    // Get current studio data safely
    const currentStudio = studiosData[activeStudio] || studiosData.studio1;

    return (
        <>
            {/* CAROUSEL */}
            <ImageCarousel images={images} />

            <Container className="mt-5">

                {/* === SECTION: LAGI TAYANG === */}
                <Row className="mb-3">
                    <Col><h3 className="fw-bold">Lagi Tayang</h3></Col>
                    <Col className="text-end">
                        <button className="btn btn-outline-dark btn-sm">Lihat semua →</button>
                    </Col>
                </Row>

                {/* POSTER HORIZONTAL */}
                <div className="d-flex overflow-auto" style={{ gap: "20px" }}>
                    {nowShowing.map((film, index) => (
                        <div
                            key={index}
                            style={{
                                minWidth: "200px",
                                maxWidth: "200px",
                                background: "white",
                                borderRadius: "12px",
                                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                                overflow: "hidden",
                                position: "relative"
                            }}
                        >
                            {film.label && (
                                <span
                                    style={{
                                        position: "absolute",
                                        top: 0,
                                        left: 0,
                                        background: "#4ade80",
                                        padding: "5px 10px",
                                        fontSize: "12px",
                                        color: "white",
                                        borderBottomRightRadius: "10px",
                                    }}
                                >
                                    {film.label}
                                </span>
                            )}

                            <img
                                src={film.img}
                                alt={film.title}
                                style={{ width: "100%", height: "230px", objectFit: "cover" }}
                            />

                            <p className="text-center fw-semibold mt-2 p-2">{film.title}</p>
                        </div>
                    ))}
                </div>

                {/* SPACING */}
                <div className="my-5"></div>

                {/* === SECTION: SEGERA TAYANG === */}
                <Row className="mb-3">
                    <Col><h3 className="fw-bold">Segera Tayang</h3></Col>
                    <Col className="text-end">
                        <button className="btn btn-outline-dark btn-sm">Lihat semua →</button>
                    </Col>
                </Row>

                <div className="d-flex overflow-auto" style={{ gap: "20px" }}>
                    {comingSoon.map((film, index) => (
                        <div
                            key={index}
                            style={{
                                minWidth: "200px",
                                maxWidth: "200px",
                                background: "white",
                                borderRadius: "12px",
                                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                                overflow: "hidden",
                            }}
                        >
                            <img
                                src={film.img}
                                alt={film.title}
                                style={{ width: "100%", height: "230px", objectFit: "cover" }}
                            />
                            <p className="text-center fw-semibold mt-2 p-2">{film.title}</p>
                        </div>
                    ))}
                </div>

                {/* === SECTION: CARI TAU STUDIO XXI === */}
                <div className="my-5 py-4">
                    <Row className="mb-4">
                        <Col>
                            <h2 className="text-center fw-bold" style={{ color: "#2c3e50" }}>
                                Cari tau studio, yuk!
                            </h2>
                        </Col>
                    </Row>

                    {/* Studio Cards */}
                    <Row className="mb-4">
                        <Col md={4} className="mb-3">
                            <Card 
                                className={`h-100 studio-card ${activeStudio === "studio1" ? "active-studio" : ""}`}
                                onClick={() => setActiveStudio("studio1")}
                                style={{ 
                                    cursor: "pointer", 
                                    transition: "all 0.3s ease",
                                    border: activeStudio === "studio1" ? "3px solid #6b7280" : "1px solid #dee2e6"
                                }}
                            >
                                <Card.Img 
                                    variant="top" 
                                    src={imgStudio1} 
                                    style={{ height: "180px", objectFit: "cover" }}
                                />
                                <Card.Body className="text-center d-flex flex-column">
                                    <Card.Title style={{ color: "#6b7280", fontWeight: "bold" }}>
                                        Studio 1
                                    </Card.Title>
                                    <Card.Text className="flex-grow-1">
                                        Nikmati fontonen dengan kursi yang nyaman dan harga terjangkau.
                                    </Card.Text>
                                    <div className="mb-3">
                                        <hr style={{ margin: "10px 0" }} />
                                    </div>
                                    <Button 
                                        variant="outline-primary" 
                                        size="sm"
                                        style={{ borderColor: "#6b7280", color: "#6b7280" }}
                                    >
                                        Baca lebih lanjut
                                    </Button>
                                </Card.Body>
                            </Card>
                        </Col>

                        <Col md={4} className="mb-3">
                            <Card 
                                className={`h-100 studio-card ${activeStudio === "studio2" ? "active-studio" : ""}`}
                                onClick={() => setActiveStudio("studio2")}
                                style={{ 
                                    cursor: "pointer", 
                                    transition: "all 0.3s ease",
                                    border: activeStudio === "studio2" ? "3px solid #6b7280" : "1px solid #dee2e6"
                                }}
                            >
                                <Card.Img 
                                    variant="top" 
                                    src={imgStudio2} 
                                    style={{ height: "180px", objectFit: "cover" }}
                                />
                                <Card.Body className="text-center d-flex flex-column">
                                    <Card.Title style={{ color: "#6b7280", fontWeight: "bold" }}>
                                        Studio 2
                                    </Card.Title>
                                    <Card.Text className="flex-grow-1">
                                        Rasakan kemewahan kursi premium serta makanan ala restoran dengan servis terbaik.
                                    </Card.Text>
                                    <div className="mb-3">
                                        <hr style={{ margin: "10px 0" }} />
                                    </div>
                                    <Button 
                                        variant="outline-primary" 
                                        size="sm"
                                        style={{ borderColor: "#6b7280", color: "#6b7280" }}
                                    >
                                        Baca lebih lanjut
                                    </Button>
                                </Card.Body>
                            </Card>
                        </Col>

                        <Col md={4} className="mb-3">
                            <Card 
                                className={`h-100 studio-card ${activeStudio === "studio3" ? "active-studio" : ""}`}
                                onClick={() => setActiveStudio("studio3")}
                                style={{ 
                                    cursor: "pointer", 
                                    transition: "all 0.3s ease",
                                    border: activeStudio === "studio3" ? "3px solid #6b7280" : "1px solid #dee2e6"
                                }}
                            >
                                <Card.Img 
                                    variant="top" 
                                    src={imgStudio3} 
                                    style={{ height: "180px", objectFit: "cover" }}
                                />
                                <Card.Body className="text-center d-flex flex-column">
                                    <Card.Title style={{ color: "#6b7280", fontWeight: "bold" }}>
                                        Studio 3
                                    </Card.Title>
                                    <Card.Text className="flex-grow-1">
                                        Rasakan bedanya nonton film high-definition dengan sistem proyeksi laser 4K.
                                    </Card.Text>
                                    <div className="mb-3">
                                        <hr style={{ margin: "10px 0" }} />
                                    </div>
                                    <Button 
                                        variant="outline-primary" 
                                        size="sm"
                                        style={{ borderColor: "#6b7280", color: "#6b7280" }}
                                    >
                                        Baca lebih lanjut
                                    </Button>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>

                    {/* Selected Studio Details */}
                    <Row className="mb-4">
                        <Col>
                            <Card className="bg-light border-0">
                                <Card.Body className="p-4">
                                    <Row className="align-items-center">
                                        <Col md={4}>
                                            <img 
                                                src={currentStudio.image} 
                                                alt={currentStudio.title}
                                                className="img-fluid rounded shadow"
                                                style={{ 
                                                    width: "100%", 
                                                    height: "250px", 
                                                    objectFit: "cover" 
                                                }}
                                            />
                                        </Col>
                                        <Col md={8}>
                                            <h4 className="fw-bold mb-3" style={{ color: "#2c3e50" }}>
                                                {currentStudio.title}
                                            </h4>
                                            <p className="mb-3" style={{ fontSize: "1.1rem" }}>
                                                {currentStudio.description}
                                            </p>
                                            <ul className="list-unstyled">
                                                {currentStudio.features.map((feature, index) => (
                                                    <li key={index} className="mb-2">
                                                        <span className="me-2">✅</span>
                                                        {feature}
                                                    </li>
                                                ))}
                                            </ul>
                                        </Col>
                                    </Row>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                </div>

                <div className="mt-5 mb-5" />

            </Container>

            {/* Custom CSS */}
            <style jsx>{`
                .studio-card:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 8px 25px rgba(0,0,0,0.15);
                }
                .active-studio {
                    box-shadow: 0 4px 15px rgba(0,0,0,0.1);
                }
            `}</style>
        </>
    );
};

export default HomePage;