import React, { useState, ChangeEvent, useEffect } from "react";
import { RGB, LCH, rgbToLCH, lchToRGB } from "../color";
import TunnelGraph from "./TunnelGraph";
import { Palette } from "./types";
import ColorEditor from "./ColorEditor";
import "./index.css";
import PaletteDisplay from "./PaletteDisplay";

const DEFAULT_COLOR = { r: 0.5, g: 0.5, b: 0.5 };

export default function App() {
  const [importedPalette, setImportedPalette] = useState(
    `{"hues":["Red","Green","Blue"],"shades":["50","100","200","300","400"],"colors":[[{"r":0.9783901377008425,"g":0.35953939267575336,"b":0.22051826554888315},{"r":0.8233185730271249,"g":0.2777279774920036,"b":0.19905678018195755},{"r":0.7078511912624108,"g":0.15041437702558877,"b":0.10232903375963262},{"r":0.5700142219638018,"g":0.005319274491069229,"b":0.15647091658177512},{"r":0.3639275956504139,"g":0.09375304535178947,"b":0.03946903908168702}],[{"r":0.2681739379482392,"g":0.633060141301358,"b":0.45166600417023545},{"r":0.24677377897388075,"g":0.5232733327900222,"b":0.2832511485305114},{"r":0.18755012896797302,"g":0.41700510772051375,"b":0.20476650384447775},{"r":0.0479993069426722,"g":0.32193260892655484,"b":0.1280168534149834},{"r":0.012427425239623126,"g":0.22259530871496774,"b":0.09421932715330802}],[{"r":0.3749379277908753,"g":0.5899869183679388,"b":0.7438739393947659},{"r":0.280582845758216,"g":0.48740044770490726,"b":0.6312646929024517},{"r":0.05358682011851349,"g":0.3963841870194739,"b":0.5417193115002815},{"r":0.13004332959275933,"g":0.28585664026396485,"b":0.4373745530576504},{"r":0.057418371802411265,"g":0.1993244016051749,"b":0.3026093462932969}]]}`
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

  const updateSelectedColor = (color: RGB) => {
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

  const handleColorChange = (event: ChangeEvent<HTMLInputElement>) => {
    updateSelectedColor(hexToRGB(event.target.value));
  };

  const hueSequence = colors[selectedColor.hue];
  const shadeSequence = colors.map(sequence => sequence[selectedColor.shade]);

  const selectedColorRGB = colors[selectedColor.hue][selectedColor.shade];
  const selectedColorLCH = rgbToLCH(selectedColorRGB);

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
          <PaletteDisplay
            palette={{ hues, shades, colors }}
            selectedHue={selectedColor.hue}
            selectedShade={selectedColor.shade}
            onColorSelect={setSelectedColor}
          />

          {/* <div
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
                  style={{
                    backgroundColor: rgbToHex(color),
                    border:
                      hue === selectedColor.hue && shade === selectedColor.shade
                        ? "4px solid white"
                        : ""
                  }}
                  onClick={() => setSelectedColor({ hue, shade })}
                >
                  {rgbToHex(color)}
                </div>
              ))
            )}
          </div> */}

          <input
            type="color"
            value={rgbToHex(colors[selectedColor.hue][selectedColor.shade])}
            onChange={handleColorChange}
          />

          <button onClick={handleAddHue}>Add Hue</button>
          <button onClick={handleAddShade}>Add Shade</button>

          <div>
            <ColorEditor
              rgb={selectedColorRGB}
              lch={selectedColorLCH}
              hue={hues[selectedColor.hue]}
              shade={shades[selectedColor.shade]}
              onUpdate={rgb => updateSelectedColor(rgb)}
            />
          </div>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(2, 1fr)`,
            gridTemplateRows: `30px repeat(3, 1fr)`,
            gridColumnGap: "16px",
            gridRowGap: "16px"
          }}
        >
          <div>{hues[selectedColor.hue]}</div>
          <div>{shades[selectedColor.shade]}</div>
          <TunnelGraph
            axis="l"
            sequence={hueSequence}
            selectedIndex={selectedColor.shade}
          />
          <TunnelGraph
            axis="l"
            sequence={shadeSequence}
            selectedIndex={selectedColor.hue}
          />
          <TunnelGraph
            axis="c"
            sequence={hueSequence}
            selectedIndex={selectedColor.shade}
          />
          <TunnelGraph
            axis="c"
            sequence={shadeSequence}
            selectedIndex={selectedColor.hue}
          />
          <TunnelGraph
            axis="h"
            sequence={hueSequence}
            selectedIndex={selectedColor.shade}
          />
          <TunnelGraph
            axis="h"
            sequence={shadeSequence}
            selectedIndex={selectedColor.hue}
          />
        </div>
      </div>
    </div>
  );
}
