import { useState, useEffect } from "react";
import { Container, Row, Col, Card, Badge, Button, Spinner, Alert } from "react-bootstrap";
import { useNavigate } from "react-router-dom"; // 1. IMPORT INI
import axios from "axios";

const FilmPage = () => {
    const navigate = useNavigate(); // 2. INISIALISASI NAVIGATE
    const [activeTab, setActiveTab] = useState("now_playing");
    
    // State untuk data film dari API
    const [nowPlayingFilms, setNowPlayingFilms] = useState([]);
    const [comingSoonFilms, setComingSoonFilms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // === KONFIGURASI API ===
    const API_URL = 'http://localhost:8000/api/films'; 
    const STORAGE_URL = 'http://localhost:8000/storage/'; 

    // Helper untuk menangani URL gambar
    const getImageUrl = (path) => {
        if (!path) return "https://placehold.co/300x450/2a2a3d/ffffff?text=No+Image";
        if (path.startsWith('http')) return path;
        return `${STORAGE_URL}${path}`;
    };

    // Fetch Data saat komponen dimuat
    useEffect(() => {
        const fetchMovies = async () => {
            try {
                setLoading(true);
                const response = await axios.get(API_URL);
                const movies = response.data; 

                const moviesArray = Array.isArray(movies) ? movies : (movies.data || []);

                if (!Array.isArray(moviesArray)) {
                    throw new Error("Format data API tidak valid");
                }

                const showing = moviesArray.filter(m => m.status === 'showing');
                const coming = moviesArray.filter(m => m.status === 'coming soon');

                setNowPlayingFilms(showing.map(m => ({
                    id: m.id_film,
                    title: m.judul,
                    image: getImageUrl(m.cover_path),
                    genre: m.genre,
                    duration: m.durasi_film 
                })));

                setComingSoonFilms(coming.map(m => ({
                    id: m.id_film,
                    title: m.judul,
                    image: getImageUrl(m.cover_path),
                    genre: m.genre,
                    duration: m.durasi_film
                })));

            } catch (err) {
                console.error("Gagal mengambil data film:", err);
                setError("Gagal memuat data film dari server.");
            } finally {
                setLoading(false);
            }
        };

        fetchMovies();
    }, []);

    // 3. FUNGSI HANDLER NAVIGASI
    const handleBookTicket = (film) => {
        // Mengarahkan ke halaman pesan tiket dengan membawa data film (state)
        navigate('/book-ticket', { 
            state: { 
                movie: film 
            } 
        });
    };

    // Tentukan film mana yang ditampilkan berdasarkan tab aktif
    const films = activeTab === "now_playing" ? nowPlayingFilms : comingSoonFilms;

    return (
        <Container className="mt-5 pt-4" style={{ maxWidth: "1200px" }}>
            {/* Header */}
            <Row className="mb-4">
                <Col>
                    <div className="d-flex align-items-center mb-2">
                        <Badge 
                            bg="light" 
                            text="dark"
                            style={{ 
                                fontSize: "12px",
                                padding: "6px 12px",
                                border: "1px solid rgba(255,255,255,0.2)",
                                background: "rgba(255,255,255,0.9)" 
                            }}
                        >
                            JABODETABEK
                        </Badge>
                    </div>
                    
                    <nav aria-label="breadcrumb">
                        <ol className="breadcrumb" style={{ fontSize: "14px", marginBottom: "5px" }}>
                            <li className="breadcrumb-item">
                                <a href="/" style={{ textDecoration: "none", color: "rgba(255,255,255,0.6)" }}>
                                    Beranda
                                </a>
                            </li>
                            <li className="breadcrumb-item active" style={{ color: "white" }}>Film</li>
                        </ol>
                    </nav>
                    
                    <h2 className="fw-bold text-white" style={{ fontSize: "32px", letterSpacing: "0.5px" }}>Film</h2>
                </Col>
            </Row>

            {/* Tab Navigation */}
            <Row className="mb-4">
                <Col>
                    <div className="d-flex border-bottom" style={{ borderColor: "rgba(255,255,255,0.1)" }}>
                        <Button
                            variant="link"
                            className="text-decoration-none px-3 py-2 fw-bold"
                            style={{
                                color: activeTab === "now_playing" ? "#fff" : "rgba(255,255,255,0.5)",
                                borderBottom: activeTab === "now_playing" ? "3px solid #a78bfa" : "3px solid transparent",
                                borderRadius: 0,
                                transition: "all 0.3s ease"
                            }}
                            onClick={() => setActiveTab("now_playing")}
                        >
                            Lagi tayang
                        </Button>
                        <Button
                            variant="link"
                            className="text-decoration-none px-3 py-2 fw-bold"
                            style={{
                                color: activeTab === "coming_soon" ? "#fff" : "rgba(255,255,255,0.5)",
                                borderBottom: activeTab === "coming_soon" ? "3px solid #a78bfa" : "3px solid transparent",
                                borderRadius: 0,
                                transition: "all 0.3s ease"
                            }}
                            onClick={() => setActiveTab("coming_soon")}
                        >
                            Akan tayang
                        </Button>
                    </div>
                </Col>
            </Row>

            {/* Content Area */}
            {loading ? (
                <div className="text-center py-5">
                    <Spinner animation="border" variant="light" />
                    <p className="mt-3 text-white-50">Sedang memuat film...</p>
                </div>
            ) : error ? (
                <Alert variant="danger" className="text-center bg-transparent border-danger text-danger">
                    {error}
                </Alert>
            ) : films.length === 0 ? (
                <div className="text-center py-5 text-white-50">
                    <h4>Belum ada film di kategori ini.</h4>
                </div>
            ) : (
                <Row>
                    {films.map((film) => (
                        <Col key={film.id} xs={12} sm={6} md={4} lg={3} className="mb-4">
                            <Card 
                                className="h-100 border-0" 
                                style={{ 
                                    borderRadius: "16px",
                                    overflow: "hidden",
                                    transition: "transform 0.3s ease, box-shadow 0.3s ease",
                                    background: "rgba(255, 255, 255, 0.05)", 
                                    backdropFilter: "blur(10px)",
                                    border: "1px solid rgba(255, 255, 255, 0.1)",
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = "translateY(-8px)";
                                    e.currentTarget.style.boxShadow = "0 10px 20px rgba(0,0,0,0.3)";
                                    e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.3)";
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = "translateY(0)";
                                    e.currentTarget.style.boxShadow = "none";
                                    e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.1)";
                                }}
                            >
                                {/* Film Image */}
                                <div style={{ position: "relative", overflow: "hidden" }}>
                                    <Card.Img 
                                        variant="top" 
                                        src={film.image} 
                                        style={{ 
                                            height: "320px", 
                                            objectFit: "cover",
                                            width: "100%"
                                        }}
                                        onError={(e) => { e.target.src = "https://placehold.co/300x450/2a2a3d/ffffff?text=No+Image"; }}
                                    />
                                    {/* Overlay Gradient Halus */}
                                    <div style={{
                                        position: "absolute",
                                        bottom: 0,
                                        left: 0,
                                        width: "100%",
                                        height: "30%",
                                        background: "linear-gradient(to top, rgba(0,0,0,0.8), transparent)"
                                    }}></div>
                                </div>

                                <Card.Body className="p-3 d-flex flex-column">
                                    {/* Film Title */}
                                    <Card.Title 
                                        className="fw-bold mb-2 text-white" 
                                        style={{ 
                                            fontSize: "16px",
                                            lineHeight: "1.4",
                                            minHeight: "44px",
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
                                        <small className="d-block" style={{ fontSize: "12px", color: "rgba(255,255,255,0.6)" }}>
                                            {film.genre}
                                        </small>
                                        <small style={{ fontSize: "12px", color: "rgba(255,255,255,0.6)" }}>
                                            {film.duration}
                                        </small>
                                    </div>

                                    {/* Action Button */}
                                    <div className="mt-auto">
                                        <Button 
                                            className="w-100"
                                            style={{
                                                background: "linear-gradient(90deg, #6a11cb 0%, #2575fc 100%)",
                                                border: "none",
                                                borderRadius: "50px", 
                                                padding: "8px",
                                                fontSize: "14px",
                                                fontWeight: "600",
                                                boxShadow: "0 4px 15px rgba(37, 117, 252, 0.3)"
                                            }}
                                            // 4. PASANG EVENT ONCLICK DI SINI
                                            onClick={() => {
                                                if (activeTab === "now_playing") {
                                                    handleBookTicket(film);
                                                } else {
                                                    alert(`Pengingat untuk ${film.title} diaktifkan! (Simulasi)`);
                                                }
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
            )}

            {/* Info Text */}
            {!loading && (
                <Row className="mt-4 mb-5">
                    <Col>
                        <div className="text-center">
                            <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.4)" }}>
                                {films.length} film {activeTab === "now_playing" ? "sedang tayang" : "akan tayang"} di TixifyID
                            </p>
                        </div>
                    </Col>
                </Row>
            )}
        </Container>
    );
};

export default FilmPage;