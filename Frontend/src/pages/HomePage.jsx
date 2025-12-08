import { Container, Row, Col, Card, Button, Spinner } from "react-bootstrap";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // IMPORT NAVIGATE
import axios from "axios";
import ImageCarousel from "../components/ImageCarousel";

// === PENGGANTI GAMBAR LOKAL (FIX ERROR) ===
import imgStudio1 from "../assets/images/studio1.png";

import imgStudio2 from "../assets/images/studio2.jpeg";

import imgStudio3 from "../assets/images/studio3.png";

// === STUDIO DATA (Static) ===
const studiosData = {
    studio1: {
        image: imgStudio1,
        title: "Studio Reguler",
        description: "Nikmati tontonan dengan kursi yang nyaman dan harga terjangkau.",
        features: ["Kursi nyaman", "Harga terjangkau", "Sound system premium", "Tempat duduk luas"]
    },
    studio2: {
        image: imgStudio2,
        title: "Studio ScreenX",
        description: "Nikmati pengalaman menonton ultra-immersive dengan layar 270° yang membentang ke samping, menghadirkan sudut pandang sinematik yang lebih luas dan memukau.",
        features: ["Layar Mewah", "Kursi premium", "Makanan restoran", "Pengalaman eksklusif"]
    },
    studio3: {
        image: imgStudio3,
        title: "Studio IMAX",
        description: "Rasakan bedanya nonton film high-definition dengan sistem proyeksi laser 4K.",
        features: ["Proyeksi laser 4K", "Sound surround", "Layar besar", "Pengalaman imersif"]
    },
};

const HomePage = () => {
    const navigate = useNavigate(); // INISIALISASI HOOK NAVIGATE
    const [activeStudio, setActiveStudio] = useState("studio1");
    
    // State untuk Data Film dari API
    const [nowShowing, setNowShowing] = useState([]);
    const [comingSoon, setComingSoon] = useState([]);
    const [carouselImages, setCarouselImages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // === KONFIGURASI API ===
    const API_URL = 'http://localhost:8000/api/films'; 
    const STORAGE_URL = 'http://localhost:8000/storage/'; 

    const getImageUrl = (path) => {
        if (!path) return "https://placehold.co/300x450/2a2a3d/ffffff?text=No+Image";
        if (path.startsWith('http')) return path;
        return `${STORAGE_URL}${path}`;
    };

    useEffect(() => {
        const fetchMovies = async () => {
            try {
                setLoading(true);
                const response = await axios.get(API_URL);
                const movies = response.data; 

                const moviesArray = Array.isArray(movies) ? movies : (movies.data || []);

                if (!Array.isArray(moviesArray)) {
                    throw new Error("Format data API tidak valid (harus array)");
                }

                // === FILTERING ===
                const showing = moviesArray.filter(m => m.status === 'showing');
                const coming = moviesArray.filter(m => m.status === 'coming soon');

                // === MAPPING DATA ===
                setNowShowing(showing.map(m => ({
                    id: m.id_film, 
                    title: m.judul, 
                    img: getImageUrl(m.cover_path), 
                    label: null
                })));

                setComingSoon(coming.map(m => ({
                    id: m.id_film,
                    title: m.judul,
                    img: getImageUrl(m.cover_path)
                })));

                // Set Carousel: Prioritaskan Now Showing
                const featured = showing.length > 0 ? showing : coming;
                setCarouselImages(featured.slice(-3).reverse().map(m => ({
                    img: getImageUrl(m.cover_path), 
                    title: m.judul,
                    description: m.genre || "" 
                })));

            } catch (err) {
                console.error("Gagal mengambil data film:", err);
                setError("Gagal memuat data film. Pastikan backend Laravel berjalan.");
                setCarouselImages([
                    { img: "https://placehold.co/1200x400/4b0082/ffffff?text=Cek+Koneksi+Backend", title: "Gagal Memuat Data" }
                ]);
            } finally {
                setLoading(false);
            }
        };

        fetchMovies();
    }, []);

    const currentStudio = studiosData[activeStudio] || studiosData.studio1;

    // Loading State
    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center min-vh-100" style={{ background: "transparent" }}>
                <Spinner animation="border" variant="light" />
            </div>
        );
    }

    return (
        <>
            {/* CAROUSEL */}
            {carouselImages.length > 0 && <ImageCarousel images={carouselImages} />}

            <Container className="mt-5">

                {/* === SECTION: LAGI TAYANG (Showing) === */}
                <Row className="mb-3 align-items-center">
                    <Col><h3 className="fw-bold text-white">Lagi Tayang</h3></Col>
                    <Col className="text-end">
                        <button 
                            className="btn btn-outline-light btn-sm rounded-pill px-4"
                            onClick={() => navigate('/movies')} // ARAHKAN KE PAGE FILM
                        >
                            Lihat semua →
                        </button>
                    </Col>
                </Row>

                {nowShowing.length > 0 ? (
                    <div className="d-flex overflow-auto pb-3" style={{ gap: "20px" }}>
                        {/* LIMITASI: Menggunakan .slice(0, 6) untuk menampilkan max 6 film */}
                        {nowShowing.slice(0, 6).map((film, index) => (
                            <div
                                key={film.id || index}
                                className="film-card"
                                style={{
                                    minWidth: "200px",
                                    maxWidth: "200px",
                                    background: "transparent",
                                    borderRadius: "12px",
                                    overflow: "hidden",
                                    position: "relative",
                                    transition: "transform 0.3s ease",
                                    cursor: "pointer"
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
                                        onError={(e) => { e.target.src = "https://placehold.co/200x280?text=Image+Error"; }}
                                    />
                                    {/* Gradient Overlay */}
                                    <div style={{
                                        position: "absolute",
                                        bottom: 0,
                                        left: 0,
                                        width: "100%",
                                        height: "50%",
                                        background: "linear-gradient(to top, rgba(0,0,0,0.8), transparent)"
                                    }}></div>
                                </div>

                                <p className="text-center fw-semibold mt-2 p-1 text-white" style={{ fontSize: "0.95rem" }}>
                                    {film.title}
                                </p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-white-50 text-center py-4 border border-secondary rounded mb-4" style={{ background: "rgba(255,255,255,0.05)" }}>
                        <p className="mb-0">
                            {error ? "Gagal memuat data." : "Belum ada film yang sedang tayang."}
                        </p>
                    </div>
                )}

                <div className="my-5"></div>

                {/* === SECTION: SEGERA TAYANG (Coming Soon) === */}
                <Row className="mb-3 align-items-center">
                    <Col><h3 className="fw-bold text-white">Segera Tayang</h3></Col>
                    <Col className="text-end">
                        <button 
                            className="btn btn-outline-light btn-sm rounded-pill px-4"
                            onClick={() => navigate('/movies')} // ARAHKAN KE PAGE FILM
                        >
                            Lihat semua →
                        </button>
                    </Col>
                </Row>

                {comingSoon.length > 0 ? (
                    <div className="d-flex overflow-auto pb-3" style={{ gap: "20px" }}>
                        {/* LIMITASI: Menggunakan .slice(0, 6) untuk menampilkan max 6 film */}
                        {comingSoon.slice(0, 6).map((film, index) => (
                            <div
                                key={film.id || index}
                                className="film-card"
                                style={{
                                    minWidth: "200px",
                                    maxWidth: "200px",
                                    background: "transparent",
                                    borderRadius: "12px",
                                    overflow: "hidden",
                                    transition: "transform 0.3s ease",
                                    cursor: "pointer"
                                }}
                            >
                                <div style={{ borderRadius: "12px", overflow: "hidden" }}>
                                    <img
                                        src={film.img}
                                        alt={film.title}
                                        style={{ width: "100%", height: "280px", objectFit: "cover" }}
                                        onError={(e) => { e.target.src = "https://placehold.co/200x280?text=Image+Error"; }}
                                    />
                                </div>
                                <p className="text-center fw-semibold mt-2 p-1 text-white" style={{ fontSize: "0.95rem" }}>
                                    {film.title}
                                </p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-white-50 text-center py-4 border border-secondary rounded mb-4" style={{ background: "rgba(255,255,255,0.05)" }}>
                        <p className="mb-0">
                            {error ? "Gagal memuat data." : "Belum ada film yang akan datang."}
                        </p>
                    </div>
                )}

                {/* === SECTION: CARI TAU STUDIO XXI (Tetap Static) === */}
                <div className="my-5 py-4">
                    <Row className="mb-4">
                        <Col>
                            <h2 className="text-center fw-bold text-white">
                                Cari tau studio, yuk!
                            </h2>
                        </Col>
                    </Row>

                    <Row className="mb-4">
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

                    <Row className="mb-4">
                        <Col>
                            <Card className="border-0" style={{ 
                                background: "rgba(0,0,0,0.3)",
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

            <style jsx>{`
                .film-card:hover {
                    transform: translateY(-5px);
                }
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