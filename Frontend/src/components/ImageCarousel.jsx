import Carousel from "react-bootstrap/Carousel";

const ImageCarousel = ({ images }) => {
    // Helper jika images kosong atau undefined agar tidak crash
    const safeImages = images && images.length > 0 ? images : [];

    return (
        <div style={{ maxWidth: "1200px", margin: "40px auto", padding: "0 15px" }}>
            {/* PERBAIKAN: Menambahkan prop 'fade' agar transisi halus dan tidak 'glitch/zoom' */}
            <Carousel interval={3000} indicators={true} controls={true} fade>
                {safeImages.map((item, index) => (
                    <Carousel.Item key={index}>
                        <div style={{ 
                            maxHeight: "450px", 
                            height: "100%",
                            // PERBAIKAN: Gunakan maxWidth + width 100% agar responsif di HP
                            maxWidth: "700px", 
                            width: "100%", 
                            // PERBAIKAN UTAMA: margin "0 auto" memaksa div ke tengah, mencegah glitch geser kiri
                            margin: "0 auto", 
                            backgroundColor: "transparent", 
                            borderRadius: "16px",
                            overflow: "hidden", 
                            position: "relative"
                        }}>
                            <img
                                src={item.img}
                                alt={item.title}
                                style={{ 
                                    height: "100%", 
                                    width: "100%", // Ikuti lebar parent (div pembungkus)
                                    display: "block",
                                    objectFit: "cover", 
                                    objectPosition: "center 25%",
                                    // PERBAIKAN: Hardware acceleration untuk mencegah repaint/zoom glitch saat animasi
                                    transform: "translateZ(0)",
                                    willChange: "transform"
                                }}
                                onError={(e) => { e.target.src = "https://placehold.co/1200x450/2a2a3d/ffffff?text=Image+Error"; }}
                            />
                            
                            {/* Gradient Overlay agar teks terbaca jelas di atas gambar */}
                            <div style={{
                                position: "absolute",
                                bottom: 0,
                                left: 0,
                                width: "100%",
                                height: "60%",
                                background: "linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 100%)",
                                pointerEvents: "none"
                            }} />
                        </div>
                        
                        {/* Menampilkan Caption dengan posisi yang lebih baik */}
                        {item.title && (
                            <Carousel.Caption className="text-start" style={{ bottom: "2rem", left: "calc(50% - 320px)", right: "auto", width: "640px", textShadow: "0 2px 10px rgba(0,0,0,0.8)" }}>
                                <h3 style={{ fontWeight: "800", fontSize: "2.5rem", marginBottom: "0.5rem" }}>{item.title}</h3>
                                {item.description && <p style={{ fontSize: "1.1rem", opacity: 0.9 }}>{item.description}</p>}
                            </Carousel.Caption>
                        )}
                    </Carousel.Item>
                ))}
            </Carousel>
        </div>
    );
};

export default ImageCarousel;