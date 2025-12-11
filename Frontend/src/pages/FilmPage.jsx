import { useState, useEffect } from "react";
import { Container, Row, Col, Card, Badge, Button, Spinner, Alert } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner"; // Impor toast untuk notifikasi

const FilmPage = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("now_playing");
    const [nowPlayingFilms, setNowPlayingFilms] = useState([]);
    const [comingSoonFilms, setComingSoonFilms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const API_URL = 'http://localhost:8000/api/films';
    const STORAGE_URL = 'http://localhost:8000/storage/';

    const getImageUrl = (path) => {
        if (!path) return "https://placehold.co/300x450/2a2a3d/ffffff?text=No+Image";
        if (path.startsWith('http')) return path;
        return `${STORAGE_URL}${path}`;
    };

    const handleImageError = (e) => {
        e.target.onerror = null;
        e.target.src = "https://placehold.co/300x450/2a2a3d/ffffff?text=No+Image";
    };

    useEffect(() => {
        const fetchMovies = async () => {
            try {
                setLoading(true);
                const response = await axios.get(API_URL, { timeout: 5000 });
                const movies = Array.isArray(response.data) ? response.data : (response.data.data || []);

                const showing = movies.filter(m => m.status === 'showing');
                const coming = movies.filter(m => m.status === 'coming soon');

                setNowPlayingFilms(showing.map(m => ({
                    id: String(m.id_film), 
                    title: m.judul,
                    image: getImageUrl(m.cover_path),
                    genre: m.genre,
                    duration: m.durasi_film
                })));

                setComingSoonFilms(coming.map(m => ({
                    id: String(m.id_film), 
                    title: m.judul,
                    image: getImageUrl(m.cover_path),
                    genre: m.genre,
                    duration: m.durasi_film
                })));

            } catch (err) {
                console.error("Error fetching films:", err);
                setError("Gagal memuat data film. Pastikan server backend berjalan.");
            } finally {
                setLoading(false);
            }
        };
        fetchMovies();
    }, []);

    // HANDLER: Pindah ke halaman pilih jadwal
    const handleBookTicket = (film) => {
        navigate('/select-schedule', { state: { movie: film } });
    };

    // HANDLER: Notify Me (diganti dari alert)
    const handleNotifyMe = () => {
        toast.info("Pengingat untuk film ini sudah diaktifkan! Kami akan mengabari Anda.");
    };

    const films = activeTab === "now_playing" ? nowPlayingFilms : comingSoonFilms;

    return (
        <Container className="mt-5 pt-4" style={{ maxWidth: "1200px" }}>
            {/* Header & Tabs */}
            <Row className="mb-4">
                <Col>
                    <div className="d-flex align-items-center mb-2">
                        <Badge bg="light" text="dark" className="border border-white-50">JABODETABEK</Badge>
                    </div>
                    <h2 className="fw-bold text-white">Film</h2>
                </Col>
            </Row>

            <Row className="mb-4">
                <Col>
                    <div className="d-flex border-bottom" style={{ borderColor: "rgba(255,255,255,0.1)" }}>
                        <Button
                            variant="link"
                            className="text-decoration-none px-3 py-2 fw-bold"
                            style={{
                                color: activeTab === "now_playing" ? "#fff" : "rgba(255,255,255,0.5)",
                                borderBottom: activeTab === "now_playing" ? "3px solid #a78bfa" : "3px solid transparent",
                                transition: "all 0.3s"
                            }}
                            onClick={() => setActiveTab("now_playing")}
                        >
                            Lagi Tayang
                        </Button>
                        <Button
                            variant="link"
                            className="text-decoration-none px-3 py-2 fw-bold"
                            style={{
                                color: activeTab === "coming_soon" ? "#fff" : "rgba(255,255,255,0.5)",
                                borderBottom: activeTab === "coming_soon" ? "3px solid #a78bfa" : "3px solid transparent",
                                transition: "all 0.3s"
                            }}
                            onClick={() => setActiveTab("coming_soon")}
                        >
                            Akan Tayang
                        </Button>
                    </div>
                </Col>
            </Row>

            {/* List Films */}
            {loading ? <Spinner animation="border" variant="light" className="d-block mx-auto" /> :
                error ? <Alert variant="danger" className="text-center">{error}</Alert> :
                    films.length === 0 ? <p className="text-center text-white-50">Tidak ada film tersedia.</p> :
                        <Row>
                            {films.map((film) => (
                                <Col key={film.id} xs={12} sm={6} md={4} lg={3} className="mb-4">
                                    <Card className="h-100 border-0" style={{
                                        background: "rgba(255, 255, 255, 0.05)",
                                        backdropFilter: "blur(10px)",
                                        border: "1px solid rgba(255, 255, 255, 0.1)",
                                        borderRadius: "16px",
                                        overflow: "hidden"
                                    }}>
                                        <div style={{ position: "relative", height: "320px", overflow: "hidden" }}>
                                            <Card.Img
                                                variant="top"
                                                src={film.image}
                                                style={{ height: "100%", objectFit: "cover" }}
                                                onError={handleImageError}
                                            />
                                            <div style={{ position: "absolute", bottom: 0, left: 0, width: "100%", height: "50%", background: "linear-gradient(to top, rgba(0,0,0,0.9), transparent)" }}></div>
                                        </div>
                                        <Card.Body className="p-3 d-flex flex-column">
                                            <Card.Title className="fw-bold text-white fs-6 mb-2 text-truncate">{film.title}</Card.Title>
                                            <small className="text-white-50 mb-3 d-block">{film.genre} | {film.duration}</small>
                                            <Button
                                                className="w-100 mt-auto rounded-pill border-0"
                                                style={{ background: "linear-gradient(90deg, #6a11cb 0%, #2575fc 100%)", fontSize: "14px", fontWeight: "600" }}
                                                onClick={() => activeTab === "now_playing" ? handleBookTicket(film) : handleNotifyMe()}
                                            >
                                                {activeTab === "now_playing" ? "Pesan Tiket" : "Notify Me"}
                                            </Button>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            ))}
                        </Row>
            }
        </Container>
    );
};

export default FilmPage;