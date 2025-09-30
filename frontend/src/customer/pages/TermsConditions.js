import React, { useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import './css/LegalPages.css';

const TermsConditions = () => {
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
                        <h1>📋 Syarat & Ketentuan</h1>
                        <p className="last-updated">Terakhir diperbarui: 28 September 2024</p>
                    </div>

                    <div className="legal-section">
                        <h2>1. Penerimaan Syarat</h2>
                        <p>Dengan mengakses dan menggunakan website Our Shop, Anda setuju untuk terikat oleh syarat dan ketentuan ini. Jika Anda tidak setuju dengan bagian manapun dari syarat ini, Anda tidak diperkenankan menggunakan layanan kami.</p>
                    </div>

                    <div className="legal-section">
                        <h2>2. Definisi</h2>
                        <ul>
                            <li><strong>"Kami"</strong> mengacu pada PT Our Shop Indonesia</li>
                            <li><strong>"Anda"</strong> mengacu pada pengguna layanan kami</li>
                            <li><strong>"Layanan"</strong> mengacu pada website dan semua fitur yang tersedia</li>
                            <li><strong>"Produk"</strong> mengacu pada barang yang dijual melalui platform kami</li>
                        </ul>
                    </div>

                    <div className="legal-section">
                        <h2>3. Pendaftaran Akun</h2>
                        <p>Untuk menggunakan layanan tertentu, Anda harus:</p>
                        <ul>
                            <li>Berusia minimal 17 tahun atau memiliki izin dari orang tua/wali</li>
                            <li>Memberikan informasi yang akurat dan lengkap</li>
                            <li>Menjaga kerahasiaan kata sandi Anda</li>
                            <li>Bertanggung jawab atas semua aktivitas di akun Anda</li>
                            <li>Segera memberitahu kami jika ada penggunaan tidak sah pada akun Anda</li>
                        </ul>
                    </div>

                    <div className="legal-section">
                        <h2>4. Pemesanan dan Pembayaran</h2>
                        <h3>4.1 Proses Pemesanan</h3>
                        <ul>
                            <li>Semua pesanan tunduk pada ketersediaan stok</li>
                            <li>Kami berhak menolak atau membatalkan pesanan atas kebijakan kami</li>
                            <li>Konfirmasi pesanan akan dikirim melalui email</li>
                        </ul>

                        <h3>4.2 Harga dan Pembayaran</h3>
                        <ul>
                            <li>Semua harga dalam Rupiah dan sudah termasuk PPN</li>
                            <li>Harga dapat berubah sewaktu-waktu tanpa pemberitahuan sebelumnya</li>
                            <li>Pembayaran harus dilakukan sesuai metode yang tersedia</li>
                            <li>Pesanan akan diproses setelah pembayaran dikonfirmasi</li>
                        </ul>
                    </div>

                    <div className="legal-section">
                        <h2>5. Pengiriman</h2>
                        <ul>
                            <li><strong>Waktu Pengiriman:</strong> 1-3 hari kerja untuk Jabodetabek, 3-7 hari untuk luar Jabodetabek</li>
                            <li><strong>Biaya Pengiriman:</strong> Dihitung berdasarkan berat dan tujuan pengiriman</li>
                            <li><strong>Risiko:</strong> Barang menjadi tanggung jawab pembeli setelah diserahkan ke kurir</li>
                            <li><strong>Alamat:</strong> Pastikan alamat pengiriman lengkap dan benar</li>
                        </ul>
                    </div>

                    <div className="legal-section">
                        <h2>6. Pengembalian dan Penukaran</h2>
                        <h3>6.1 Kondisi Pengembalian</h3>
                        <ul>
                            <li>Barang dapat dikembalikan dalam 7 hari setelah diterima</li>
                            <li>Barang harus dalam kondisi asli dan belum digunakan</li>
                            <li>Kemasan dan label masih utuh</li>
                            <li>Disertai bukti pembelian</li>
                        </ul>

                        <h3>6.2 Barang yang Tidak Dapat Dikembalikan</h3>
                        <ul>
                            <li>Produk makanan dan minuman</li>
                            <li>Produk personal care yang sudah dibuka</li>
                            <li>Produk custom atau pesanan khusus</li>
                        </ul>
                    </div>

                    <div className="legal-section">
                        <h2>7. Garansi dan Tanggung Jawab</h2>
                        <ul>
                            <li>Garansi produk sesuai dengan ketentuan produsen</li>
                            <li>Kami tidak bertanggung jawab atas kerusakan akibat penyalahgunaan</li>
                            <li>Klaim garansi harus disertai bukti pembelian</li>
                            <li>Penggantian atau perbaikan sesuai kebijakan produsen</li>
                        </ul>
                    </div>

                    <div className="legal-section">
                        <h2>8. Kekayaan Intelektual</h2>
                        <p>Semua konten di website ini, termasuk teks, gambar, logo, dan desain, adalah milik PT Our Shop Indonesia dan dilindungi oleh hak cipta. Dilarang menggunakan, menyalin, atau mendistribusikan konten tanpa izin tertulis.</p>
                    </div>

                    <div className="legal-section">
                        <h2>9. Perilaku Pengguna</h2>
                        <p>Anda setuju untuk tidak:</p>
                        <ul>
                            <li>Menggunakan layanan untuk tujuan ilegal</li>
                            <li>Mengirimkan konten yang menyinggung atau tidak pantas</li>
                            <li>Mengganggu atau merusak sistem kami</li>
                            <li>Menyamar sebagai orang lain</li>
                            <li>Mengumpulkan data pengguna lain</li>
                        </ul>
                    </div>

                    <div className="legal-section">
                        <h2>10. Review dan Rating</h2>
                        <ul>
                            <li>Hanya pelanggan yang telah membeli produk yang dapat memberikan review</li>
                            <li>Review harus jujur dan berdasarkan pengalaman pribadi</li>
                            <li>Kami berhak menghapus review yang tidak pantas atau spam</li>
                            <li>Review yang diberikan dapat digunakan untuk promosi</li>
                        </ul>
                    </div>

                    <div className="legal-section">
                        <h2>11. Pembatasan Tanggung Jawab</h2>
                        <p>Dalam batas yang diizinkan hukum, PT Our Shop Indonesia tidak bertanggung jawab atas:</p>
                        <ul>
                            <li>Kerugian tidak langsung atau konsekuensial</li>
                            <li>Kehilangan data atau keuntungan</li>
                            <li>Gangguan layanan di luar kendali kami</li>
                            <li>Tindakan pihak ketiga</li>
                        </ul>
                    </div>

                    <div className="legal-section">
                        <h2>12. Penyelesaian Sengketa</h2>
                        <ul>
                            <li>Sengketa akan diselesaikan melalui negosiasi terlebih dahulu</li>
                            <li>Jika tidak tercapai kesepakatan, dapat melalui mediasi</li>
                            <li>Hukum Indonesia berlaku untuk syarat dan ketentuan ini</li>
                            <li>Pengadilan Jakarta Pusat memiliki yurisdiksi eksklusif</li>
                        </ul>
                    </div>

                    <div className="legal-section">
                        <h2>13. Perubahan Syarat</h2>
                        <p>Kami dapat mengubah syarat dan ketentuan ini kapan saja. Perubahan akan diberitahukan melalui:</p>
                        <ul>
                            <li>Email kepada pengguna terdaftar</li>
                            <li>Pengumuman di website</li>
                            <li>Pembaruan tanggal efektif</li>
                        </ul>
                        <p>Penggunaan layanan setelah perubahan dianggap sebagai persetujuan terhadap syarat baru.</p>
                    </div>

                    <div className="legal-section">
                        <h2>14. Pemutusan Layanan</h2>
                        <p>Kami dapat menutup akun Anda jika:</p>
                        <ul>
                            <li>Melanggar syarat dan ketentuan</li>
                            <li>Melakukan aktivitas penipuan</li>
                            <li>Tidak aktif dalam jangka waktu lama</li>
                            <li>Atas permintaan Anda sendiri</li>
                        </ul>
                    </div>

                    <div className="legal-section">
                        <h2>15. Kontak</h2>
                        <p>Untuk pertanyaan tentang syarat dan ketentuan ini:</p>
                        <div className="contact-info-legal">
                            <div className="contact-item-legal">
                                <strong>Email:</strong> legal@ourshop.com
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
                        <p><strong>Dengan menggunakan layanan kami, Anda menyatakan telah membaca, memahami, dan menyetujui seluruh syarat dan ketentuan di atas.</strong></p>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default TermsConditions;
