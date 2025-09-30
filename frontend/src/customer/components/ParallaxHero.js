// filepath: frontend/src/customer/components/ParallaxHero.js
import React from 'react';
import { Parallax } from 'react-scroll-parallax';
import './css/ParallaxHero.css';
import '../../global.css'

const ParallaxHero = () => {
  return (
    <section className="parallax-hero" aria-label="Hero Section">
      <div className="parallax-hero__bg-gradient" />

      {/* BACKGROUND BLOBS */}
      <Parallax speed={-25} className="parallax-layer layer-back" aria-hidden="true">
        <div className="blob blob-one" />
      </Parallax>
      <Parallax speed={18} className="parallax-layer layer-mid" aria-hidden="true">
        <div className="blob blob-two" />
      </Parallax>

      {/* FRIES FLOATING DECORATIVE - multiple depths */}
      <Parallax speed={-12} className="parallax-layer fries-layer fries-back" aria-hidden="true">
        <img src="/image/burger.png" alt="" className="fries fries-back-img" loading="lazy" />
      </Parallax>
      <Parallax speed={10} className="parallax-layer fries-layer fries-mid" aria-hidden="true">
        <img src="/image/fries.png" alt="" className="fries fries-mid-img" loading="lazy" />
      </Parallax>
      <Parallax speed={4} className="parallax-layer fries-layer fries-front" aria-hidden="true">
        <img src="/image/fries.png" alt="" className="fries fries-front-img" loading="lazy" />
      </Parallax>

      {/* TEXT CONTENT */}
      <div className="floating-text">
        <h1 className="hero-title">Kuliner Favorit<br/>Dalam Genggaman</h1>
        <p className="hero-subtitle" style={{'--delay':'0.1s'}}>Pesan cepat, nikmati hangatnya rasa terbaik hari ini.</p>
        <div className="hero-cta" style={{'--delay':'0.2s'}}>
          <a href="#products" className="btn-hero-primary">Mulai Belanja</a>
          <a href="#best-sellers" className="btn-hero-secondary">Lihat Terlaris</a>
        </div>
      </div>

      <div className="parallax-hero__overlay" />
    </section>
  );
};

export default ParallaxHero;