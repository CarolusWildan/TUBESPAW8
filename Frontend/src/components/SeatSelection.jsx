import React from 'react';

const SeatSelection = ({ capacity = 64, selectedSeats, onSeatSelect, bookedSeats = [], studioSeats = [] }) => {
    if (!studioSeats || studioSeats.length === 0) {
        return (
            <div className="d-flex flex-column align-items-center justify-content-center py-5">
                <div className="text-white-50">Memuat denah kursi...</div>
            </div>
        );
    }

    const rows = {};
    studioSeats.forEach(seat => {
        const rowLabel = seat.nomor_kursi.replace(/[0-9]/g, ''); 
        if (!rows[rowLabel]) {
            rows[rowLabel] = [];
        }
        rows[rowLabel].push(seat);
    });

    const isSeatBooked = (seatId) => bookedSeats.map(Number).includes(Number(seatId));
    const isSeatSelected = (seatId) => selectedSeats.includes(seatId);

    return (
        <div className="d-flex flex-column align-items-center w-100 p-4" style={{ background: "#111827", borderRadius: "16px" }}>
            {/* Layar Bioskop */}
            <div className="w-100 mb-5 text-center position-relative">
                <div 
                    style={{
                        height: "40px", width: "80%", margin: "0 auto",
                        background: "linear-gradient(180deg, rgba(255,255,255,0.1) 0%, transparent 100%)",
                        clipPath: "polygon(0 0, 100% 0, 85% 100%, 15% 100%)",
                    }}
                />
                <div style={{ height: "4px", width: "80%", margin: "-4px auto 0", background: "#fff", borderRadius: "2px", boxShadow: "0 0 20px rgba(255,255,255,0.5)" }} />
                <small className="text-white-50 mt-3 d-block" style={{ letterSpacing: "2px" }}>LAYAR</small>
            </div>

            {/* Grid Kursi Dinamis dari DB */}
            <div className="d-flex flex-column gap-2">
                {Object.keys(rows).map((rowLabel) => (
                    <div key={rowLabel} className="d-flex gap-3 justify-content-center align-items-center">
                        {/* Label Baris */}
                        <div className="text-white-50 fw-bold small" style={{ width: '20px' }}>{rowLabel}</div>

                        {/* Kursi Baris Tersebut */}
                        <div className="d-flex gap-1">
                            {rows[rowLabel].map((seat) => (
                                <Seat 
                                    key={seat.id_kursi}
                                    id={seat.id_kursi}
                                    label={seat.nomor_kursi}
                                    status={isSeatBooked(seat.id_kursi) ? 'sold' : isSeatSelected(seat.id_kursi) ? 'selected' : 'available'}
                                    onClick={() => !isSeatBooked(seat.id_kursi) && onSeatSelect(seat.id_kursi)}
                                />
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* Legenda */}
            <div className="d-flex gap-4 mt-5 justify-content-center">
                <LegendBox color="rgba(255,255,255,0.1)" border="1px solid #555" label="Tersedia" />
                <LegendBox color="#e5e7eb" label="Dipilih" />
                <LegendBox color="#ef4444" label="Terisi" />
            </div>
        </div>
    );
};

const Seat = ({ id, label, status, onClick }) => {
    let style = {
        width: "32px", height: "32px", borderRadius: "4px", cursor: "pointer",
        display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", fontWeight: "600",
        transition: "all 0.2s",
        background: "rgba(255,255,255,0.1)",
        color: "rgba(255,255,255,0.7)",
        border: "1px solid rgba(255,255,255,0.2)"
    };

    if (status === 'sold') {
        style.background = "#ef4444"; style.color = "#fff"; style.border = "none"; style.cursor = "not-allowed"; style.opacity = 0.6;
    } else if (status === 'selected') {
        style.background = "#e5e7eb"; style.color = "#000"; style.border = "none"; style.transform = "scale(1.1)";
    }

    return <div onClick={onClick} style={style} title={`Kursi: ${label}`}>{status === 'selected' ? label : ""}</div>;
};

const LegendBox = ({ color, border, label }) => (
    <div className="d-flex align-items-center gap-2">
        <div style={{ width: 16, height: 16, background: color, border: border || 'none', borderRadius: "4px" }}></div>
        <small className="text-white-50">{label}</small>
    </div>
);

export default SeatSelection;