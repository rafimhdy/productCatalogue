import React from 'react';
import { Link } from 'react-router-dom';
import './css/Footer.css';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="modern-footer">
            <div className="footer-wrapper">
                {/* Main Footer Content */}
                <div className="footer-grid">
                    {/* Company Info */}
                    <div className="footer-col company-col">
                        <div className="company-brand">
                            <h3>Our Shop</h3>
                            <p>Pengalaman berbelanja terbaik untuk Anda</p>
                        </div>

                        <div className="contact-quick">
                            <div className="contact-item">
                                <span>Jl. Raya Industri No. 123, Cikarang, Bekasi</span>
                            </div>
                            <div className="contact-item">
                                <a href="https://wa.me/6281234567890">+62 812-3456-7890</a>
                            </div>
                            <div className="contact-item">
                                <a href="mailto:sales@ourshop.com">sales@ourshop.com</a>
                            </div>
                        </div>
                    </div>

                    {/* Products & Services */}
                    <div className="footer-col">
                        <h4>Produk & Layanan</h4>
                        <ul>
                            <li><Link to="/products">Semua Produk</Link></li>
                            <li><Link to="/best-sellers">Produk Terlaris</Link></li>
                            <li><Link to="/categories">Kategori</Link></li>
                            <li><a href="/catalog.pdf" target="_blank">Katalog Digital</a></li>
                        </ul>
                    </div>

                    {/* Customer Care */}
                    <div className="footer-col">
                        <h4>Bantuan</h4>
                        <ul>
                            <li><Link to="/dashboard">Dashboard</Link></li>
                            <li><Link to="/order-history">Riwayat Pesanan</Link></li>
                            <li><a href="https://wa.me/6281234567890">Customer Service</a></li>
                            <li><a href="#faq">FAQ</a></li>
                        </ul>
                    </div>

                    {/* Legal & Social */}
                    <div className="footer-col">
                        <h4>Informasi</h4>
                        <ul>
                            <li><Link to="/privacy-policy">Kebijakan Privasi</Link></li>
                            <li><Link to="/terms-conditions">Syarat & Ketentuan</Link></li>
                            <li><a href="#shipping">Pengiriman</a></li>
                            <li><a href="#returns">Pengembalian</a></li>
                        </ul>

                        <div className="social-links">
                            <h5>Ikuti Kami</h5>
                            <div className="social-icons">
                                <a href="#" aria-label="Facebook"><i className="fab fa-facebook-f"></i></a>
                                <a href="#" aria-label="Instagram"><i className="fab fa-instagram"></i></a>
                                <a href="#" aria-label="Twitter"><i className="fab fa-twitter"></i></a>
                                <a href="#" aria-label="YouTube"><i className="fab fa-youtube"></i></a>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Bottom */}
                <div className="footer-bottom">
                    <div className="footer-bottom-content">
                        <div className="copyright">
                            <p>&copy; {currentYear} Our Shop. All rights reserved.</p>
                        </div>
                        <div className="payment-info">
                            <span>Bank Transfer • E-Wallet • COD</span>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;