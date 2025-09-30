import React, { forwardRef } from "react";
import "./css/HeroProgressBar.css";

const HeroProgressBar = forwardRef(({
                                        progress = 0,
                                        height = 6,
                                        color = "rgba(255,255,255,0.35)",
                                        trackColor = "rgba(255,255,255,0.15)",
                                        glow = true,
                                        rounded = true,
                                        // Ubah width default menjadi string persentase
                                        width = '80%'
                                    }, ref) => {
    return (
        <div
            className="hero-progress-wrapper"
            style={{
                height,
                background: trackColor,
                borderRadius: rounded ? 9999 : 0,

                // Kunci Responsif: Gunakan width dari props, tetapi batasi dengan maxWidth
                width: width,
                maxWidth: '500px', // Batas lebar maksimal di desktop

                margin: "16px auto 0 auto",
                display: "block",
                position: "relative",
                overflow: "hidden"
            }}
        >
            <div
                ref={ref}
                className="hero-progress-bar-inner"
                style={{
                    width: `${progress}%`,
                    height: "100%",
                    background: color,
                    borderRadius: rounded ? 9999 : 0,
                    boxShadow: glow ? `0 0 8px ${color}, 0 0 16px ${color}55` : "none",
                    transition: "width 0.18s linear",
                    willChange: 'width'
                }}
            />
        </div>
    );
});

export default HeroProgressBar;
