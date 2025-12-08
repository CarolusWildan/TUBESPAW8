import React from 'react';

const SeatSelection = ({ selectedSeats, onSeatSelect, bookedSeats = [] }) => {
    const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
    // Layout sederhana: A-G, 1-8 (dengan lorong di tengah)

    // Helper untuk cek status kursi
    const isSeatSelected = (seatId) => selectedSeats.includes(seatId);
    const isSeatBooked = (seatId) => bookedSeats.includes(seatId);

    const handleSeatClick = (seatId) => {
        if (isSeatBooked(seatId)) return; // Jangan lakukan apa-apa jika sudah dipesan
        onSeatSelect(seatId);
    };

    return (
        <div className="d-flex flex-column align-items-center w-100">
            {/* Layar Bioskop */}
            <div className="w-100 mb-5 text-center">
                <div 
                    style={{
                        height: "8px",
                        width: "80%",
                        margin: "0 auto",
                        background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.8) 50%, transparent 100%)",
                        borderRadius: "50%",
                        boxShadow: "0 10px 30px rgba(255, 255, 255, 0.3)"
                    }}
                />
                <small className="text-white-50 mt-2 d-block">LAYAR</small>
            </div>

            {/* Grid Kursi */}
            <div className="d-flex flex-column gap-3">
                {rows.map((row) => (
                    <div key={row} className="d-flex gap-4 justify-content-center">
                        {/* Sisi Kiri (1-4) */}
                        <div className="d-flex gap-2">
                            {[1, 2, 3, 4].map((num) => {
                                const seatId = `${row}${num}`;
                                const booked = isSeatBooked(seatId);
                                const selected = isSeatSelected(seatId);
                                
                                return (
                                    <Seat 
                                        key={seatId} 
                                        id={seatId} 
                                        status={booked ? 'sold' : selected ? 'selected' : 'available'}
                                        onClick={() => handleSeatClick(seatId)}
                                    />
                                );
                            })}
                        </div>

                        {/* Jalan Tengah (Gap) */}
                        <div style={{ width: "20px" }}></div>

                        {/* Sisi Kanan (5-8) */}
                        <div className="d-flex gap-2">
                            {[5, 6, 7, 8].map((num) => {
                                const seatId = `${row}${num}`;
                                const booked = isSeatBooked(seatId);
                                const selected = isSeatSelected(seatId);

                                return (
                                    <Seat 
                                        key={seatId} 
                                        id={seatId} 
                                        status={booked ? 'sold' : selected ? 'selected' : 'available'}
                                        onClick={() => handleSeatClick(seatId)}
                                    />
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>

            {/* Legenda */}
            <div className="d-flex gap-4 mt-5 justify-content-center">
                <div className="d-flex align-items-center gap-2">
                    <div style={{ width: 20, height: 20, border: "1px solid rgba(255,255,255,0.5)", borderRadius: "6px" }}></div>
                    <small className="text-white-50">Tersedia</small>
                </div>
                <div className="d-flex align-items-center gap-2">
                    <div style={{ width: 20, height: 20, background: "#a78bfa", borderRadius: "6px", boxShadow: "0 0 10px #a78bfa" }}></div>
                    <small className="text-white-50">Dipilih</small>
                </div>
                <div className="d-flex align-items-center gap-2">
                    <div style={{ width: 20, height: 20, background: "#374151", borderRadius: "6px" }}></div>
                    <small className="text-white-50">Terisi</small>
                </div>
            </div>
        </div>
    );
};

// Sub-component untuk kotak kursi individu
const Seat = ({ id, status, onClick }) => {
    let style = {
        width: "36px",
        height: "36px",
        borderRadius: "8px 8px 4px 4px", // Bentuk kursi
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "12px",
        fontWeight: "bold",
        transition: "all 0.2s ease"
    };

    if (status === 'sold') {
        style.background = "#374151"; // Abu gelap
        style.color = "#6b7280";
        style.cursor = "not-allowed";
    } else if (status === 'selected') {
        style.background = "#a78bfa"; // Ungu Neon
        style.color = "white";
        style.boxShadow = "0 0 15px rgba(167, 139, 250, 0.6)";
        style.transform = "scale(1.1)";
        style.border = "none";
    } else {
        // Available
        style.background = "rgba(255,255,255,0.05)";
        style.border = "1px solid rgba(255,255,255,0.3)";
        style.color = "rgba(255,255,255,0.7)";
    }

    return (
        <div 
            onClick={onClick} 
            style={style}
            onMouseEnter={(e) => {
                if(status === 'available') {
                    e.currentTarget.style.borderColor = "white";
                    e.currentTarget.style.background = "rgba(255,255,255,0.1)";
                }
            }}
            onMouseLeave={(e) => {
                if(status === 'available') {
                    e.currentTarget.style.borderColor = "rgba(255,255,255,0.3)";
                    e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                }
            }}
        >
            {id}
        </div>
    );
};

export default SeatSelection;