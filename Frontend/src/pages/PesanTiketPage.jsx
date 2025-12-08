import { useState, useEffect } from "react";
import { Container, Row, Col, Card, Button, Badge } from "react-bootstrap";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";

const PilihJadwalPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    
    // Ambil data film dari halaman sebelumnya
    const { movie } = location.state || {};

    // Redirect jika user akses langsung tanpa pilih film
    useEffect(() => {
        if (!movie) {
            toast.error("Silakan pilih film terlebih dahulu");
            navigate('/movies');
        }
    }, [movie, navigate]);

    if (!movie) return null;

    // --- DUMMY DATA JADWAL (Nanti diganti API) ---
    // Di real case, Anda akan fetch ke /api/films/{id}/schedules
    const availableDates = [
        { date: "2023-10-25", label: "Hari Ini" },
        { date: "2023-10-26", label: "Besok" },
        { date: "2023-10-27", label: "Jumat" },
    ];

    const studios = [
        {
            id: 1,
            name: "Studio 1 (Reguler)",
            price: 40000,
            times: ["10:30", "13:00", "15:30", "18:00", "20:30"]
        },
        {
            id: 2,
            name: "Studio 2 (VIP)",
            price: 75000,
            times: ["12:00", "15:00", "19:00"]
        },
        {
            id: 3,
            name: "Studio 3 (IMAX)",
            price: 60000,
            times: ["14:00", "17:00", "20:00"]
        }
    ];

    const [selectedDate, setSelectedDate] = useState(availableDates[0].date);
    const [selectedTime, setSelectedTime] = useState(null);
    const [selectedStudio, setSelectedStudio] = useState(null);

    const handleTimeSelect = (studio, time) => {
        setSelectedStudio(studio);
        setSelectedTime(time);
    };

    const handleNext = () => {
        if (!selectedDate || !selectedTime || !selectedStudio) {
            toast.error("Pilih jadwal tayang terlebih dahulu!");
            return;
        }

        // Lanjut ke Pilih Kursi dengan membawa SEMUA data
        navigate('/book-ticket', {
            state: {
                movie: movie,
                schedule: {
                    date: selectedDate,
                    time: selectedTime,
                    studio: selectedStudio.name,
                    price: selectedStudio.price,
                    studio_id: selectedStudio.id
                }
            }
        });
    };

    return (
        <Container className="mt-5 pt-4 mb-5" style={{ maxWidth: "1000px" }}>
            {/* Header Film Info */}
            <Card className="border-0 mb-4" style={{ 
                background: "rgba(255, 255, 255, 0.05)", 
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                borderRadius: "16px"
            }}>
                <Card.Body className="p-4">
                    <Row>
                        <Col md={3} className="text-center text-md-start mb-3 mb-md-0">
                            <img 
                                src={movie.image} 
                                alt={movie.title} 
                                style={{ width: "100%", maxWidth: "180px", borderRadius: "12px", boxShadow: "0 8px 20px rgba(0,0,0,0.3)" }}
                            />
                        </Col>
                        <Col md={9}>
                            <Badge bg="warning" text="dark" className="mb-2">SEDANG TAYANG</Badge>
                            <h2 className="text-white fw-bold mb-2">{movie.title}</h2>
                            <p className="text-white-50 mb-1"><i className="bi bi-clock me-2"></i>{movie.duration || "120 min"}</p>
                            <p className="text-white-50 mb-3"><i className="bi bi-film me-2"></i>{movie.genre || "Genre"}</p>
                            
                            <hr className="border-secondary" />
                            
                            <h5 className="text-white mb-3">Pilih Tanggal</h5>
                            <div className="d-flex gap-2 flex-wrap mb-4">
                                {availableDates.map((item) => (
                                    <Button 
                                        key={item.date}
                                        variant={selectedDate === item.date ? "primary" : "outline-light"}
                                        onClick={() => {
                                            setSelectedDate(item.date);
                                            setSelectedTime(null); // Reset jam jika ganti tanggal
                                        }}
                                        className={selectedDate === item.date ? "fw-bold px-4" : "text-white-50 px-4"}
                                        style={{ borderRadius: "50px" }}
                                    >
                                        {item.label} <br/> <small style={{ fontSize: "0.75rem" }}>{item.date}</small>
                                    </Button>
                                ))}
                            </div>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>

            {/* List Studio & Jam */}
            <h4 className="text-white fw-bold mb-3">Pilih Jadwal & Studio</h4>
            <Row>
                {studios.map((studio) => (
                    <Col md={12} className="mb-3" key={studio.id}>
                        <Card className="border-0" style={{ 
                            background: "rgba(30, 30, 40, 0.6)", 
                            borderRadius: "12px",
                            borderLeft: "4px solid #a78bfa"
                        }}>
                            <Card.Body className="p-4">
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                    <h5 className="text-white mb-0">{studio.name}</h5>
                                    <Badge bg="dark" className="border border-secondary px-3 py-2">
                                        Rp {studio.price.toLocaleString('id-ID')}
                                    </Badge>
                                </div>
                                <div className="d-flex flex-wrap gap-3">
                                    {studio.times.map((time) => {
                                        const isSelected = selectedStudio?.id === studio.id && selectedTime === time;
                                        return (
                                            <Button
                                                key={time}
                                                variant={isSelected ? "success" : "outline-light"}
                                                className="px-4 py-2"
                                                style={{ 
                                                    borderRadius: "8px", 
                                                    minWidth: "80px",
                                                    background: isSelected ? "linear-gradient(90deg, #6a11cb 0%, #2575fc 100%)" : "transparent",
                                                    border: isSelected ? "none" : "1px solid rgba(255,255,255,0.2)"
                                                }}
                                                onClick={() => handleTimeSelect(studio, time)}
                                            >
                                                {time}
                                            </Button>
                                        );
                                    })}
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>

            {/* Footer Action */}
            <div className="fixed-bottom p-3 bg-dark border-top border-secondary shadow-lg">
                <Container style={{ maxWidth: "1000px" }}>
                    <div className="d-flex justify-content-between align-items-center">
                        <div>
                            <small className="text-white-50 d-block">Jadwal Dipilih:</small>
                            <span className="text-white fw-bold">
                                {selectedDate && selectedTime 
                                    ? `${selectedDate}, ${selectedTime} (${selectedStudio?.name})` 
                                    : "-"}
                            </span>
                        </div>
                        <Button 
                            size="lg" 
                            disabled={!selectedDate || !selectedTime}
                            onClick={handleNext}
                            style={{
                                background: "linear-gradient(90deg, #6a11cb 0%, #2575fc 100%)",
                                border: "none",
                                borderRadius: "50px",
                                paddingLeft: "40px",
                                paddingRight: "40px"
                            }}
                        >
                            Pilih Kursi <i className="bi bi-arrow-right ms-2"></i>
                        </Button>
                    </div>
                </Container>
            </div>
        </Container>
    );
};

export default PilihJadwalPage;