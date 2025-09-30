import React, { useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import './css/LegalPages.css';

const PrivacyPolicy = () => {
    useEffect(() => {
        // Scroll to top when component mounts
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="legal-page">
            <Navbar />

            <div className="legal-container">
                <div className="legal-content">
                    <div className="legal-header">
                        <h1>🔒 Kebijakan Privasi</h1>
                        <p className="last-updated">Terakhir diperbarui: 28 September 2024</p>
                    </div>

                    <div className="legal-section">
                        <h2>1. Informasi yang Kami Kumpulkan</h2>
                        <p>Kami mengumpulkan informasi yang Anda berikan kepada kami secara langsung, seperti:</p>
                        <ul>
                            <li><strong>Data Akun:</strong> Nama, alamat email, nomor telepon, dan kata sandi</li>
                            <li><strong>Data Pemesanan:</strong> Alamat pengiriman, riwayat pembelian, dan preferensi produk</li>
                            <li><strong>Data Komunikasi:</strong> Pesan, review, dan feedback yang Anda berikan</li>
                            <li><strong>Data Pembayaran:</strong> Informasi transaksi (tidak menyimpan data kartu kredit)</li>
                        </ul>
                    </div>

                    <div className="legal-section">
                        <h2>2. Bagaimana Kami Menggunakan Informasi Anda</h2>
                        <p>Informasi yang kami kumpulkan digunakan untuk:</p>
                        <ul>
                            <li>Memproses dan mengirimkan pesanan Anda</li>
                            <li>Menyediakan layanan pelanggan yang lebih baik</li>
                            <li>Mengirimkan informasi produk dan penawaran khusus (dengan persetujuan)</li>
                            <li>Meningkatkan pengalaman berbelanja di website kami</li>
                            <li>Mencegah aktivitas penipuan dan menjaga keamanan</li>
                        </ul>
                    </div>

                    <div className="legal-section">
                        <h2>3. Pembagian Informasi</h2>
                        <p>Kami tidak akan menjual, menyewakan, atau membagikan informasi pribadi Anda kepada pihak ketiga, kecuali:</p>
                        <ul>
                            <li>Dengan persetujuan eksplisit dari Anda</li>
                            <li>Untuk memproses pembayaran melalui gateway pembayaran yang aman</li>
                            <li>Kepada kurir untuk pengiriman produk</li>
                            <li>Jika diwajibkan oleh hukum atau peraturan yang berlaku</li>
                        </ul>
                    </div>

                    <div className="legal-section">
                        <h2>4. Keamanan Data</h2>
                        <p>Kami menerapkan langkah-langkah keamanan teknis dan organisatoris untuk melindungi data Anda:</p>
                        <ul>
                            <li>Enkripsi SSL untuk semua transmisi data</li>
                            <li>Sistem autentikasi yang aman dengan token JWT</li>
                            <li>Akses terbatas pada data pribadi hanya untuk karyawan yang berwenang</li>
                            <li>Backup rutin dan pemantauan keamanan sistem</li>
                        </ul>
                    </div>

                    <div className="legal-section">
                        <h2>5. Hak Anda atas Data Pribadi</h2>
                        <p>Sesuai dengan peraturan perlindungan data, Anda memiliki hak untuk:</p>
                        <ul>
                            <li><strong>Akses:</strong> Meminta salinan data pribadi yang kami miliki</li>
                            <li><strong>Koreksi:</strong> Memperbarui atau memperbaiki data yang tidak akurat</li>
                            <li><strong>Penghapusan:</strong> Meminta penghapusan data pribadi Anda</li>
                            <li><strong>Portabilitas:</strong> Meminta transfer data ke layanan lain</li>
                            <li><strong>Pembatasan:</strong> Membatasi pemrosesan data pribadi Anda</li>
                        </ul>
                    </div>

                    <div className="legal-section">
                        <h2>6. Cookie dan Teknologi Pelacakan</h2>
                        <p>Website kami menggunakan cookie untuk:</p>
                        <ul>
                            <li>Menyimpan preferensi dan pengaturan Anda</li>
                            <li>Menganalisis lalu lintas website untuk peningkatan layanan</li>
                            <li>Menyediakan fitur keranjang belanja dan wishlist</li>
                            <li>Personalisasi konten dan rekomendasi produk</li>
                        </ul>
                        <p>Anda dapat mengatur penggunaan cookie melalui pengaturan browser Anda.</p>
                    </div>

                    <div className="legal-section">
                        <h2>7. Penyimpanan Data</h2>
                        <p>Data pribadi Anda akan disimpan selama:</p>
                        <ul>
                            <li>Akun aktif: Selama akun Anda masih aktif</li>
                            <li>Data transaksi: 7 tahun untuk keperluan akuntansi dan pajak</li>
                            <li>Data komunikasi: 3 tahun untuk referensi layanan pelanggan</li>
                        </ul>
                    </div>

                    <div className="legal-section">
                        <h2>8. Perubahan Kebijakan</h2>
                        <p>Kami dapat memperbarui Kebijakan Privasi ini dari waktu ke waktu. Perubahan signifikan akan dikomunikasikan melalui:</p>
                        <ul>
                            <li>Email notifikasi kepada pengguna terdaftar</li>
                            <li>Pengumuman di website utama</li>
                            <li>Pembaruan tanggal "Terakhir diperbarui" di bagian atas halaman ini</li>
                        </ul>
                    </div>

                    <div className="legal-section">
                        <h2>9. Kontak Kami</h2>
                        <p>Jika Anda memiliki pertanyaan atau kekhawatiran tentang Kebijakan Privasi ini, silakan hubungi kami:</p>
                        <div className="contact-info-legal">
                            <div className="contact-item-legal">
                                <strong>Email:</strong> privacy@ourshop.com
                            </div>
                            <div className="contact-item-legal">
                                <strong>WhatsApp:</strong> +62 812-3456-7890
                            </div>
                            <div className="contact-item-legal">
                                <strong>Alamat:</strong> Jl. Raya Industri No. 123, Cikarang, Bekasi, Jawa Barat 17530
                            </div>
                        </div>
                    </div>

                    <div className="legal-footer">
                        <p>Dengan menggunakan layanan kami, Anda menyetujui pengumpulan dan penggunaan informasi sesuai dengan Kebijakan Privasi ini.</p>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default PrivacyPolicy;
