// src/components/icons/FeIcon.jsx
import React from "react";

/**
 * <FeIcon />
 * Props:
 * - size: número en px (default 24)
 * - variant: 'outline' | 'filled' | 'badge' (default 'badge')
 * - showNumber: bool (default true)  -> muestra "26"
 * - showWeight: bool (default false) -> muestra "55.85"
 * - rounded: número de borde redondeado (default 20)
 * - strokeWidth: ancho de borde (default 2)
 * - label: aria-label accesible (default "Hierro — Fe")
 * 
 * Tips:
 *  - color hereda de `currentColor`. Para modo monocromo, seteá `color` en el padre.
 *  - En variantes con gradiente, tomamos CSS vars: --bordo, --accent, --cream, --gold.
 */
export default function FeIcon({
  size = 24,
  variant = "badge",
  showNumber = true,
  showWeight = false,
  rounded = 20,
  strokeWidth = 2,
  label = "Hierro — Fe",
  ...rest
}) {
  const id = React.useId();
  const gradId = `fe-grad-${id}`;
  const isFilled = variant === "filled" || variant === "badge";

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 256 256"
      role="img"
      aria-label={label}
      {...rest}
    >
      <defs>
        {/* Gradiente que usa tu paleta */}
        <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%"  stopColor="var(--bordo, #6C0102)" />
          <stop offset="100%" stopColor="var(--accent, #FE8932)" />
        </linearGradient>
      </defs>

      {/* Fondo / badge */}
      {isFilled ? (
        <rect
          x="8"
          y="8"
          width="240"
          height="240"
          rx={rounded}
          fill={variant === "badge" ? `url(#${gradId})` : "currentColor"}
          opacity={variant === "filled" ? 0.1 : 1}
        />
      ) : null}

      {/* Borde */}
      <rect
        x="8"
        y="8"
        width="240"
        height="240"
        rx={rounded}
        fill="none"
        stroke={variant === "outline" ? "currentColor" : `url(#${gradId})`}
        strokeWidth={strokeWidth}
      />

      {/* Número atómico (26) */}
      {showNumber && (
        <text
          x="24"
          y="48"
          fontFamily="Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial"
          fontSize="28"
          fontWeight="700"
          fill="var(--gold, #CFB787)"
        >
          26
        </text>
      )}

      {/* Símbolo Fe */}
      <text
        x="50%" y="57%"
        dominantBaseline="middle"
        textAnchor="middle"
        fontFamily="Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial"
        fontSize="132"
        fontWeight="900"
        fill={variant === "outline" ? "currentColor" : "var(--cream, #FEE7B5)"}
        style={{ letterSpacing: "-4px" }}
      >
        Fe
      </text>

      {/* Masa atómica (opcional) */}
      {showWeight && (
        <text
          x="232"
          y="232"
          textAnchor="end"
          fontFamily="Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial"
          fontSize="24"
          fontWeight="600"
          fill="var(--muted, #796561)"
        >
          55.85
        </text>
      )}
    </svg>
  );
}
