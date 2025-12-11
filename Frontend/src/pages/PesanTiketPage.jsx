import React, { useState, useEffect, useCallback } from "react";
import { Container, Row, Col, Card, Button, Badge, Spinner } from "react-bootstrap";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import axios from "axios";

// --- KOMPONEN INTERNAL SEAT SELECTION ---
const Seat = ({ label, status, onClick }) => {
    let style = {
        width: "32px", height: "32px", borderRadius: "6px", cursor: "pointer",
        display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", fontWeight: "600",
        transition: "all 0.2s",
        color: "white",
        // Default (Available)
        backgroundColor: 'transparent',
        border: '1px solid #6c757d',
        opacity: 1
    };

    if (status === 'sold') {
        style.backgroundColor = '#dc3545'; 
        style.border = 'none'; 
        style.cursor = "not-allowed"; 
        style.opacity = 0.4;
    } else if (status === 'selected') {
        style.backgroundColor = '#2575fc'; 
        style.border = 'none'; 
        style.transform = "scale(1.05)";
    }

    // Tampilkan hanya angka kursi
    const displayLabel = label.replace(/^[A-Z]/, '');

    return (
        <button 
            onClick={onClick} 
            disabled={status === 'sold'}
            className="btn btn-sm p-0 fw-bold"
            style={style} 
            title={`Kursi: ${label}`}
        >
            {displayLabel}
        </button>
    );
};

// Legenda Kursi
const LegendBox = ({ color, border, label, opacity }) => (
    <div className="d-flex align-items-center gap-2">
        <div style={{ width: 15, height: 15, background: color, border: border || 'none', borderRadius: "4px", opacity: opacity || 1 }}></div>
        <small className="text-white-50">{label}</small>
    </div>
);


const SeatSelection = React.memo(({ selectedSeats, onSeatSelect, bookedSeats, studioSeats }) => {
    
    // Group seats by row (Asumsi format A1, A2, B1...)
    const rows = {};
    (studioSeats || []).forEach(seat => {
        const label = seat.nomor_kursi || "";
        const rowLabel = label.charAt(0) || "U"; // U for Unknown
        if (!rows[rowLabel]) rows[rowLabel] = [];
        rows[rowLabel].push(seat);
    });
    
    // Urutkan kunci baris secara alfabetis
    const sortedRowKeys = Object.keys(rows).sort();

    return (
        <div className="w-100 d-flex flex-column align-items-center p-4" style={{ background: "#111827", borderRadius: "16px" }}>
            
            {/* Screen Indicator */}
            <div className="w-75 mb-5 text-center position-relative">
                <div 
                    style={{
                        height: "40px", width: "100%", margin: "0 auto",
                        background: "linear-gradient(180deg, rgba(37, 117, 252, 0.2) 0%, transparent 100%)",
                        clipPath: "polygon(0 0, 100% 0, 85% 100%, 15% 100%)",
                    }}
                />
                <div style={{ height: "4px", width: "80%", margin: "-4px auto 0", background: "#2575fc", borderRadius: "2px", boxShadow: "0 0 15px #2575fc" }} />
                <small className="text-white-50 mt-3 d-block" style={{ letterSpacing: "2px" }}>LAYAR BIOSKOP</small>
            </div>

            {/* Seats Grid */}
            <div className="d-flex flex-column gap-3 overflow-auto" style={{ maxHeight: '50vh' }}>
                {sortedRowKeys.length > 0 ? sortedRowKeys.map(rowLabel => (
                    <div key={rowLabel} className="d-flex align-items-center justify-content-center gap-2">
                        {/* Label Baris */}
                        <span className="text-white-50 fw-bold me-2" style={{width: "20px"}}>{rowLabel}</span>
                        
                        {/* Kursi */}
                        <div className="d-flex gap-2">
                            {rows[rowLabel].map(seat => {
                                const isBooked = bookedSeats.map(String).includes(String(seat.id_kursi));
                                const isSelected = selectedSeats.map(String).includes(String(seat.id_kursi));
                                
                                let status = 'available';
                                if (isBooked) status = 'sold';
                                else if (isSelected) status = 'selected';
                                
                                return (
                                    <Seat
                                        key={seat.id_kursi}
                                        id={seat.id_kursi}
                                        label={seat.nomor_kursi}
                                        status={status}
                                        onClick={() => onSeatSelect(seat.id_kursi)}
                                    />
                                );
                            })}
                        </div>
                    </div>
                )) : (
                    <div className="text-white-50 text-center p-5 border border-dashed border-secondary rounded">
                        <Spinner size="sm" className="me-2"/> Menyiapkan Studio...
                    </div>
                )}
            </div>

            {/* Legend */}
            <div className="d-flex gap-4 mt-5 justify-content-center">
                <LegendBox color="transparent" border="1px solid #6c757d" label="Tersedia" />
                <LegendBox color="#dc3545" opacity={0.4} label="Terisi" />
                <LegendBox color="#2575fc" label="Dipilih" />
            </div>
        </div>
    );
});


const PesanTiketPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    
    // TANGKAP DATA DARI HALAMAN SEBELUMNYA
    const { movie, schedule } = location.state || {};

    // State Data Real
    const [bookedSeats, setBookedSeats] = useState([]);
    const [studioSeats, setStudioSeats] = useState([]); 
    const [selectedSeats, setSelectedSeats] = useState([]); 
    const [selectedSeatLabels, setSelectedSeatLabels] = useState([]);

    const [totalPrice, setTotalPrice] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isUsingDummy, setIsUsingDummy] = useState(false); // Indikator pakai dummy

    const API_BASE = 'http://localhost:8000/api';

    // Helper: Generate Dummy Seats jika Backend 404
    const generateDummySeats = useCallback(() => {
        const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
        const seats = [];
        let idCounter = 1;
        
        rows.forEach(row => {
            for (let i = 1; i <= 10; i++) {
                seats.push({
                    id_kursi: idCounter++,
                    nomor_kursi: `${row}${i}`
                });
            }
        });
        return seats;
    }, []);

    useEffect(() => {
        if (!movie || !schedule) {
            toast.error("Data pemesanan tidak lengkap. Silakan pilih jadwal ulang.");
            navigate('/movies');
            return;
        }

        const fetchScheduleDetails = async () => {
            let usedJadwalId = null; 

            try {
                // Pastikan ID jadwal ada dan diubah ke String jika perlu (untuk konsistensi)
                const jadwalId = String(schedule.id_jadwal || schedule.id || schedule.schedule_id || schedule.jadwal_id);

                usedJadwalId = jadwalId; 

                if (!jadwalId || jadwalId === 'undefined') {
                    throw new Error("ID Jadwal tidak ditemukan atau invalid.");
                }

                // Ambil Token dari localStorage
                const token = localStorage.getItem('auth_token');
                const config = {
                    headers: { 'Authorization': token ? `Bearer ${token}` : '' }
                };

                const url = `${API_BASE}/jadwal/${jadwalId}`;
                
                const response = await axios.get(url, config);
                
                // Normalisasi Response Data
                const responseBody = response.data; 
                const data = responseBody.data || responseBody; 
                
                // Set Data Kursi Terisi
                const currentBookedSeats = Array.isArray(data.booked_seats) ? data.booked_seats.map(String) : [];
                setBookedSeats(currentBookedSeats);

                // Set Data Denah Kursi
                if (data.all_seats && Array.isArray(data.all_seats)) {
                    const normalizedSeats = data.all_seats.map(seat => ({
                        id_kursi: String(seat.id_kursi), // Kunci kursi harus String untuk konsistensi
                        nomor_kursi: seat.nomor_kursi || seat.kode_kursi || "??" 
                    }));
                    setStudioSeats(normalizedSeats);
                } else {
                    // Jika all_seats kosong/tidak valid, gunakan dummy seats
                    console.warn("⚠️ [DEBUG] Data All Seats tidak valid. Menggunakan Mode Dummy.");
                    setStudioSeats(generateDummySeats());
                    setIsUsingDummy(true);
                }

            } catch (err) {
                console.error("🔥 [DEBUG] Error Fetch:", err);
                
                // --- FALLBACK MECHANISM ---
                let isFallback = false;
                if (err.response && (err.response.status === 404 || err.response.status === 500)) {
                    console.warn("⚠️ [DEBUG] Gagal koneksi/404. Mengaktifkan Mode Dummy");
                    isFallback = true;
                } else if (err.code === 'ERR_NETWORK') {
                    console.warn("⚠️ [DEBUG] Network Error. Mengaktifkan Mode Dummy");
                    isFallback = true;
                }

                if (isFallback) {
                    toast.warning(`Gagal memuat denah kursi. Menampilkan denah simulasi.`);
                    setStudioSeats(generateDummySeats());
                    setBookedSeats(['3', '5', '12', '15', '16']); // Simulasi beberapa kursi terisi (gunakan string ID)
                    setIsUsingDummy(true);
                } else {
                    let errorMsg = "Gagal memuat denah kursi.";
                    if (err.response?.status === 401) errorMsg = "Sesi habis. Silakan login ulang.";
                    else if (err.response?.status === 500) errorMsg = `Server Error (500): ${err.response.data?.message || 'Unknown'}`;
                    else if (err.request) errorMsg = "Tidak dapat menghubungi server backend.";
                    
                    toast.error(errorMsg);
                    navigate(-1); // Kembali jika gagal total
                }
            } finally {
                setIsLoading(false);
            }
        };

        fetchScheduleDetails();
    }, [movie, schedule, navigate, generateDummySeats]);

    // Update Labels & Price setiap selectedSeats berubah
    useEffect(() => {
        if (schedule) {
            // Pastikan selectedSeats berisi ID kursi sebagai String (konsisten dengan state lain)
            setTotalPrice(selectedSeats.length * schedule.price);
            
            const labels = selectedSeats.map(id => {
                const seat = studioSeats.find(s => String(s.id_kursi) === String(id));
                return seat ? seat.nomor_kursi : id;
            }).sort((a, b) => a.localeCompare(b)); // Urutkan label kursi secara visual
            
            setSelectedSeatLabels(labels);
        }
    }, [selectedSeats, schedule, studioSeats]);

    const handleSeatSelect = (seatId) => {
        // Pastikan seatId adalah String
        const idString = String(seatId); 

        if (selectedSeats.includes(idString)) {
            setSelectedSeats(prev => prev.filter(id => id !== idString));
        } else {
            if (selectedSeats.length >= 8) { 
                toast.warning("Maksimal 8 kursi per transaksi."); 
                return; 
            }
            setSelectedSeats(prev => [...prev, idString]);
        }
    };

    const handleCheckout = async () => {
        if (selectedSeats.length === 0) {
            toast.error("Pilih kursi dulu!");
            return;
        }
        
        setIsProcessing(true);

        // --- SIMULASI CHECKOUT JIKA DUMMY MODE ---
        if (isUsingDummy) {
            console.log("⚠️ [DEBUG] Melakukan Checkout Simulasi (Tanpa Backend)");
            
            setTimeout(() => {
                setIsProcessing(false);
                toast.success("SIMULASI: Tiket Berhasil Dipesan! (Data Mock)");
                navigate('/dashboard'); 
            }, 1500);
            
            return; 
        }
        
        try {
            const token = localStorage.getItem('auth_token');
            if (!token) {
                toast.error("Sesi habis, silakan login kembali.");
                navigate('/login');
                return;
            }

            const jadwalId = String(schedule.id_jadwal || schedule.id || schedule.schedule_id);

            // Payload yang dikirim ke API
            const payload = {
                // Konversi semua ID kursi ke INTEGER sebelum dikirim ke Backend
                id_kursi: selectedSeats.map(id => parseInt(id, 10)), 
                
                // Tambahan data lain (ID film mungkin sudah tidak perlu jika API endpoint menggunakan ID Jadwal)
                // Namun, kita tetap kirim data yang diminta (sesuaikan dengan kebutuhan API Anda)
                id_film: movie.id, // Pastikan tipe data sama dengan yang diharapkan backend (Int/String)
                id_jadwal: parseInt(jadwalId, 10),
                jumlah_tiket: selectedSeats.length,
                harga_tiket: schedule.price,
                metode: "qris" 
            };
            
            console.log("🚀 [DEBUG] Payload Transaksi:", payload);

            const response = await axios.post(`${API_BASE}/transaksi`, payload, {
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            console.log("✅ [DEBUG] Transaksi Berhasil:", response.data);

            toast.success("Tiket Berhasil Dipesan!");
            setTimeout(() => navigate('/riwayat-pesanan'), 1500);

        } catch (err) {
            console.error("🔥 Transaksi Gagal:", err);
            
            const msg = err.response?.data?.message || "Transaksi Gagal. Periksa koneksi atau ID data.";
            
            if (err.response?.data?.kursi_tidak_tersedia) {
                 // Perbarui kursi terisi dan kosongkan pilihan pengguna
                const newlyBooked = err.response.data.kursi_tidak_tersedia.map(String);
                toast.error("Maaf, beberapa kursi yang Anda pilih baru saja dibeli orang lain: " + newlyBooked.join(", "));
                
                setBookedSeats(prev => Array.from(new Set([...prev, ...newlyBooked])));
                setSelectedSeats([]); 
                
            } else if (err.response?.data?.errors) {
                // Error validasi (misalnya: ID Jadwal tidak valid)
                toast.error("Gagal Validasi Data: " + JSON.stringify(err.response.data.errors));
            } else {
                toast.error(msg);
            }

        } finally {
            setIsProcessing(false);
        }
    };

    if (!movie || !schedule) return null;

    if (isLoading) {
        return (
            <div className="d-flex justify-content-center align-items-center min-vh-100" style={{ background: "#0b0e14" }}>
                <Spinner animation="border" variant="light" />
                <span className="ms-3 text-white">Memuat denah studio...</span>
            </div>
        );
    }

    return (
        <Container fluid className="px-4 py-4" style={{ background: "#0b0e14", minHeight: "100vh" }}>
            <style jsx global>{`
                .blink {
                    animation: blink-animation 1s steps(5, start) infinite;
                }
                @keyframes blink-animation {
                    to {
                        visibility: hidden;
                    }
                }
            `}</style>
            
            <div className="d-flex align-items-center mb-4 text-white">
                <Button variant="link" className="text-white me-2 p-0" onClick={() => navigate(-1)}>
                    <i className="bi bi-arrow-left fs-4"></i>
                </Button>
                <div className="d-flex align-items-center gap-3">
                    <h4 className="mb-0 fw-bold">Pilih Kursi Kamu</h4>
                    {isUsingDummy && (
                        <Badge bg="warning" text="dark" className="blink">
                            ⚠ MODE SIMULASI
                        </Badge>
                    )}
                </div>
            </div>

            <Row>
                {/* KIRI: AREA DENAH KURSI */}
                <Col lg={8} className="mb-4">
                    <Card className="border-0 h-100" style={{ background: "#1f2937", borderRadius: "16px", boxShadow: "0 4px 20px rgba(0,0,0,0.5)" }}>
                        <Card.Body className="d-flex align-items-center justify-content-center p-md-5 p-3">
                            <div className="w-100 overflow-auto">
                                <SeatSelection 
                                    selectedSeats={selectedSeats} 
                                    onSeatSelect={handleSeatSelect}
                                    bookedSeats={bookedSeats}
                                    studioSeats={studioSeats} 
                                />
                            </div>
                        </Card.Body>
                    </Card>
                </Col>

                {/* KANAN: SIDEBAR RINGKASAN */}
                <Col lg={4}>
                    <Card className="border-0 text-white h-100" style={{ background: "#111827", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.05)" }}>
                        <div className="p-4 d-flex flex-column h-100">
                            <h5 className="fw-bold mb-4 border-bottom pb-3" style={{borderColor: "rgba(255,255,255,0.1) !important"}}>Ringkasan Pesanan</h5>

                            {/* Info Film */}
                            <div className="d-flex gap-3 mb-4">
                                <img 
                                    src={movie.image || `https://placehold.co/80x120/1f2937/ffffff?text=Poster`} 
                                    alt="Poster" 
                                    onError={(e) => { e.target.onerror = null; e.target.src = `https://placehold.co/80x120/1f2937/ffffff?text=Poster` }}
                                    style={{ width: "80px", borderRadius: "8px", objectFit: "cover", boxShadow: "0 4px 10px rgba(0,0,0,0.5)" }}
                                />
                                <div>
                                    <h5 className="fw-bold mb-1" style={{ fontSize: "1.1rem" }}>{movie.title}</h5>
                                    <small className="text-white-50 d-block mb-1">Studio {schedule.studio}</small>
                                    <small className="text-white-50"><i className="bi bi-clock me-1"></i>{schedule.time}, {schedule.date}</small>
                                </div>
                            </div>

                            <hr style={{ borderColor: "rgba(255,255,255,0.1)" }} />

                            {/* Detail Harga */}
                            <div className="p-3 rounded-3 mb-4 flex-grow-1" style={{ background: "rgba(255,255,255,0.03)", border: "1px dashed rgba(255,255,255,0.1)" }}>
                                <div className="d-flex justify-content-between mb-2">
                                    <span className="text-white-50 small">Tiket ({selectedSeats.length} Kursi)</span>
                                    <span className="text-white fw-bold text-end" style={{ maxWidth: "60%", fontSize: "0.9rem" }}>
                                        {selectedSeatLabels.length > 0 ? selectedSeatLabels.join(", ") : "Pilih kursi"}
                                    </span>
                                </div>
                                <div className="d-flex justify-content-between mb-2">
                                    <span className="text-white-50 small">Harga Satuan</span>
                                    <span className="small">Rp {schedule.price.toLocaleString('id-ID')}</span>
                                </div>
                                
                                <div className="d-flex justify-content-between align-items-center pt-3 mt-3 border-top border-secondary" style={{borderColor: "rgba(255,255,255,0.1) !important"}}>
                                    <span className="fs-5 fw-bold">Total Pembayaran</span>
                                    <span className="fs-5 fw-bold text-primary">
                                        Rp {totalPrice.toLocaleString('id-ID')}
                                    </span>
                                </div>
                            </div>

                            {/* Tombol Aksi */}
                            <div className="d-grid gap-2 mt-auto">
                                {selectedSeats.length > 0 && (
                                    <Button 
                                        variant="outline-secondary" 
                                        className="rounded-pill" 
                                        onClick={() => setSelectedSeats([])}
                                        size="sm"
                                    >
                                        Hapus Pilihan Kursi
                                    </Button>
                                )}
                                <Button 
                                    className="py-3 fw-bold rounded-pill"
                                    style={{
                                        background: "linear-gradient(90deg, #6a11cb 0%, #2575fc 100%)",
                                        border: "none",
                                        boxShadow: "0 4px 15px rgba(37, 117, 252, 0.4)",
                                    }}
                                    onClick={handleCheckout}
                                    disabled={isProcessing || selectedSeats.length === 0}
                                >
                                    {isProcessing ? (
                                        <>
                                            <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2"/>
                                            Memproses...
                                        </>
                                    ) : (
                                        `Bayar ${selectedSeats.length} Tiket`
                                    )}
                                </Button>
                            </div>
                        </div>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default PesanTiketPage;