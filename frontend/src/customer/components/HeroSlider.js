import React, { useRef, useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";
import HeroProgressBar from "./HeroProgressBar";

const slides = [
    { image: "https://images.unsplash.com/photo-1645696301019-35adcc18fc21?q=80&w=1629&auto=format&fit=crop", caption: "Promo 1: Diskon Spesial!" },
    { image: "https://images.unsplash.com/photo-1666239308347-4292ea2ff777?q=80&w=1470&auto=format&fit=crop", caption: "Promo 2: Produk Baru!" },
    { image: "https://images.unsplash.com/photo-1612939675110-fe3a0129a024?q=80&w=2070&auto=format&fit=crop", caption: "Promo 3: Gratis Ongkir!" },
];

const HeroSlider = () => {
    const swiperRef = useRef(null);
    const [activeIndex, setActiveIndex] = useState(0);
    const [isHovering, setIsHovering] = useState(false);

    // refs to manage pause/resume and DOM update
    const rafRef = useRef(null);
    const startRef = useRef(0);
    const elapsedRef = useRef(0);
    const duration = 3000; // 3s same as autoplay delay
    const barRef = useRef(null);

    const animate = () => {
        const now = performance.now();
        const elapsed = now - startRef.current;
        elapsedRef.current = elapsed;
        const percent = Math.min((elapsed / duration) * 100, 100);
        if (barRef.current) {
            barRef.current.style.width = percent + '%';
        }
        if (percent < 100 && !isHovering) {
            rafRef.current = requestAnimationFrame(animate);
        }
    };

    // Reset animation when slide changes
    useEffect(() => {
        if (barRef.current) barRef.current.style.width = '0%';
        elapsedRef.current = 0;
        startRef.current = performance.now();
        cancelAnimationFrame(rafRef.current);
        if (!isHovering) {
            rafRef.current = requestAnimationFrame(animate);
        }
        return () => cancelAnimationFrame(rafRef.current);
    }, [activeIndex]);

    // Pause / resume on hover
    useEffect(() => {
        if (isHovering) {
            cancelAnimationFrame(rafRef.current);
            swiperRef.current?.autoplay?.stop && swiperRef.current.autoplay.stop();
        } else {
            // resume with remaining time
            startRef.current = performance.now() - elapsedRef.current;
            rafRef.current = requestAnimationFrame(animate);
            swiperRef.current?.autoplay?.start && swiperRef.current.autoplay.start();
        }
        return () => cancelAnimationFrame(rafRef.current);
    }, [isHovering]);

    return (
        <div
            style={{ position: "relative", width: "100vw", height: "75vh", overflow: "hidden" }}
            onMouseEnter={() => { setIsHovering(true); }}
            onMouseLeave={() => { setIsHovering(false); }}
        >
            <Swiper
                modules={[Autoplay]}
                spaceBetween={0}
                slidesPerView={1}
                loop={true}
                onSwiper={(swiper) => (swiperRef.current = swiper)}
                autoplay={{ delay: duration, disableOnInteraction: false }}
                onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
                style={{ height: '100%' }}
            >
                {slides.map((slide, index) => (
                    <SwiperSlide key={index}>
                        <div style={{ position: "relative", width: "100vw", height: "75vh" }}>
                            <img
                                src={slide.image}
                                alt={slide.caption}
                                style={{ width: "100vw", height: "75vh", objectFit: "cover" }}
                                loading="lazy"
                            />
                            {/* Overlay gelap tipis di atas gambar */}
                            <div style={{
                                position: "absolute",
                                top: 0,
                                left: 0,
                                width: "100%",
                                height: "100%",
                                background: "rgba(0,0,0,0.22)", // gelap tipis
                                zIndex: 1
                            }} />
                            <div style={{
                                position: "absolute",
                                top: "50%",
                                left: "50%",
                                transform: "translate(-50%, -50%)",
                                color: "#fff",
                                fontSize: "clamp(1.2rem, 4vw, 2.5rem)",
                                fontWeight: "bold",
                                textAlign: "center",
                                textShadow: "0 2px 6px rgba(0,0,0,0.6)",
                                padding: '0 12px',
                                zIndex: 2
                            }}>
                                {slide.caption}
                            </div>
                        </div>
                    </SwiperSlide>
                ))}
            </Swiper>

            {/* Gradient overlay to ensure visibility */}
            <div style={{ position: 'absolute', left: 0, bottom: 0, width: '100%', height: 70, background: 'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.65) 100%)', zIndex: 5, pointerEvents: 'none' }} />
            {/* Progress bar */}
            <div style={{ position: "absolute", bottom: 14, left: 0, width: "100%", padding: "0 40px", boxSizing: 'border-box', zIndex: 10, pointerEvents: "none" }}>
                <HeroProgressBar ref={barRef} height={6} trackColor="rgba(255,255,255,0.12)" width={500} />
            </div>
        </div>
    );
};

export default HeroSlider;