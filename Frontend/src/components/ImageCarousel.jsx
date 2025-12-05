import Carousel from "react-bootstrap/Carousel";
import { useState } from "react";

const ImageCarousel = ({ images }) => {
    return (
        <div style={{ maxWidth: "auto", margin: "40px auto", padding: "0 15px" }}>
            <Carousel interval={2500} indicators={false}>
                {images.map((item, index) => (
                    <Carousel.Item key={index}>
                        <div style={{ 
                            height: "300px", 
                            display: "flex", 
                            justifyContent: "center", 
                            alignItems: "center",
                            backgroundColor: "transparent",
                            borderRadius: "16px"
                        }}>
                            <img
                                src={item.img}
                                alt={item.title}
                                style={{ 
                                    maxHeight: "100%", 
                                    maxWidth: "100%", 
                                    objectFit: "contain",
                                    borderRadius: "16px"
                                }}
                            />
                        </div>
                    </Carousel.Item>
                ))}
            </Carousel>
        </div>
    );
};

export default ImageCarousel;