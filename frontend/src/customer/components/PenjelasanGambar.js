// File: PenjelasanGambar.js

import React from 'react';
import './css/PenjelasanGambar.css';

const PenjelasanGambar = () => {
    return (
        <div className="penjelasan-container">
            <div className="penjelasan-content">

                {/* 1. KOLOM KIRI (Judul Kuat Saja) */}
                <div className="penjelasan-kiri">
                    <h1>Lorem ipsum dolor sit amet.</h1>
                    {/* Subheading dipindahkan ke kolom kanan */}
                </div>

                {/* 2. KOLOM KANAN (2 Poin Fitur & Tagline) */}
                <div className="penjelasan-kanan">
                    {/* Tagline/Subheading yang lebih lembut */}
                    <p className="penjelasan-tagline">
                        Consectetur adipiscing elit. Integer nec odio. Praesent libero. Sed cursus ante dapibus diam.
                    </p>

                    {/* Hanya 2 Poin Fitur dengan garis pemisah tipis */}
                    <div className="fitur-group-minimal">
                        <div className="fitur-item">
                            <div className="fitur-text">
                                <h2>Feature Title One</h2>
                                <p>
                                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed nisi. Nulla quis sem at nibh elementum imperdiet.
                                </p>
                            </div>
                        </div>
                        <div className="fitur-item">
                            <div className="fitur-text">
                                <h2>Feature Title Two</h2>
                                <p>
                                    Duis sagittis ipsum. Praesent mauris. Fusce nec tellus sed augue semper porta. Mauris massa.
                                </p>
                            </div>
                        </div>
                        {/* Poin 3 dan 4 Dihapus */}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PenjelasanGambar;
