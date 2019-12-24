import React, { Fragment, useMemo } from "react";
import { Palette } from "./types";
import {
  rgbToHex,
  RGB,
  wcagContrastRatio,
  RGB_BLACK,
  RGB_WHITE
} from "../color";
import { faQuestionCircle } from "@fortawesome/free-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";

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
  const selectedRGB = colors[selectedHue][selectedShade];

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${1 + shades.length}, 1fr)`,
        gridTemplateRows: `30px repeat(${hues.length}, 50px)`
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "right",
          alignItems: "center",
          paddingRight: "8px"
        }}
      >
        <OverlayTrigger
          placement="bottom"
          overlay={
            <Tooltip id="tooltip-palette-display">
              This table shows you all of the colors in the palette.
              <br />
              <br />
              When you click on a color, the numbers in the table are the WCAG
              constrast ratio of those colors versus your selected color.
            </Tooltip>
          }
        >
          <FontAwesomeIcon className="ml-2" icon={faQuestionCircle} />
        </OverlayTrigger>
      </div>
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
              selectedRGB={selectedRGB}
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
  selectedRGB: RGB;
  selected: boolean;
  onSelect: () => void;
}

function ColorDisplay({
  rgb,
  selectedRGB,
  selected,
  onSelect
}: ColorDisplayProps) {
  const contrastRatioWhite = useMemo(() => wcagContrastRatio(rgb, RGB_WHITE), [
    rgb
  ]);
  const contrastRatioBlack = useMemo(() => wcagContrastRatio(rgb, RGB_BLACK), [
    rgb
  ]);

  const isTextWhite = contrastRatioWhite > contrastRatioBlack;

  const contrastRatioSelected = useMemo(
    () => wcagContrastRatio(rgb, selectedRGB),
    [rgb, selectedRGB]
  );

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
      {contrastRatioSelected.toFixed(1)}
    </div>
  );
}
