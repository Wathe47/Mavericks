import React, { useRef, useEffect, useState } from "react";

const ANXIETY_TYPES = [
  "No Anxiety",
  "GAD",
  "Social Anxiety",
  "Panic Disorder",
];

const COLORS = ["#38f07b", "#f7e967", "#ffb347", "#FF5F6D"];

function normalizePrediction(prediction) {
  if (!prediction) return "N/A";
  const cleaned = prediction.trim().toLowerCase();
  if (
    cleaned === "general anxiety disorder" ||
    cleaned === "genral anxiety diorder" ||
    cleaned === "gad"
  ) return "GAD";
  if (cleaned === "no anxiety") return "No Anxiety";
  if (cleaned === "social anxiety") return "Social Anxiety";
  if (cleaned === "panic disorder") return "Panic Disorder";
  return prediction;
}

function getDisplayType(prediction) {
  if (!prediction) return "";
  if (
    prediction === "GAD" ||
    prediction.toLowerCase() === "gad" ||
    prediction.toLowerCase().includes("general")
  ) return "Generalized Anxiety Disorder";
  return prediction;
}

export default function AnxietyWheel({ prediction, spinning: externalSpinning }) {
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const prevPrediction = useRef(null);
  const spinInterval = useRef(null);

  const segmentAngle = 360 / ANXIETY_TYPES.length;
  const normalized = normalizePrediction(prediction);
  const targetIndex = ANXIETY_TYPES.indexOf(normalized);

  useEffect(() => {
    if (externalSpinning) {
      setSpinning(true);
      let angle = rotation;
      spinInterval.current = setInterval(() => {
        angle += 10;
        setRotation(angle);
      }, 16);
    } else {
      if (spinInterval.current) {
        clearInterval(spinInterval.current);
        spinInterval.current = null;
      }
    }
    return () => {
      if (spinInterval.current) clearInterval(spinInterval.current);
    };
    // eslint-disable-next-line
  }, [externalSpinning]);

  useEffect(() => {
    if (
      prediction &&
      targetIndex !== -1 &&
      prevPrediction.current !== prediction
    ) {
      if (spinInterval.current) {
        clearInterval(spinInterval.current);
        spinInterval.current = null;
      }
      const randomTurns = 3 + Math.floor(Math.random() * 2);
      const finalAngle =
        360 * randomTurns +
        (360 - targetIndex * segmentAngle - segmentAngle / 2);
      setSpinning(true);
      setRotation(finalAngle);
      prevPrediction.current = prediction;
      setTimeout(() => setSpinning(false), 3200);
    }
    // eslint-disable-next-line
  }, [prediction]);

  function getTextProps(i) {
    const angle = i * segmentAngle + segmentAngle / 2 - 90;
    const rad = (Math.PI * angle) / 180;
    const x = 150 + 80 * Math.cos(rad);
    const y = 150 + 80 * Math.sin(rad);

    let rotate = -angle;

    if (!spinning && i === targetIndex) {
      rotate += 180; // Flip only the predicted segment label
    }

    return { x, y, rotate };
  }

  return (
    <div style={{ position: "relative", width: 340, margin: "0 auto" }}>
      <div style={{ textAlign: "center", fontWeight: "bold", fontSize: 22, marginBottom: 12 }}>
        Prediction Result
      </div>

      {/* Arrow */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: 32,
          transform: "translateX(-50%)",
          zIndex: 2,
        }}
      >
        <svg width={40} height={40} style={{ transform: "rotate(180deg)" }}>
          <polygon
            points="20,0 30,30 10,30"
            fill="#222"
            stroke="#fff"
            strokeWidth={2}
          />
        </svg>
      </div>

      {/* Wheel */}
      <div
        style={{
          width: 300,
          height: 300,
          borderRadius: "50%",
          margin: "0 auto",
          transition: spinning ? "transform 3s cubic-bezier(.17,.67,.83,.67)" : "",
          transform: `rotate(${rotation}deg)`,
          boxShadow: "0 0 20px #0004",
          background: "#fff",
        }}
      >
        <svg width={300} height={300} viewBox="0 0 300 300">
          {ANXIETY_TYPES.map((type, i) => {
            const startAngle = i * segmentAngle - 90;
            const endAngle = (i + 1) * segmentAngle - 90;
            const largeArc = segmentAngle > 180 ? 1 : 0;
            const r = 150;
            const x1 = 150 + r * Math.cos((Math.PI * startAngle) / 180);
            const y1 = 150 + r * Math.sin((Math.PI * startAngle) / 180);
            const x2 = 150 + r * Math.cos((Math.PI * endAngle) / 180);
            const y2 = 150 + r * Math.sin((Math.PI * endAngle) / 180);
            const { x, y, rotate } = getTextProps(i);
            return (
              <g key={type}>
                <path
                  d={`M150,150 L${x1},${y1} A${r},${r} 0 ${largeArc},1 ${x2},${y2} Z`}
                  fill={COLORS[i]}
                  stroke="#fff"
                  strokeWidth={3}
                />
                <text
                  x={x}
                  y={y}
                  textAnchor="middle"
                  alignmentBaseline="middle"
                  fontSize={18}
                  fill="#222"
                  fontWeight="bold"
                  style={{
                    userSelect: "none",
                  }}
                  transform={`rotate(${rotate},${x},${y})`}
                >
                  <tspan
                    style={{
                      fontSize: 18,
                      fontWeight: "bold",
                    }}
                  >
                    {type}
                  </tspan>
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <div style={{ textAlign: "center", marginTop: 24, color: "#64748b", fontSize: 20 }}>
        Anxiety Type: <span style={{ fontWeight: "bold" }}>{getDisplayType(prediction)}</span>
      </div>
    </div>
  );
}
