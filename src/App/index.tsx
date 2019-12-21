import React, { useState, ChangeEvent } from "react";
import { RGB } from "../color";
import TunnelGraph from "./TunnelGraph";
import { Palette } from "./types";

const DEFAULT_COLOR = { r: 0.5, g: 0.5, b: 0.5 };

export default function App() {
  const [importedPalette, setImportedPalette] = useState(
    `{"hues":["foo","bar","new hue"],"shades":["baz","quux","new shade","new shade","new shade"],"colors":[[{"r":0.788235294117647,"g":0.1843137254901961,"b":0.0784313725490196},{"r":0.6705882352941176,"g":0.12941176470588237,"b":0.09019607843137255},{"r":0.6431372549019608,"g":0.07058823529411765,"b":0.054901960784313725},{"r":0.6431372549019608,"g":0.12156862745098039,"b":0.20784313725490197},{"r":0.5215686274509804,"g":0.0392156862745098,"b":0}],[{"r":0.42745098039215684,"g":0.788235294117647,"b":0.596078431372549},{"r":0.42745098039215684,"g":0.7058823529411765,"b":0.45098039215686275},{"r":0.3176470588235294,"g":0.6196078431372549,"b":0.3333333333333333},{"r":0.1803921568627451,"g":0.5333333333333333,"b":0.25882352941176473},{"r":0.06666666666666667,"g":0.43137254901960786,"b":0.21176470588235294}],[{"r":0.43529411764705883,"g":0.6470588235294118,"b":0.803921568627451},{"r":0.3843137254901961,"g":0.5843137254901961,"b":0.7333333333333333},{"r":0.25882352941176473,"g":0.5333333333333333,"b":0.6862745098039216},{"r":0.3215686274509804,"g":0.4549019607843137,"b":0.6196078431372549},{"r":0.2235294117647059,"g":0.3764705882352941,"b":0.5137254901960784}]]}`
  );

  const [{ hues, shades, colors }, setPalette] = useState<Palette>({
    hues: ["foo", "bar"],
    shades: ["baz", "quux"],
    colors: [
      [DEFAULT_COLOR, DEFAULT_COLOR],
      [DEFAULT_COLOR, DEFAULT_COLOR]
    ]
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
    <div>
      <div>
        <button onClick={() => alert(JSON.stringify({ hues, shades, colors }))}>
          Export State
        </button>

        <input
          onChange={event => setImportedPalette(event.target.value)}
          value={importedPalette}
        />
        <button onClick={() => setPalette(JSON.parse(importedPalette))}>
          Import State
        </button>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "500px auto",
          gridColumnGap: "16px"
        }}
      >
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
            gridTemplateRows: `repeat(3, 1fr)`,
            gridColumnGap: "16px",
            gridRowGap: "16px"
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
    </div>
  );
}
