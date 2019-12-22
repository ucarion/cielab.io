import React, { useState, ChangeEvent, useMemo } from "react";
import {
  RGB,
  LCH,
  rgbToLCH,
  lchToRGB,
  wcagContrastRatio,
  RGB_BLACK,
  RGB_WHITE
} from "../color";
import TunnelGraph from "./TunnelGraph";
import { Palette } from "./types";
import ColorEditor from "./ColorEditor";
import "./index.css";
import PaletteDisplay from "./PaletteDisplay";
import { PRESETS } from "./presets";

const DEFAULT_COLOR = { r: 0.5, g: 0.5, b: 0.5 };

export default function App() {
  const [{ hues, shades, colors }, setPalette] = useState(PRESETS[0]);
  const [selectedColor, setSelectedColor] = useState({
    hue: Math.round(PRESETS[0].hues.length / 2),
    shade: Math.round(PRESETS[0].shades.length / 2)
  });

  const handlePresetChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const preset = PRESETS[event.target.selectedIndex];

    setSelectedColor({
      hue: Math.round(preset.hues.length / 2),
      shade: Math.round(preset.shades.length / 2)
    });
    setPalette(preset);
  };

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

  const triggerDownload = (fileName: string, blob: Blob) => {
    const element = document.createElement("a");
    element.href = URL.createObjectURL(blob);
    element.download = fileName;
    document.body.appendChild(element);
    element.click();
  };

  const handleExportJSON = () => {
    const result: { [name: string]: string } = {};
    for (const [hueIndex, hue] of hues.entries()) {
      for (const [shadeIndex, shade] of shades.entries()) {
        result[`${hue}${shade}`] = rgbToHex(colors[hueIndex][shadeIndex]);
      }
    }

    triggerDownload(
      "palette.json",
      new Blob([JSON.stringify(result, null, 2)], { type: "application/json" })
    );
  };

  const hueSequence = colors[selectedColor.hue];
  const shadeSequence = colors.map(sequence => sequence[selectedColor.shade]);

  const selectedColorRGB = colors[selectedColor.hue][selectedColor.shade];
  const selectedColorLCH = rgbToLCH(selectedColorRGB);

  const contrastRatioWhite = useMemo(
    () => wcagContrastRatio(selectedColorRGB, RGB_WHITE),
    [selectedColorRGB]
  );
  const contrastRatioBlack = useMemo(
    () => wcagContrastRatio(selectedColorRGB, RGB_BLACK),
    [selectedColorRGB]
  );

  const isHeaderTextWhite = contrastRatioWhite > contrastRatioBlack;

  return (
    <div>
      <div
        style={{
          height: "56px",
          backgroundColor: rgbToHex(selectedColorRGB),
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          paddingLeft: "32px",
          paddingRight: "32px",
          boxSizing: "border-box",
          color: isHeaderTextWhite ? "white" : "black",
          transition: "background-color 0.5s, color 0.5s"
        }}
      >
        <span style={{ display: "flex", alignItems: "center" }}>
          <a
            style={{
              color: isHeaderTextWhite ? "white" : "black",
              transition: "color 0.5s",
              display: "flex",
              alignItems: "center"
            }}
            href="/"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
            >
              <path
                d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9c.83 0 1.5-.67 1.5-1.5 0-.39-.15-.74-.39-1.01-.23-.26-.38-.61-.38-.99 0-.83.67-1.5 1.5-1.5H16c2.76 0 5-2.24 5-5 0-4.42-4.03-8-9-8zm-5.5 9c-.83 0-1.5-.67-1.5-1.5S5.67 9 6.5 9 8 9.67 8 10.5 7.33 12 6.5 12zm3-4C8.67 8 8 7.33 8 6.5S8.67 5 9.5 5s1.5.67 1.5 1.5S10.33 8 9.5 8zm5 0c-.83 0-1.5-.67-1.5-1.5S13.67 5 14.5 5s1.5.67 1.5 1.5S15.33 8 14.5 8zm3 4c-.83 0-1.5-.67-1.5-1.5S16.67 9 17.5 9s1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"
                fill={isHeaderTextWhite ? "white" : "black"}
              />
              <path d="M0 0h24v24H0z" fill="none" />
            </svg>
          </a>
          <a
            style={{
              color: isHeaderTextWhite ? "white" : "black",
              transition: "color 0.5s",
              display: "flex",
              alignItems: "center"
            }}
            href="/"
          >
            <span style={{ marginLeft: "8px" }}>cielab.io</span>
          </a>
          <span style={{ marginLeft: "32px" }}>Load preset</span>
          <select style={{ marginLeft: "8px" }} onChange={handlePresetChange}>
            <option>Google (Material UI)</option>
            <option>IBM (Carbon)</option>
            <option>US Digital Service (USWDS)</option>
            <option>Ant Financial (Ant Design)</option>
            <option>Segment (Evergreen)</option>
            <option>GitHub (Primer)</option>
          </select>
        </span>

        <span>
          <button>Export as Figma Style</button>
          <button onClick={handleExportJSON}>
            Export as JSON / JavaScript
          </button>
        </span>
      </div>

      <div
        style={{ paddingTop: "8px", paddingLeft: "8px", paddingRight: "8px" }}
      >
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
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center"
              }}
            >
              <div>{hues[selectedColor.hue]}</div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: `repeat(${shades.length}, 48px)`,
                  gridTemplateRows: "32px"
                }}
              >
                {colors[selectedColor.hue].map((color, shadeIndex) => (
                  <div
                    key={shadeIndex}
                    style={{
                      backgroundColor: rgbToHex(color),
                      border:
                        selectedColor.shade === shadeIndex
                          ? "4px solid white"
                          : ""
                    }}
                  />
                ))}
              </div>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center"
              }}
            >
              <div>{shades[selectedColor.shade]}</div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: `repeat(${hues.length}, 48px)`,
                  gridTemplateRows: "32px"
                }}
              >
                {colors.map((shadeSequence, hueIndex) => (
                  <div
                    key={hueIndex}
                    style={{
                      backgroundColor: rgbToHex(
                        shadeSequence[selectedColor.shade]
                      ),
                      border:
                        selectedColor.hue === hueIndex ? "4px solid white" : ""
                    }}
                  />
                ))}
              </div>
            </div>
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
    </div>
  );
}
