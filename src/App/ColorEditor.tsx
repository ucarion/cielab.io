import React, {
  useState,
  ChangeEvent,
  KeyboardEvent,
  useEffect,
  useMemo
} from "react";
import {
  RGB,
  LCH,
  rgbToHex,
  MAX_SRGB_LUMINANCE,
  hexToRGB,
  rgbIsDisplayable,
  lchToRGB,
  wcagContrastRatio,
  RGB_WHITE,
  RGB_BLACK
} from "../color";

interface Props {
  rgb: RGB;
  lch: LCH;
  hue: string;
  shade: string;
  onUpdate: (rgb: RGB) => void;
}

export default function ColorEditor({
  rgb,
  lch: { l, c, h },
  hue,
  shade,
  onUpdate
}: Props) {
  const [rgbInput, setRGBInput] = useState(rgbToHex(rgb));
  const [isRGBInputValid, setIsRGBInputValid] = useState(true);
  const [lInput, setLInput] = useState(l.toFixed(2));
  const [isLInputValid, setLInputValid] = useState(true);
  const [cInput, setCInput] = useState(c.toFixed(2));
  const [isCInputValid, setCInputValid] = useState(true);
  const [hInput, setHInput] = useState(h.toFixed(2));
  const [isHInputValid, setHInputValid] = useState(true);

  const contrastRatioWhite = useMemo(() => wcagContrastRatio(rgb, RGB_WHITE), [
    rgb
  ]);
  const contrastRatioBlack = useMemo(() => wcagContrastRatio(rgb, RGB_BLACK), [
    rgb
  ]);

  const isTextWhite = contrastRatioWhite > contrastRatioBlack;

  useEffect(() => {
    setRGBInput(rgbToHex(rgb));
    setIsRGBInputValid(true);
  }, [rgb]);

  useEffect(() => {
    setLInput(l.toFixed(2));
    setCInput(c.toFixed(2));
    setHInput(h.toFixed(2));
    setLInputValid(true);
    setCInputValid(true);
    setHInputValid(true);
  }, [l, c, h]);

  const handleRGBChange = (event: ChangeEvent<HTMLInputElement>) => {
    setRGBInput(event.target.value);

    try {
      const rgb = hexToRGB(event.target.value);

      if (rgbIsDisplayable(rgb)) {
        setIsRGBInputValid(true);
      } else {
        setIsRGBInputValid(false);
      }
    } catch {
      setIsRGBInputValid(false);
    }
  };

  const handleRGBBlur = () => {
    if (isRGBInputValid) {
      onUpdate(hexToRGB(rgbInput));
    }
  };

  const handleRGBKeyPress = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      handleRGBBlur();
    }
  };

  const handleLCHBlur = () => {
    if (isLInputValid && isCInputValid && isHInputValid) {
      onUpdate(
        lchToRGB({
          l: parseFloat(lInput),
          c: parseFloat(cInput),
          h: parseFloat(hInput)
        })
      );
    }
  };

  const handleLCHKeyPress = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      handleLCHBlur();
    }
  };

  const handleLCHChange = (
    event: ChangeEvent<HTMLInputElement>,
    axis: keyof LCH
  ) => {
    const [setInput, setValid] = {
      l: [setLInput, setLInputValid] as const,
      c: [setCInput, setCInputValid] as const,
      h: [setHInput, setHInputValid] as const
    }[axis];

    setInput(event.target.value);

    try {
      const value = parseFloat(event.target.value);
      const lch = { l, c, h, [axis]: value };
      const rgb = lchToRGB(lch);

      if (rgbIsDisplayable(rgb)) {
        setValid(true);
      } else {
        setValid(false);
      }
    } catch {
      setValid(false);
    }
  };

  return (
    <div>
      <div
        style={{
          width: "100%",
          height: "200px",
          backgroundColor: rgbToHex(rgb),
          display: "grid",
          justifyContent: "center",
          alignItems: "center",
          color: isTextWhite ? "white" : "black"
        }}
      >
        {hue} {shade}{" "}
        {isTextWhite
          ? contrastRatioWhite.toFixed(2)
          : contrastRatioBlack.toFixed(2)}
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 2fr",
          gridColumnGap: "16px"
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div>
            <input
              style={{
                width: "100%",
                textAlign: "center",
                borderWidth: "1px",
                borderStyle: "solid",
                borderColor: isRGBInputValid ? "black" : "red"
              }}
              value={rgbInput}
              onChange={handleRGBChange}
              onBlur={handleRGBBlur}
              onKeyPress={handleRGBKeyPress}
            />
          </div>
          RGB HEX
        </div>
        <div
          style={{
            textAlign: "center",
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)"
          }}
        >
          <div>
            <input
              style={{
                width: "100%",
                textAlign: "center",
                borderWidth: "1px",
                borderStyle: "solid",
                borderColor: isLInputValid ? "black" : "red"
              }}
              value={lInput}
              onChange={event => handleLCHChange(event, "l")}
              onBlur={handleLCHBlur}
              onKeyPress={handleLCHKeyPress}
            />
            Luminance
          </div>
          <div>
            <input
              style={{
                width: "100%",
                textAlign: "center",
                borderWidth: "1px",
                borderStyle: "solid",
                borderColor: isCInputValid ? "black" : "red"
              }}
              value={cInput}
              onChange={event => handleLCHChange(event, "c")}
              onBlur={handleLCHBlur}
              onKeyPress={handleLCHKeyPress}
            />
            Chroma
          </div>
          <div>
            <input
              style={{
                boxSizing: "border-box",
                width: "100%",
                maxWidth: "100%",
                textAlign: "center",
                borderWidth: "1px",
                borderStyle: "solid",
                borderColor: isHInputValid ? "black" : "red"
              }}
              value={hInput}
              onChange={event => handleLCHChange(event, "h")}
              onBlur={handleLCHBlur}
              onKeyPress={handleLCHKeyPress}
            />
            Hue
          </div>
        </div>
      </div>
    </div>
  );
}
