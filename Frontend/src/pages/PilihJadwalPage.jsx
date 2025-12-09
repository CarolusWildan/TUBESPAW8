import { useState, useEffect } from "react";
import { Container, Row, Col, Card, Button, Badge, Spinner } from "react-bootstrap";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import axios from "axios";

const PilihJadwalPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { movie } = location.state || {}; // Menerima objek 'movie'

    const [schedules, setSchedules] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // LOGIC: Gunakan Waktu Lokal (WIB/Local)
    const getLocalDate = () => {
        const date = new Date();
        const offset = date.getTimezoneOffset();
        const localDate = new Date(date.getTime() - (offset * 60 * 1000));
        return localDate.toISOString().split('T')[0];
    };

    const [selectedDate, setSelectedDate] = useState(getLocalDate());

    const API_BASE = 'http://localhost:8000/api';

    useEffect(() => {
        if (!movie) {
            toast.error("Silakan pilih film terlebih dahulu");
            navigate('/movies');
            return;
        }

        const fetchSchedules = async () => {
            try {
                // Tambahkan timeout untuk mencegah hang tak terbatas jika server mati
                const response = await axios.get(`${API_BASE}/jadwal`, { timeout: 5000 }); 
                const allSchedules = Array.isArray(response.data) ? response.data : (response.data.data || []);

                // LOGIC: Loose equality (==) untuk safety tipe data ID
                const movieSchedules = allSchedules.filter(s => 
                    s.id_film == movie.id || s.film?.id_film == movie.id
                );

                setSchedules(movieSchedules);
            } catch (err) {
                console.error("Gagal ambil jadwal:", err);
                toast.error("Gagal memuat jadwal dari server.");
                setSchedules([]); 
            } finally {
                setLoading(false);
            }
        };

        fetchSchedules();
    }, [movie, navigate]);

    if (!movie) return null;

    // Filter & Grouping
    const filteredSchedules = schedules.filter(s => s.tanggal_tayang === selectedDate);
    
    const schedulesByStudio = filteredSchedules.reduce((acc, curr) => {
        const studioName = curr.studio?.nama_studio || `Studio ${curr.id_studio}`;
        if (!acc[studioName]) acc[studioName] = [];
        acc[studioName].push(curr);
        return acc;
    }, {});

    const handleSelectSchedule = (schedule) => {
        navigate('/book-ticket', {
            state: {
                movie: movie, // Meneruskan objek movie yang sudah ada (PENTING!)
                schedule: {
                    // ID Jadwal diubah menjadi string di sini untuk konsistensi React/Browser
                    id: String(schedule.id_jadwal), 
                    id_jadwal: String(schedule.id_jadwal),
                    date: schedule.tanggal_tayang,
                    time: schedule.jam_tayang ? schedule.jam_tayang.substring(0, 5) : "00:00",
                    studio: schedule.studio?.nama_studio || "Studio",
                    price: schedule.harga,
                    studio_id: String(schedule.id_studio)
                }
            }
        });
    };

    // Helper Tanggal yang lebih Kaya (Untuk UI Hari/Tanggal)
    const getDates = () => {
        const dates = [];
        const today = new Date();
        const days = ['MINGGU', 'SENIN', 'SELASA', 'RABU', 'KAMIS', 'JUMAT', 'SABTU'];
        const months = ['JAN', 'FEB', 'MAR', 'APR', 'MEI', 'JUN', 'JUL', 'AGU', 'SEP', 'OKT', 'NOV', 'DES'];

        for (let i = 0; i < 5; i++) { // Tampilkan 5 hari ke depan
            const date = new Date(today);
            date.setDate(today.getDate() + i);
            
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            const fullDate = `${year}-${month}-${day}`;

            dates.push({
                fullDate: fullDate,
                dayName: i === 0 ? "HARI INI" : days[date.getDay()],
                dateNum: date.getDate(),
                monthName: months[date.getMonth()]
            });
        }
        return dates;
    };

    return (
        <div style={{ minHeight: "100vh", position: "relative", backgroundColor: "#0b0e14", overflowX: "hidden" }}>
            
            {/* 1. BACKGROUND IMMERSIVE (Poster diburamkan) */}
            <div 
                style={{
                    position: "fixed",
                    top: 0, left: 0, right: 0, bottom: 0,
                    backgroundImage: `url(${movie.image})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    filter: "blur(40px) brightness(0.3)",
                    zIndex: 0,
                    transform: "scale(1.1)" // Mencegah white edge saat blur
                }}
            />

            {/* Content Wrapper */}
            <div style={{ position: "relative", zIndex: 1 }}>
                
                {/* 2. HERO SECTION & HEADER */}
                <div className="pt-4 pb-5" style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.6), transparent)" }}>
                    <Container>
                        <Button 
                            variant="link" 
                            className="text-white text-decoration-none p-0 mb-4 d-flex align-items-center gap-2"
                            onClick={() => navigate(-1)}
                        >
                            <i className="bi bi-arrow-left fs-4"></i>
                            <span className="fw-medium">Kembali</span>
                        </Button>

                        <Row className="align-items-end">
                            {/* Poster Floating */}
                            <Col md={3} className="d-none d-md-block">
                                <div style={{ position: "relative" }}>
                                    <img 
                                        src={movie.image} 
                                        alt={movie.title} 
                                        className="w-100 shadow-lg"
                                        style={{ borderRadius: "16px", aspectRatio: "2/3", objectFit: "cover", border: "1px solid rgba(255,255,255,0.2)" }}
                                    />
                                    <div className="position-absolute top-0 end-0 m-3">
                                        <Badge bg="warning" text="dark" className="fs-6 px-3 py-1 shadow-sm">IMAX</Badge>
                                    </div>
                                </div>
                            </Col>

                            {/* Info Film Besar */}
                            <Col md={9}>
                                <Badge bg="transparent" border="light" className="text-white-50 mb-2 px-3 py-2 border-secondary">
                                    {movie.genre}
                                </Badge>
                                <h1 className="display-4 fw-bold text-white mb-3" style={{ textShadow: "0 2px 10px rgba(0,0,0,0.5)" }}>
                                    {movie.title}
                                </h1>
                                
                                <div className="d-flex align-items-center gap-4 text-white-50 mb-4">
                                    <div className="d-flex align-items-center gap-2">
                                        <i className="bi bi-clock"></i>
                                        <span>{movie.duration || "120 Menit"}</span>
                                    </div>
                                    <div className="d-flex align-items-center gap-2">
                                        <i className="bi bi-star-fill text-warning"></i>
                                        <span>8.9 / 10</span>
                                    </div>
                                    <div className="d-flex align-items-center gap-2">
                                        <i className="bi bi-shield-exclamation"></i>
                                        <span>D17+</span>
                                    </div>
                                </div>
                            </Col>
                        </Row>
                    </Container>
                </div>

                {/* 3. DATE SELECTOR (Modern Horizontal Strip) */}
                <Container className="mb-5">
                    <h5 className="text-white fw-bold mb-3 ms-1">Pilih Tanggal</h5>
                    <div className="d-flex gap-3 overflow-auto pb-3 custom-scrollbar">
                        {getDates().map((item) => {
                            const isActive = selectedDate === item.fullDate;
                            return (
                                <div 
                                    key={item.fullDate}
                                    onClick={() => setSelectedDate(item.fullDate)}
                                    style={{
                                        minWidth: "90px",
                                        cursor: "pointer",
                                        background: isActive ? "linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)" : "rgba(255, 255, 255, 0.05)",
                                        border: isActive ? "none" : "1px solid rgba(255,255,255,0.1)",
                                        borderRadius: "16px",
                                        padding: "16px 12px",
                                        textAlign: "center",
                                        transition: "all 0.3s ease",
                                        transform: isActive ? "translateY(-5px)" : "none",
                                        boxShadow: isActive ? "0 10px 20px -5px rgba(37, 117, 252, 0.5)" : "none"
                                    }}
                                >
                                    <div className={`small fw-bold mb-1 ${isActive ? "text-white" : "text-white-50"}`} style={{ fontSize: "0.7rem", letterSpacing: "1px" }}>
                                        {item.dayName}
                                    </div>
                                    <div className="fs-3 fw-bold text-white lh-1">
                                        {item.dateNum}
                                    </div>
                                    <div className={`small ${isActive ? "text-white-50" : "text-secondary"}`}>
                                        {item.monthName}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </Container>

                {/* 4. SCHEDULE LIST (Glassmorphism Cards) */}
                <Container className="pb-5">
                    {loading ? (
                        <div className="text-center py-5">
                            <Spinner animation="grow" variant="primary" />
                            <p className="text-white-50 mt-3">Mencari jadwal terbaik...</p>
                        </div>
                    ) : Object.keys(schedulesByStudio).length > 0 ? (
                        <Row>
                            {Object.keys(schedulesByStudio).map((studioName) => (
                                <Col lg={6} key={studioName} className="mb-4">
                                    <div 
                                        className="p-4 h-100"
                                        style={{
                                            background: "rgba(20, 20, 30, 0.6)",
                                            backdropFilter: "blur(10px)",
                                            borderRadius: "20px",
                                            border: "1px solid rgba(255,255,255,0.08)",
                                            boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.3)"
                                        }}
                                    >
                                        <div className="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom border-secondary" style={{ borderColor: "rgba(255,255,255,0.1) !important" }}>
                                            <div className="d-flex align-items-center gap-3">
                                                <div className="bg-white text-dark rounded-circle d-flex align-items-center justify-content-center fw-bold" style={{ width: 40, height: 40 }}>
                                                    <i className="bi bi-camera-reels-fill"></i>
                                                </div>
                                                <div>
                                                    <h5 className="text-white mb-0 fw-bold">{studioName}</h5>
                                                    <small className="text-white-50">Dolby Atmos 7.1</small>
                                                </div>
                                            </div>
                                            <div className="text-end">
                                                <small className="text-white-50 d-block">Harga Tiket</small>
                                                <span className="text-warning fw-bold fs-5">
                                                    Rp {schedulesByStudio[studioName][0].harga.toLocaleString('id-ID')}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="d-flex flex-wrap gap-3">
                                            {schedulesByStudio[studioName].map((sched) => (
                                                <Button
                                                    key={sched.id_jadwal}
                                                    variant="outline-light"
                                                    className="py-2 px-4 position-relative overflow-hidden group"
                                                    style={{ 
                                                        borderRadius: "12px", 
                                                        minWidth: "90px", 
                                                        border: "1px solid rgba(255,255,255,0.2)",
                                                        background: "rgba(255,255,255,0.03)"
                                                    }}
                                                    onClick={() => handleSelectSchedule(sched)}
                                                >
                                                    <span className="fw-bold fs-5">{sched.jam_tayang.substring(0, 5)}</span>
                                                    <div className="small text-white-50" style={{ fontSize: "0.7rem" }}>WIB</div>
                                                </Button>
                                            ))}
                                        </div>
                                    </div>
                                </Col>
                            ))}
                        </Row>
                    ) : (
                        <div className="text-center py-5 rounded-4" style={{ background: "rgba(255,255,255,0.05)", border: "1px dashed rgba(255,255,255,0.2)" }}>
                            <i className="bi bi-calendar-x fs-1 text-secondary mb-3 d-block"></i>
                            <h4 className="text-white">Jadwal Kosong</h4>
                            <p className="text-white-50">Tidak ada penayangan film ini pada tanggal <strong>{selectedDate}</strong>.</p>
                            <Button variant="outline-light" size="sm" onClick={() => setSelectedDate(getLocalDate())}>
                                Cek Hari Ini
                            </Button>
                        </div>
                    )}
                </Container>
            </div>
        </div>
    );
};

export default PilihJadwalPage;