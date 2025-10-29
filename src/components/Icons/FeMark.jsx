import React from "react";
import FeIcon from "./FeIcon";

export default function FeMark({
  size = 28,
  gap = 10,
  text = "Fuego-Eterno",
  weight = 900,
  upper = true,
  color,                 // si querés forzar color
  ...rest
}) {
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap }} {...rest}>
      <span style={{ lineHeight: 0, color }}>
        <FeIcon size={size} variant="badge" />
      </span>
      <span
        style={{
          fontFamily: "Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial",
          fontWeight: weight,
          letterSpacing: ".6px",
          color: "var(--cream, #FEE7B5)",
        }}
      >
        {upper ? String(text).toUpperCase() : text}
      </span>
    </div>
  );
}
