import React, { useMemo } from "react";
import {
  MIN_SRGB_LUMINANCE,
  MAX_SRGB_LUMINANCE,
  MIN_SRGB_CHROMA,
  MAX_SRGB_CHROMA,
  MIN_SRGB_HUE,
  MAX_SRGB_HUE,
  lchToRGB,
  rgbIsDisplayable,
  rgbToLCH,
  LCH,
  RGB,
  rgbToHex
} from "../color";

interface Props {
  axis: "l" | "c" | "h";
  sequence: RGB[];
  selectedIndex: number;
}

export default function TunnelGraph({ axis, sequence, selectedIndex }: Props) {
  const colorSequence = useMemo(
    () => sequence.map(rgb => ({ rgb, lch: rgbToLCH(rgb) })),
    [sequence]
  );

  return (
    <div style={{ position: "relative" }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${sequence.length}, 1fr)`,
          gridTemplateRows: `30px 200px`
        }}
      >
        {colorSequence.map(({ rgb, lch }, index) => (
          <div
            key={index}
            style={{
              borderTop: `3px solid ${rgbToHex(rgb)}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: index === selectedIndex ? "gray" : "white"
            }}
          >
            {lch[axis].toFixed(2)}
          </div>
        ))}

        {colorSequence.map(({ rgb, lch }, index) => (
          <TunnelStack
            key={index}
            rgb={rgb}
            lch={lch}
            axis={axis}
            selected={index === selectedIndex}
          />
        ))}
      </div>
    </div>
  );
}

function TunnelStack({
  rgb,
  lch,
  axis,
  selected
}: {
  rgb: RGB;
  lch: LCH;
  axis: "l" | "c" | "h";
  selected: boolean;
}) {
  const SWEEP_STEPS = 100;

  const boxes = useMemo(() => {
    const { [axis]: _, ...rest } = lch;
    const [min, max] = {
      l: [MIN_SRGB_LUMINANCE, MAX_SRGB_LUMINANCE],
      c: [MIN_SRGB_CHROMA, MAX_SRGB_CHROMA],
      h: [MIN_SRGB_HUE, MAX_SRGB_HUE]
    }[axis];

    const range = [];
    for (let t = min; t < max; t += (max - min) / SWEEP_STEPS) {
      range.push(rgbIsDisplayable(lchToRGB({ [axis]: t, ...rest } as LCH)));
    }

    const risingEdges = [];

    if (range[0]) {
      risingEdges.push(0);
    }

    for (let i = 1; i < range.length; i++) {
      if (!range[i - 1] && range[i]) {
        risingEdges.push(i);
      }
    }

    const fallingEdges = [];

    for (let i = 0; i < range.length - 1; i++) {
      if (range[i] && !range[i + 1]) {
        fallingEdges.push(i);
      }
    }

    if (range[range.length - 1]) {
      fallingEdges.push(range.length - 1);
    }

    const result = [];
    for (let i = 0; i < risingEdges.length; i++) {
      const bottom = risingEdges[i] / SWEEP_STEPS;
      const top = fallingEdges[i] / SWEEP_STEPS;
      const height = top - bottom;
      result.push({ bottom, height });
    }

    return result;
  }, [lch, axis]);

  const [min, max] = {
    l: [MIN_SRGB_LUMINANCE, MAX_SRGB_LUMINANCE],
    c: [MIN_SRGB_CHROMA, MAX_SRGB_CHROMA],
    h: [MIN_SRGB_HUE, MAX_SRGB_HUE]
  }[axis];

  return (
    <div
      style={{
        backgroundColor: "#333333",
        position: "relative"
      }}
    >
      {boxes.map(({ bottom, height }, index) => (
        <div
          key={index}
          style={{
            position: "absolute",
            width: "100%",
            bottom: `${bottom * 100}%`,
            height: `${height * 100}%`,
            transition: "bottom 0.5s ease 0s, height 0.5s ease 0s",
            backgroundColor: selected ? "gray" : "white"
          }}
        />
      ))}

      <div
        style={{
          position: "absolute",
          backgroundColor: rgbToHex(rgb),
          left: "0",
          right: "0",
          marginLeft: "auto",
          marginRight: "auto",
          width: "10px",
          height: "10px",
          bottom: `calc(${(100 * (lch[axis] - min)) / (max - min)}% - 5px)`,
          borderRadius: "50%",
          borderStyle: "solid",
          borderColor: "white",
          borderWidth: "1px",
          boxShadow: "0 0 0 1px black",
          transition: "bottom 0.5s ease 0s"
        }}
      ></div>
    </div>
  );
}
