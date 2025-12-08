import { useState, useEffect } from "react";
import { Container, Row, Col, Card, Button, Badge } from "react-bootstrap";
import { useNavigate, useLocation } from "react-router-dom"; 
import SeatSelection from "../components/SeatSelection";
import { toast } from "sonner";

const PesanTiketPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    
    // MENANGKAP DATA FILM DARI HALAMAN SEBELUMNYA
    const { movie } = location.state || {}; 

    // Jika user langsung akses URL tanpa klik film, redirect atau pakai dummy
    useEffect(() => {
        if (!movie) {
            toast.error("Silakan pilih film terlebih dahulu");
            navigate('/movies');
        }
    }, [movie, navigate]);

    if (!movie) return null; // Prevent render before redirect

    const movieDetails = {
        title: movie.title || "Judul Film",
        studio: "Studio 1", // (Nanti bisa dinamis dari API jadwal)
        date: new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }),
        time: "14:00 WIB",  // (Nanti dinamis)
        price: 50000, 
        poster: movie.image || "https://placehold.co/300x450/2a2a3d/ffffff?text=No+Image", 
        genre: movie.genre || "Genre"
    };

    const bookedSeatsFromDB = ['C4', 'C5', 'D3', 'D4', 'E7', 'E8']; 

    const [selectedSeats, setSelectedSeats] = useState([]);
    const [totalPrice, setTotalPrice] = useState(0);
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        setTotalPrice(selectedSeats.length * movieDetails.price);
    }, [selectedSeats]);

    const handleSeatSelect = (seatId) => {
        if (selectedSeats.includes(seatId)) {
            setSelectedSeats(prev => prev.filter(id => id !== seatId));
        } else {
            if (selectedSeats.length >= 6) {
                toast.warning("Maksimal pilih 6 kursi sekaligus.");
                return;
            }
            setSelectedSeats(prev => [...prev, seatId]);
        }
    };

    const handleCheckout = () => {
        if (selectedSeats.length === 0) {
            toast.error("Pilih minimal 1 kursi!");
            return;
        }

        setIsProcessing(true);
        
        setTimeout(() => {
            setIsProcessing(false);
            toast.success(`Pembelian Tiket ${movieDetails.title} Berhasil!`);
            setSelectedSeats([]);
            navigate('/');
        }, 2000);
    };

    return (
        <Container className="mt-5 pt-4 mb-5" style={{ maxWidth: "1200px" }}>
            <Row className="gy-4">
                <Col lg={8}>
                    <Card className="border-0 h-100" style={{ 
                        background: "rgba(255, 255, 255, 0.05)", 
                        backdropFilter: "blur(10px)",
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                        borderRadius: "16px"
                    }}>
                        <Card.Body className="p-4 p-md-5">
                            <h4 className="text-white fw-bold mb-4 text-center">Pilih Kursi</h4>
                            
                            <SeatSelection 
                                selectedSeats={selectedSeats} 
                                onSeatSelect={handleSeatSelect}
                                bookedSeats={bookedSeatsFromDB} 
                            />
                        </Card.Body>
                    </Card>
                </Col>

                <Col lg={4}>
                    <Card className="border-0 shadow-lg" style={{ 
                        background: "rgba(30, 30, 47, 0.95)", 
                        backdropFilter: "blur(20px)",
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                        borderRadius: "16px",
                        position: "sticky",
                        top: "100px" 
                    }}>
                        <div style={{ height: "150px", overflow: "hidden", borderRadius: "16px 16px 0 0", position: "relative" }}>
                            <img 
                                src={movieDetails.poster} 
                                alt="Poster" 
                                style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.7 }}
                            />
                            <div style={{ position: "absolute", bottom: 0, left: 0, width: "100%", height: "100%", background: "linear-gradient(to top, #1e1e2f 0%, transparent 100%)" }}></div>
                        </div>

                        <Card.Body className="p-4">
                            <h5 className="text-white fw-bold mb-1">{movieDetails.title}</h5>
                            <p className="text-white-50 small mb-3">{movieDetails.genre}</p>

                            <div className="d-flex justify-content-between mb-2">
                                <span className="text-white-50"><i className="bi bi-geo-alt me-2"></i>Studio</span>
                                <span className="text-white fw-medium">{movieDetails.studio}</span>
                            </div>
                            <div className="d-flex justify-content-between mb-3">
                                <span className="text-white-50"><i className="bi bi-calendar3 me-2"></i>Waktu</span>
                                <span className="text-white fw-medium">{movieDetails.time}</span>
                            </div>

                            <hr style={{ borderColor: "rgba(255,255,255,0.1)" }} />

                            <div className="mb-3">
                                <span className="text-white-50 d-block mb-2">Kursi Dipilih:</span>
                                <div className="d-flex flex-wrap gap-2">
                                    {selectedSeats.length > 0 ? (
                                        selectedSeats.sort().map(seat => (
                                            <Badge key={seat} bg="primary" style={{ background: "#a78bfa !important", color: "white" }}>
                                                {seat}
                                            </Badge>
                                        ))
                                    ) : (
                                        <span className="text-white-50 fst-italic small">- Belum ada kursi dipilih -</span>
                                    )}
                                </div>
                            </div>

                            <div className="d-flex justify-content-between align-items-center mt-4 p-3 rounded" style={{ background: "rgba(255,255,255,0.05)" }}>
                                <span className="text-white">Total Bayar</span>
                                <span className="text-white fw-bold fs-5">
                                    Rp {totalPrice.toLocaleString('id-ID')}
                                </span>
                            </div>

                            <Button 
                                className="w-100 mt-4 py-3 fw-bold"
                                style={{
                                    background: "linear-gradient(90deg, #6a11cb 0%, #2575fc 100%)",
                                    border: "none",
                                    borderRadius: "50px",
                                    boxShadow: "0 4px 15px rgba(37, 117, 252, 0.4)",
                                    transition: "transform 0.2s"
                                }}
                                onClick={handleCheckout}
                                disabled={isProcessing || selectedSeats.length === 0}
                                onMouseEnter={(e) => e.target.style.transform = "scale(1.02)"}
                                onMouseLeave={(e) => e.target.style.transform = "scale(1)"}
                            >
                                {isProcessing ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-2"></span>
                                        Memproses...
                                    </>
                                ) : (
                                    "Bayar Sekarang"
                                )}
                            </Button>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default PesanTiketPage;