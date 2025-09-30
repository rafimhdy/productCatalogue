// src/customer/pages/CustomerHome.js
import React from "react";
import Navbar from "../components/Navbar";
import ProductList from "../components/ProductList";
import HeroSlider from "../components/HeroSlider";
import HeroSectionKanan from "../components/HeroSectionKanan";
import HeroSectionKiri from "../components/HeroSectionKiri";
import PenjelasanGambar from "../components/PenjelasanGambar";
import Footer from "../components/Footer";
import BestSellers from "../components/BestSellers";
import VideoKeluarga from "../components/VideoKeluarga";
import ParallaxHero from "../components/ParallaxHero";

const CustomerHome = () => {
  return (
    <div className="home-page-root" style={{ overflowX: "hidden" }}>
      <Navbar />
      <ParallaxHero />
      <BestSellers />
      <HeroSectionKiri />
      <HeroSlider />
      <br />
      <br />
      <VideoKeluarga />
      <br />
      <br />
      <br />
      <h1 style={{ textAlign: "center", fontSize: "3rem" }}>Pesan Sekarang!</h1>
      <section id="products" style={{ scrollMarginTop: "90px" }}>
        <ProductList />
      </section>
      <br />
      <br />
      <br />
      <PenjelasanGambar />
      <br />
      <HeroSectionKanan />
      <Footer />
    </div>
  );
};

export default CustomerHome;
