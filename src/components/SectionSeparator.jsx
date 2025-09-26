import PropTypes from "prop-types";

/**
 * Separador curvo entre secciones con fades arriba/abajo y línea de brillo.
 * Colócalo entre el Hero y el VideoPanel. Ajustá height/fades si querés.
 */
export default function SectionSeparator({
  variant = "asado",
  height = 220,
  topFade = 120,
  bottomFade = 110,
  curveAmplification = 1.0, // 0.8 = más suave | 1.2 = más marcada
}) {
// Colores por variante (mapeados a variables del theme)
    const isAsado = variant === "asado";
    const topColor  = getComputedStyle(document.documentElement)
      .getPropertyValue(isAsado ? "--color-dark" : "--color-dark").trim();
    const midColor  = getComputedStyle(document.documentElement)
      .getPropertyValue("--color-dark").trim();
    const edgeColor = getComputedStyle(document.documentElement)
      .getPropertyValue(isAsado ? "--color-primary" : "--color-info").trim();


  return (
    <div className={`sepv2 sepv2--${variant}`} style={{ height, position: "relative" }} aria-hidden="true">
      {/* Fades para transición suave con los fondos de las secciones vecinas */}
      <div
        className="sepv2-fade-top"
        style={{
          position: "absolute", inset: `0 0 auto 0`, height: Math.min(topFade, height),
          background: `linear-gradient(to bottom, ${topColor} 0%, rgba(0,0,0,0) 100%)`,
          pointerEvents: "none", zIndex: 1,
        }}
      />
      <div
        className="sepv2-fade-bottom"
        style={{
          position: "absolute", inset: `auto 0 0 0`, height: Math.min(bottomFade, height),
          background: `linear-gradient(to top, ${midColor} 0%, rgba(0,0,0,0) 100%)`,
          pointerEvents: "none", zIndex: 1,
        }}
      />

      {/* SVG principal */}
      <svg
        className="sepv2-svg"
        width="100%"
        height="100%"
        viewBox="0 0 1440 200"
        preserveAspectRatio="none"
        style={{ display: "block" }}
      >
        <defs>
          {/* Relleno que continúa el fondo */}
          <linearGradient id="fillGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={topColor} />
            <stop offset="100%" stopColor={midColor} />
          </linearGradient>

          {/* Glow fino de la línea */}
          <linearGradient id="edgeGlow" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={edgeColor} stopOpacity="0.55" />
            <stop offset="100%" stopColor={edgeColor} stopOpacity="0.0" />
          </linearGradient>

          {/* Máscara para suavizar bordes laterales del separador */}
          <linearGradient id="sideMask" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%"   stopColor="black" />
            <stop offset="3%"   stopColor="white" />
            <stop offset="97%"  stopColor="white" />
            <stop offset="100%" stopColor="black" />
          </linearGradient>
          <mask id="maskSides">
            <rect x="0" y="0" width="1440" height="200" fill="url(#sideMask)" />
          </mask>
        </defs>

        {/* Curva: ajustable con curveAmplification */}
        <g mask="url(#maskSides)">
          <path
            d={makePath(curveAmplification)}
            fill="url(#fillGrad)"
          />
          <path
            d={makeLine(curveAmplification)}
            fill="none"
            stroke="url(#edgeGlow)"
            strokeWidth="2"
            opacity="0.55"
          />
        </g>
      </svg>

      <style>{`
        .sepv2--asado { background: ${topColor}; }
        .sepv2--tech  { background: ${topColor}; }
      `}</style>
    </div>
  );
}

/** Curva relleno */
function makePath(k = 1.0) {
  // k controla “cuánto sube/baja” la curva
  const y1 = 120 * k;
  const y2 = 80  * k;
  const y3 = 120 * k;
  const y4 = 160 * k;
  return `M0,${y1} C240,${y1 + 40} 480,${y2 - 40} 720,${y2} C960,${y3} 1200,${y4} 1440,${y4 - 40} L1440,200 L0,200 Z`;
}

/** Curva línea superior */
function makeLine(k = 1.0) {
  const y1 = 120 * k;
  const y2 = 80  * k;
  const y3 = 120 * k;
  const y4 = 160 * k;
  return `M0,${y1} C240,${y1 + 40} 480,${y2 - 40} 720,${y2} C960,${y3} 1200,${y4} 1440,${y4 - 40}`;
}

SectionSeparator.propTypes = {
  variant: PropTypes.oneOf(["asado", "tech"]),
  height: PropTypes.number,        // altura total (px)
  topFade: PropTypes.number,       // desvanecido superior (px)
  bottomFade: PropTypes.number,    // desvanecido inferior (px)
  curveAmplification: PropTypes.number,
};
