// web/src/pages/LandPage.jsx
import { useEffect, useRef, useState } from 'react';
import { Flame, Wind, Shield, Thermometer } from 'lucide-react';
import LandingHero from '../components/LandingHero';
import VideoPanel from '../components/VideoPanelHero';
import SectionSeparator from '../components/SectionSeparator';
import './styles/LandPage.css';

export default function LandPage() {
  const [isVisible, setIsVisible] = useState({});
  const sectionRefs = useRef({});

  // IntersectionObserver para revelar secciones
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsVisible((prev) => ({ ...prev, [entry.target.id]: entry.isIntersecting }));
        });
      },
      { threshold: 0.14 }
    );

    Object.values(sectionRefs.current).forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const features = [
    { icon: <Flame size={28} />, title: 'Calor Concentrado', desc: 'Mantiene el calor donde lo necesitás.' },
    { icon: <Wind size={28} />, title: 'Ventilación Superior', desc: 'Flujo de aire que maximiza la combustión.' },
    { icon: <Shield size={28} />, title: 'Construcción Robusta', desc: 'Metal de alta calidad, años de uso.' },
    { icon: <Thermometer size={28} />, title: 'Control de Temperatura', desc: 'Bandeja extraíble y mantenimiento fácil.' },
  ];

  const specs = [
    { label: 'Material', value: 'Acero de alta resistencia' },
    { label: 'Dimensiones', value: '40 × 40 × 45 cm' },
    { label: 'Peso', value: '12 kg' },
    { label: 'Acabado', value: 'Pintura térmica resistente' },
    { label: 'Características', value: 'Bandeja extraíble y cajón de cenizas' },
  ];

  return (
    
    <div className="LandPageContainer">
      
      {/* HERO: tu componente con imagen correcta */}
      <LandingHero
        variant="asado"
        backgroundUrl="/BraseroFuegoEterno.jpg"
        mobileUrl="/BraseroFuegoEterno.jpg"
        productName="Brasero Fuego Eterno"
        tagline="Acero, brasas y un ritual de fuego que eleva el asado."
      />


      {/* FEATURES */}
      <section
        id="features"
        ref={(el) => (sectionRefs.current.features = el)}
        className={`lp-section features ${isVisible['features'] ? 'in' : ''}`}
      >
        <div className="wrap">
          <header className="features__head">
            <h2 className="title-xl gradient-gold">Características Excepcionales</h2>
            <p className="subtitle">Diseñado con precisión para ofrecer el mejor rendimiento.</p>
          </header>

          <div className="features__grid">
            {features.map((f, i) => (
              <article key={i} className="feature-card" style={{ transitionDelay: `${i * 80}ms` }}>
                <div className="feature-card__icon">{f.icon}</div>
                <h3 className="feature-card__title">{f.title}</h3>
                <p className="feature-card__desc">{f.desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>


      {/* VIDEO HERO: integra tu panel de video */}
      <section id="video" className="lp-section lp-video">
        <VideoPanel
          variant="asado"
          gifFallback="/BraseroFuegoEterno.gif"
          // webmSrc="/video/brasero.webm"
          // mp4Src="/video/brasero.mp4"
          poster="/img/frame.jpg"
          headline="Calor real, humo envolvente"
          subhead="Disipación pareja, retención térmica y terminaciones profesionales."
          onCta={() => document.getElementById('specs')?.scrollIntoView({ behavior: 'smooth' })}
        />
      </section>

      {/* SPECS */}
      <section
        id="specs"
        ref={(el) => (sectionRefs.current.specs = el)}
        className={`lp-section specs ${isVisible['specs'] ? 'in' : ''}`}
      >
        <div className="wrap">
          <h2 className="title-xl">Especificaciones Técnicas</h2>
          <div className="specs__box">
            <ul className="specs__list">
              {specs.map((s, i) => (
                <li key={i} className="specs__item" style={{ transitionDelay: `${i * 80}ms` }}>
                  <span className="specs__label">{s.label}</span>
                  <span className="specs__value">{s.value}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section
        id="cta"
        ref={(el) => (sectionRefs.current.cta = el)}
        className={`lp-section cta ${isVisible['cta'] ? 'in' : ''}`}
      >
        <div className="cta__bg" />
        <div className="wrap cta__inner">
          <h2 className="title-xxl gradient-fire">Experimentá el Calor Auténtico</h2>
          <p className="cta__text">
            Transformá tus espacios con la calidez y elegancia de un brasero de calidad superior.
          </p>
          <div className="cta__actions">
            <button className="btn btn-primary">Comprar ahora</button>
            <button className="btn btn-outline">Contactar</button>
          </div>
        </div>
      </section>

      {/* FOOTER simple */}
      <footer className="lp-footer">
        <div className="wrap">
          <div className="footer__brand">
            <Flame size={24} />
            <span>FUEGO ETERNO</span>
          </div>
          <p className="footer__copy">Calidad superior en cada detalle — © 2025</p>
        </div>
      </footer>
    </div>
  );
}
