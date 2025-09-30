import React, { useRef, useEffect, useState } from "react";

function MinimalVideoPlayer() {
  // ----------------------------------------------------
  // 1. Logic untuk Kontrol (Play/Pause Saja)
  // ----------------------------------------------------
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);

  const safePlay = async (video) => {
    if (!video) return false;
    try {
      const playPromise = video.play();
      if (playPromise && typeof playPromise.then === "function") {
        await playPromise;
      }
      return true;
    } catch (err) {
      // Autoplay might be blocked or element removed - ignore gracefully
      console.warn("Video play interrupted or blocked:", err?.message || err);
      return false;
    }
  };

  const togglePlay = async () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused || video.ended) {
      const ok = await safePlay(video);
      setIsPlaying(ok);
    } else {
      try {
        video.pause();
      } catch (err) {
        console.warn("Video pause error:", err);
      }
      setIsPlaying(false);
    }
  };

  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (video && video.duration) {
      const newProgress = (video.currentTime / video.duration) * 100;
      setProgress(newProgress);
    }
  };

  const handleVideoError = (e) => {
    console.error("Video failed to load:", e.target.error);
    console.error("Video src:", e.target.src);
    console.error("Video network state:", e.target.networkState);
    console.error("Video ready state:", e.target.readyState);
  };

  const handleVideoLoad = () => {
    console.log("Video loaded successfully");
  };

  // Otomatis Play di awal dan menambahkan event listener untuk pause/play saat klik video
  useEffect(() => {
    let mounted = true;
    const video = videoRef.current;
    if (video) {
      // Attempt to play but handle rejection gracefully
      safePlay(video).then((ok) => {
        if (mounted) setIsPlaying(Boolean(ok));
      });
      video.addEventListener("timeupdate", handleTimeUpdate);
    }
    return () => {
      mounted = false;
      if (video) {
        try {
          video.removeEventListener("timeupdate", handleTimeUpdate);
        } catch (e) {}
      }
    };
  }, []);

  // ----------------------------------------------------
  // 2. Markup JSX
  // ----------------------------------------------------
  return (
    <div
      style={{
        // Pembungkus luar (80% lebar layar)
        width: "80%",
        maxWidth: "1200px",
        margin: "20px auto",
      }}
    >
      {/* Teks di atas kontainer video (Opsional, jika masih diperlukan) */}
      {/*<h2 style={{ textAlign: 'center', marginBottom: '15px', color: '#333' }}>*/}
      {/*    Video Momen Keluarga*/}
      {/*</h2>*/}

      {/* Kontainer Video Utama (Position: Relative) */}
      <div
        style={{
          width: "100%",
          height: "550px", // Menetapkan tinggi agar proporsional
          position: "relative",
          borderRadius: "16px", // Siku tumpul
          overflow: "hidden",
          boxShadow: "0 8px 30px rgba(0, 0, 0, 0.5)",
        }}
      >
        {/* Elemen Video */}
        <video
          ref={videoRef}
          muted // Tanpa suara
          loop // Loop terus-menerus
          autoPlay // Otomatis diputar
          src="/video/Video_Keluarga_Makan_di_Restoran.mp4"
          type="video/mp4"
          style={{
            height: "100%",
            width: "100%",
            objectFit: "cover",
            filter: "brightness(65%)", // Efek Gelap
            display: "block",
            cursor: "pointer", // Tunjukkan bahwa video bisa di-klik
          }}
        >
          Maaf, browser Anda tidak mendukung pemutaran video HTML5.
        </video>

        {/* === START: OVERLAY ELEMENTS (Position: Absolute) === */}

        {/* OVERLAY KONTEN (Teks Quote dan Tombol Kontrol) */}
        <div
          style={{
            position: "absolute",
            bottom: "30px", // Jarak dari dasar
            right: "30px", // Jarak dari kanan
            left: "30px", // Jarak dari kiri
            color: "white",
            display: "flex",
            justifyContent: "space-between", // Pisahkan teks dan tombol
            alignItems: "flex-end",
            zIndex: 20,
            pointerEvents: "none", // Agar elemen ini tidak memblokir klik pada video
          }}
        >
          {/* Teks Quote (Kiri Bawah) */}
          <div
            style={{
              maxWidth: "60%",
              lineHeight: 1.6,
              fontSize: "15px",
              pointerEvents: "auto",
            }}
          >
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer nec
            odio. Praesent libero. Sed cursus ante dapibus diam. Sed nisi.
            <br />
            <br />
            <span
              style={{ fontWeight: "bold", fontSize: "13px", opacity: 0.8 }}
            >
              Anonim
            </span>
          </div>

          {/* Tombol Play/Pause Kustom (Kanan Bawah) */}
          <button
            onClick={togglePlay}
            style={{
              // Desain Tombol Minimalis & Modern
              width: "40px",
              height: "40px",
              borderRadius: "50%", // Bentuk bulat
              background: "rgba(255, 255, 255, 0.2)", // Latar belakang transparan
              border: "1px solid white", // Garis tepi putih
              color: "white",
              fontSize: "18px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              cursor: "pointer",
              transition: "background 0.3s",
              pointerEvents: "auto", // Tombol bisa diklik
            }}
            // Hover effect (di React bisa menggunakan onMouseEnter/onMouseLeave)
            onMouseOver={(e) =>
              (e.currentTarget.style.background = "rgba(255, 255, 255, 0.4)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = "rgba(255, 255, 255, 0.2)")
            }
          >
            {/* Ikon Play/Pause yang Lebih Clean */}
            {isPlaying ? "❚❚" : "▶"}
          </button>
        </div>
        {/* === END: OVERLAY ELEMENTS === */}
      </div>
    </div>
  );
}

export default MinimalVideoPlayer;
