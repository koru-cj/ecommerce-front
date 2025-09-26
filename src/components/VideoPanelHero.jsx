import PropTypes from "prop-types";
import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

export default function VideoPanel({
  webmSrc,
  mp4Src,
  gifFallback,
  poster,
  headline = "Fuego vivo, acero y precisión",
  subhead = "Textura de brasas real, calor envolvente y un acabado premium.",
  ctaText = "Ver especificaciones",
  onCta,
  variant = "asado",
}) {
  const ref = useRef(null);
  const videoRef = useRef(null);

  const hasSources = Boolean(webmSrc || mp4Src);
  const [useGif, setUseGif] = useState(!hasSources);

  // Parallax sutil
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [20, -20]);
  const opacity = useTransform(scrollYProgress, [0, 1], [1, 0.95]);

  // Autoplay solo en viewport y si no se prefiere menos movimiento
  useEffect(() => {
    if (!hasSources || useGif) return;
    const v = videoRef.current;
    if (!v) return;

    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReduced) { v.pause(); return; }

    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => (e.isIntersecting ? v.play().catch(() => {}) : v.pause())),
      { threshold: 0.35 }
    );
    io.observe(v);
    return () => io.disconnect();
  }, [hasSources, useGif]);

  // Si el video falla, pasamos a GIF
  const handleVideoError = () => {
    if (gifFallback) setUseGif(true);
  };

  return (
    <section ref={ref} className={`vp vp--${variant}`} style={{ position: "relative" }}>
      <div className="vp-media">
        {useGif ? (
          gifFallback ? (
            <img className="vp-video" src={gifFallback} alt="" aria-hidden="true" />
          ) : null
        ) : (
          <video
            ref={videoRef}
            className="vp-video"
            autoPlay
            muted
            playsInline
            loop
            preload="metadata"
            poster={poster}
            onError={handleVideoError}
          >
            {webmSrc && <source src={webmSrc} type="video/webm" />}
            {mp4Src && <source src={mp4Src} type="video/mp4" />}
          </video>
        )}

        <div className="vp-overlay" aria-hidden="true" />
        <div className="vp-glow" aria-hidden="true" />
      </div>

      <motion.div
        className="vp-content"
        style={{ y, opacity }}
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
      >
        <h2 className="vp-title">{headline}</h2>
        <p className="vp-sub">{subhead}</p>
        <div className="vp-actions">
          <button className="btn-primary" onClick={onCta}>{ctaText}</button>
        </div>
      </motion.div>

      <style>{`
        .vp {
          min-height: 86vh;
          display: grid;
          place-items: center;
          overflow: clip;
          background: #0b0b0c;
          color: #f5f6f7;
          isolation: isolate;
        }
        .vp-media { position: absolute; inset: 0; z-index: -2; }
        .vp-video {
          position: absolute; inset: 0;
          width: 100%; height: 100%;
          object-fit: cover; object-position: center;
          filter: saturate(1.08) contrast(1.04);
        }
        .vp-overlay {
          position: absolute; inset: 0;
          background:
            linear-gradient(to bottom, rgba(0,0,0,.20), rgba(0,0,0,.55) 60%, rgba(0,0,0,.70)),
            radial-gradient(120% 90% at 50% 40%, rgba(0,0,0,0) 40%, rgba(0,0,0,.45) 100%);
          mix-blend-mode: multiply;
        }
        .vp-glow {
          position: absolute; inset: 0; pointer-events: none;
          filter: blur(40px);
          opacity: .55;
        }
        .vp-content {
          width: min(1100px, 92vw);
          padding: clamp(2rem, 6vw, 5rem) 1.2rem;
          text-align: left;
        }
        .vp-title { margin: 0 0 .5rem; font-size: clamp(1.8rem, 5.4vw, 3.2rem); letter-spacing: -0.01em; }
        .vp-sub   { margin: .25rem 0 1.2rem; font-size: clamp(1rem, 2.2vw, 1.25rem); opacity: .92; max-width: 65ch; }
        .vp-actions { display: flex; gap: .8rem; flex-wrap: wrap; }

        .vp--tech .vp-glow {
          background:
            radial-gradient(700px 480px at 50% 65%, rgba(0,188,255,.35), transparent 60%),
            radial-gradient(900px 560px at 65% 35%, rgba(120,82,255,.28), transparent 70%);
        }
        .vp--tech .btn-primary { background: #2ea8ff; color: #fff; box-shadow: 0 8px 26px rgba(46,168,255,.28); }

        .vp--asado .vp-glow {
          background:
            radial-gradient(720px 520px at 50% 70%, rgba(255,120,20,.38), transparent 60%),
            radial-gradient(960px 600px at 52% 38%, rgba(255,48,64,.20), transparent 70%);
        }
        .vp--asado .btn-primary { background: linear-gradient(90deg,#ff7a2a,#ff3c3c); color: #fff; box-shadow: 0 10px 28px rgba(255,85,40,.28); }

        @media (max-width: 640px) {
          .vp { min-height: 78vh; }
          .vp-content { text-align: center; }
          .vp-actions { justify-content: center; }
        }
        .vp::before{
          content:"";
          position:absolute; inset: -1px 0 auto 0; height: 80px;
          background: linear-gradient(to top, rgba(0,0,0,0) 0%, rgba(0,0,0,.35) 100%);
          pointer-events:none;
          z-index:-1;
        }

      `}</style>
    </section>
  );
}

VideoPanel.propTypes = {
  webmSrc: PropTypes.string,
  mp4Src: PropTypes.string,
  gifFallback: PropTypes.string,
  poster: PropTypes.string,
  headline: PropTypes.string,
  subhead: PropTypes.string,
  ctaText: PropTypes.string,
  onCta: PropTypes.func,
  variant: PropTypes.oneOf(["tech", "asado"]),
};
