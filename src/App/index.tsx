import React, { useState, ChangeEvent } from "react";
import { RGB } from "../color";
import TunnelGraph from "./TunnelGraph";
import { Palette } from "./types";

const DEFAULT_COLOR = { r: 0.5, g: 0.5, b: 0.5 };

export default function App() {
  const [{ hues, shades, colors }, setPalette] = useState<Palette>({
    hues: ["hue"],
    shades: ["shade"],
    colors: [[DEFAULT_COLOR]]
  });

  const [selectedColor, setSelectedColor] = useState({ hue: 0, shade: 0 });

  const channelToHex = (t: number): string => {
    return Math.round(t * 255)
      .toString(16)
      .padStart(2, "0");
  };

  const rgbToHex = ({ r, g, b }: RGB): string => {
    return `#${channelToHex(r)}${channelToHex(g)}${channelToHex(b)}`;
  };

  const hexToRGB = (hex: string): RGB => {
    return {
      r: parseInt(hex.substring(1, 3), 16) / 255,
      g: parseInt(hex.substring(3, 5), 16) / 255,
      b: parseInt(hex.substring(5, 7), 16) / 255
    };
  };

  const handleAddHue = () => {
    setPalette({
      hues: [...hues, "new hue"],
      shades,
      colors: [...colors, Array(shades.length).fill(DEFAULT_COLOR)]
    });
  };

  const handleAddShade = () => {
    setPalette({
      hues,
      shades: [...shades, "new shade"],
      colors: colors.map(sequence => [...sequence, DEFAULT_COLOR])
    });
  };

  const handleColorChange = (event: ChangeEvent<HTMLInputElement>) => {
    const color = hexToRGB(event.target.value);
    const { hue, shade } = selectedColor;

    setPalette({
      hues,
      shades,
      colors: [
        ...colors.slice(0, hue),
        [
          ...colors[hue].slice(0, shade),
          color,
          ...colors[hue].slice(shade + 1)
        ],
        ...colors.slice(hue + 1)
      ]
    });
  };

  const hueSequence = colors[selectedColor.hue];
  const shadeSequence = colors.map(sequence => sequence[selectedColor.shade]);

  return (
    <div style={{ display: "grid", gridTemplateColumns: "500px auto" }}>
      <div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${shades.length}, 1fr)`,
            gridTemplateRows: `repeat(${hues.length}, 50px)`
          }}
        >
          {colors.map((sequence, hue) =>
            sequence.map((color, shade) => (
              <div
                key={`${hue}.${shade}`}
                style={{ backgroundColor: rgbToHex(color) }}
                onClick={() => setSelectedColor({ hue, shade })}
              >
                {rgbToHex(color)}
              </div>
            ))
          )}
        </div>

        <input
          type="color"
          value={rgbToHex(colors[selectedColor.hue][selectedColor.shade])}
          onChange={handleColorChange}
        />

        <button onClick={handleAddHue}>Add Hue</button>
        <button onClick={handleAddShade}>Add Shade</button>
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(2, 1fr)`,
          gridTemplateRows: `repeat(3, 1fr)`
        }}
      >
        <TunnelGraph axis="l" sequence={hueSequence} />
        <TunnelGraph axis="l" sequence={shadeSequence} />
        <TunnelGraph axis="c" sequence={hueSequence} />
        <TunnelGraph axis="c" sequence={shadeSequence} />
        <TunnelGraph axis="h" sequence={hueSequence} />
        <TunnelGraph axis="h" sequence={shadeSequence} />
      </div>
    </div>
  );
}
