import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import './styles/LandingHero.css';

type Props = {
  backgroundUrl: string;
  mobileUrl?: string;             // ✅ nuevo (opcional)
  productName: string;
  tagline: string;
  altText?: string;               // ✅ nuevo
  ctaText?: string;
  onCta?: () => void;
  subCtaText?: string;
  onSubCta?: () => void;
  variant?: 'tech' | 'asado';
};

export default function LandingHero({
  backgroundUrl,
  mobileUrl,
  productName,
  tagline,
  altText = "Brasero Fuego Eterno en acero inoxidable",
  ctaText = "Conocer más",
  onCta,
  subCtaText = "Ver especificaciones",
  onSubCta,
  variant = 'asado',
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [0, -40]);        // parallax sutil
  const opacity = useTransform(scrollYProgress, [0, 1], [1, 0.85]); // fade sutil

  return (
    <section ref={ref} className={`hero hero--${variant}`} style={{ position: 'relative' }}>
      
      {/* Background */}
      <img
        src={backgroundUrl}
        alt=""
        aria-hidden="true"
        className="hero-bg"
        loading="eager"
        fetchPriority="high"
      />

      {/* Capas visuales */}
      <div className="vignette" aria-hidden="true" />
      <div className="glow" aria-hidden="true" />
      {variant === 'asado' && (
        <>
          <div className="embers" aria-hidden="true" />
          <div className="heat-waves" aria-hidden="true" />
        </>
      )}
      <div className="hero-overlay" aria-hidden="true" />

      {/* Contenido */}
      <motion.div className="hero-content" style={{ y, opacity }}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <motion.h1
          className="hero-title"
          initial={{ y: 14, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.05, duration: 0.6 }}
        >
          {productName}
        </motion.h1>

        <motion.p
          className="hero-tagline"
          initial={{ y: 12, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.12, duration: 0.6 }}
        >
          {tagline}
        </motion.p>

        <motion.div
          className="hero-actions"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <button className="btn-primary" onClick={onCta}>{ctaText}</button>
          <button className="btn-ghost" onClick={onSubCta}>{subCtaText}</button>
        </motion.div>
      </motion.div>

    </section>
  );
}
