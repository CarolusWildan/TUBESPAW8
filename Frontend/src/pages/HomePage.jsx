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
                <Row className="mb-3 align-items-center">
                    {/* Tambahkan text-white agar judul terlihat di background gelap */}
                    <Col><h3 className="fw-bold text-white">Lagi Tayang</h3></Col>
                    <Col className="text-end">
                        {/* Ubah btn-outline-dark menjadi btn-outline-light */}
                        <button className="btn btn-outline-light btn-sm rounded-pill px-4">Lihat semua →</button>
                    </Col>
                </Row>

                {/* POSTER HORIZONTAL */}
                <div className="d-flex overflow-auto pb-3" style={{ gap: "20px" }}>
                    {nowShowing.map((film, index) => (
                        <div
                            key={index}
                            className="film-card"
                            style={{
                                minWidth: "200px",
                                maxWidth: "200px",
                                // Ubah background white menjadi transparan
                                background: "transparent", 
                                borderRadius: "12px",
                                overflow: "hidden",
                                position: "relative",
                                // Hapus shadow gelap, ganti transisi border/scale via CSS class
                                transition: "transform 0.3s ease"
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
                                        zIndex: 2
                                    }}
                                >
                                    {film.label}
                                </span>
                            )}

                            <div style={{ borderRadius: "12px", overflow: "hidden", position: "relative" }}>
                                <img
                                    src={film.img}
                                    alt={film.title}
                                    style={{ width: "100%", height: "280px", objectFit: "cover" }}
                                />
                                {/* Overlay gradient agar teks putih di bawah gambar lebih terbaca (opsional, estetik) */}
                                <div style={{
                                    position: "absolute",
                                    bottom: 0,
                                    left: 0,
                                    width: "100%",
                                    height: "50%",
                                    background: "linear-gradient(to top, rgba(0,0,0,0.8), transparent)"
                                }}></div>
                            </div>

                            {/* Tambahkan text-white disini */}
                            <p className="text-center fw-semibold mt-2 p-1 text-white" style={{ fontSize: "0.95rem" }}>
                                {film.title}
                            </p>
                        </div>
                    ))}
                </div>

                {/* SPACING */}
                <div className="my-5"></div>

                {/* === SECTION: SEGERA TAYANG === */}
                <Row className="mb-3 align-items-center">
                    <Col><h3 className="fw-bold text-white">Segera Tayang</h3></Col>
                    <Col className="text-end">
                        {/* Ubah btn-outline-dark menjadi btn-outline-light */}
                        <button className="btn btn-outline-light btn-sm rounded-pill px-4">Lihat semua →</button>
                    </Col>
                </Row>

                <div className="d-flex overflow-auto pb-3" style={{ gap: "20px" }}>
                    {comingSoon.map((film, index) => (
                        <div
                            key={index}
                            className="film-card"
                            style={{
                                minWidth: "200px",
                                maxWidth: "200px",
                                background: "transparent", // Transparan
                                borderRadius: "12px",
                                overflow: "hidden",
                            }}
                        >
                            <div style={{ borderRadius: "12px", overflow: "hidden" }}>
                                <img
                                    src={film.img}
                                    alt={film.title}
                                    style={{ width: "100%", height: "280px", objectFit: "cover" }}
                                />
                            </div>
                            {/* Tambahkan text-white */}
                            <p className="text-center fw-semibold mt-2 p-1 text-white" style={{ fontSize: "0.95rem" }}>
                                {film.title}
                            </p>
                        </div>
                    ))}
                </div>

                {/* === SECTION: CARI TAU STUDIO XXI === */}
                <div className="my-5 py-4">
                    <Row className="mb-4">
                        <Col>
                            {/* Ubah warna judul studio menjadi putih */}
                            <h2 className="text-center fw-bold text-white">
                                Cari tau studio, yuk!
                            </h2>
                        </Col>
                    </Row>

                    {/* Studio Cards */}
                    <Row className="mb-4">
                        {/* Saya juga sedikit menyesuaikan kartu Studio agar tidak gelap total.
                           Menggunakan bg-dark text-white atau transparan dengan border.
                        */}
                        {Object.keys(studiosData).map((key) => {
                            const studio = studiosData[key];
                            const isActive = activeStudio === key;
                            return (
                                <Col md={4} className="mb-3" key={key}>
                                    <Card 
                                        className={`h-100 border-0 ${isActive ? "active-studio" : ""}`}
                                        onClick={() => setActiveStudio(key)}
                                        style={{ 
                                            cursor: "pointer", 
                                            transition: "all 0.3s ease",
                                            // Glass effect untuk kartu
                                            background: isActive ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.05)",
                                            backdropFilter: "blur(10px)",
                                            border: isActive ? "1px solid #a78bfa" : "1px solid rgba(255,255,255,0.1)"
                                        }}
                                    >
                                        <Card.Img 
                                            variant="top" 
                                            src={studio.image} 
                                            style={{ height: "180px", objectFit: "cover" }}
                                        />
                                        <Card.Body className="text-center d-flex flex-column">
                                            <Card.Title className="fw-bold text-white">
                                                {studio.title}
                                            </Card.Title>
                                            <Card.Text className="flex-grow-1 text-light opacity-75">
                                                {studio.description}
                                            </Card.Text>
                                            <div className="mb-3">
                                                <hr className="border-secondary" style={{ margin: "10px 0" }} />
                                            </div>
                                            <Button 
                                                variant={isActive ? "primary" : "outline-light"}
                                                size="sm"
                                                className="rounded-pill"
                                            >
                                                Baca lebih lanjut
                                            </Button>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            );
                        })}
                    </Row>

                    {/* Selected Studio Details */}
                    <Row className="mb-4">
                        <Col>
                            <Card className="border-0" style={{ 
                                background: "rgba(0,0,0,0.3)", // Latar belakang semi-transparan gelap
                                borderRadius: "16px"
                            }}>
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
                                            <h4 className="fw-bold mb-3 text-white">
                                                {currentStudio.title}
                                            </h4>
                                            <p className="mb-3 text-white opacity-90" style={{ fontSize: "1.1rem" }}>
                                                {currentStudio.description}
                                            </p>
                                            <ul className="list-unstyled text-white">
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
                .film-card:hover {
                    transform: translateY(-5px);
                }
                /* Scrollbar styling agar tidak merusak tema */
                .overflow-auto::-webkit-scrollbar {
                    height: 8px;
                }
                .overflow-auto::-webkit-scrollbar-track {
                    background: rgba(255,255,255,0.05);
                    border-radius: 4px;
                }
                .overflow-auto::-webkit-scrollbar-thumb {
                    background: rgba(255,255,255,0.2);
                    border-radius: 4px;
                }
                .overflow-auto::-webkit-scrollbar-thumb:hover {
                    background: rgba(255,255,255,0.4);
                }
            `}</style>
        </>
    );
};

export default HomePage;