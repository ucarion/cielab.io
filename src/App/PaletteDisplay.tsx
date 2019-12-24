import React, { Fragment, useMemo } from "react";
import { Palette } from "./types";
import {
  rgbToHex,
  RGB,
  wcagContrastRatio,
  RGB_BLACK,
  RGB_WHITE
} from "../color";

interface Props {
  palette: Palette;
  selectedHue: number;
  selectedShade: number;
  onColorSelect: (color: { hue: number; shade: number }) => void;
}

export default function PaletteDisplay({
  palette: { hues, shades, colors },
  selectedHue,
  selectedShade,
  onColorSelect
}: Props) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${1 + shades.length}, 1fr)`,
        gridTemplateRows: `30px repeat(${hues.length}, 50px)`
      }}
    >
      <div />
      {shades.map((shade, shadeIndex) => (
        <div
          key={shadeIndex}
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: shadeIndex === selectedShade ? "#eee" : "white"
          }}
        >
          {shade}
        </div>
      ))}

      {hues.map((hue, hueIndex) => (
        <Fragment key={hueIndex}>
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              alignItems: "center",
              paddingRight: "8px",
              backgroundColor: hueIndex === selectedHue ? "#eee" : "white"
            }}
          >
            {hue}
          </div>

          {shades.map((_, shadeIndex) => (
            <ColorDisplay
              key={shadeIndex}
              rgb={colors[hueIndex][shadeIndex]}
              selected={
                hueIndex === selectedHue && shadeIndex === selectedShade
              }
              onSelect={() =>
                onColorSelect({ hue: hueIndex, shade: shadeIndex })
              }
            />
          ))}
        </Fragment>
      ))}
    </div>
  );
}

interface ColorDisplayProps {
  rgb: RGB;
  selected: boolean;
  onSelect: () => void;
}

function ColorDisplay({ rgb, selected, onSelect }: ColorDisplayProps) {
  const contrastRatioWhite = useMemo(() => wcagContrastRatio(rgb, RGB_WHITE), [
    rgb
  ]);
  const contrastRatioBlack = useMemo(() => wcagContrastRatio(rgb, RGB_BLACK), [
    rgb
  ]);

  const isTextWhite = contrastRatioWhite > contrastRatioBlack;

  return (
    <div
      style={{
        backgroundColor: rgbToHex(rgb),
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        color: isTextWhite ? "white" : "black",
        border: selected ? "4px solid white" : ""
      }}
      onClick={onSelect}
    >
      {isTextWhite
        ? contrastRatioWhite.toFixed(1)
        : contrastRatioBlack.toFixed(1)}
    </div>
  );
}
