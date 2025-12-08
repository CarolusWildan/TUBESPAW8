import { useState, useEffect } from "react";
import { Container, Row, Col, Card, Button, Badge } from "react-bootstrap";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";

const PilihJadwalPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { movie } = location.state || {};

    useEffect(() => {
        if (!movie) {
            toast.error("Silakan pilih film terlebih dahulu");
            navigate('/movies');
        }
    }, [movie, navigate]);

    if (!movie) return null;

    const availableDates = [
        { date: "2023-10-25", label: "Hari Ini" },
        { date: "2023-10-26", label: "Besok" },
    ];

    const studios = [
        { id: 1, name: "Studio 1", price: 40000, times: ["10:30", "13:00", "15:30"] },
        { id: 2, name: "Studio 2", price: 75000, times: ["12:00", "15:00", "19:00"] },
    ];

    const [selectedDate, setSelectedDate] = useState(availableDates[0].date);
    const [selectedTime, setSelectedTime] = useState(null);
    const [selectedStudio, setSelectedStudio] = useState(null);

    const handleNext = () => {
        if (!selectedDate || !selectedTime || !selectedStudio) {
            toast.error("Pilih jadwal tayang terlebih dahulu!");
            return;
        }
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
            <Card className="border-0 mb-4" style={{ background: "rgba(255, 255, 255, 0.05)", borderRadius: "16px" }}>
                <Card.Body className="p-4">
                    <Row>
                        <Col md={3}><img src={movie.image} alt={movie.title} style={{ width: "100%", borderRadius: "12px" }} /></Col>
                        <Col md={9} className="text-white">
                            <h2 className="fw-bold">{movie.title}</h2>
                            <p className="text-white-50">{movie.genre}</p>
                            <hr className="border-secondary" />
                            <h5>Pilih Tanggal</h5>
                            <div className="d-flex gap-2">
                                {availableDates.map((item) => (
                                    <Button key={item.date} variant={selectedDate === item.date ? "primary" : "outline-light"} onClick={() => setSelectedDate(item.date)}>{item.label}</Button>
                                ))}
                            </div>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>

            <h4 className="text-white mb-3">Pilih Jadwal</h4>
            {studios.map(studio => (
                <Card key={studio.id} className="mb-3 bg-dark text-white border-secondary">
                    <Card.Body>
                        <div className="d-flex justify-content-between">
                            <h5>{studio.name}</h5>
                            <Badge>Rp {studio.price}</Badge>
                        </div>
                        <div className="d-flex gap-2 mt-2">
                            {studio.times.map(time => (
                                <Button 
                                    key={time} 
                                    variant={selectedTime === time && selectedStudio?.id === studio.id ? "success" : "outline-light"} 
                                    onClick={() => { setSelectedTime(time); setSelectedStudio(studio); }}
                                >
                                    {time}
                                </Button>
                            ))}
                        </div>
                    </Card.Body>
                </Card>
            ))}

            <div className="fixed-bottom p-3 bg-dark border-top border-secondary text-end">
                <Button disabled={!selectedTime} onClick={handleNext} variant="primary" className="px-5 rounded-pill">Pilih Kursi</Button>
            </div>
        </Container>
    );
};

export default PilihJadwalPage;