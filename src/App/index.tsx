import React, { useState, ChangeEvent, useMemo } from "react";
import {
  RGB,
  rgbToLCH,
  rgbToHex,
  wcagContrastRatio,
  RGB_BLACK,
  RGB_WHITE,
  hexToRGB
} from "../color";
import TunnelGraph from "./TunnelGraph";
import { Palette } from "./types";
import ColorEditor from "./ColorEditor";
import PaletteDisplay from "./PaletteDisplay";
import { PRESETS } from "./presets";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPalette } from "@fortawesome/free-solid-svg-icons";
import { faQuestionCircle } from "@fortawesome/free-regular-svg-icons";
import Navbar from "react-bootstrap/Navbar";
import Nav from "react-bootstrap/Nav";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";
import InputGroup from "react-bootstrap/InputGroup";

import "bootstrap/dist/css/bootstrap.min.css";

const DEFAULT_COLOR = { r: 0.5, g: 0.5, b: 0.5 };

export default function App() {
  const getSavedPalette = (): Palette => {
    const savedPreset = localStorage.getItem("preset");
    return savedPreset === null ? PRESETS[3] : JSON.parse(savedPreset);
  };

  const [isUsingLocal, setIsUsingLocal] = useState(true);
  const [{ hues, shades, colors }, setPalette] = useState(getSavedPalette());
  const [selectedColor, setSelectedColor] = useState({
    hue: Math.floor((hues.length - 1) / 2),
    shade: Math.floor((shades.length - 1) / 2)
  });

  const [newHueName, setNewHueName] = useState("");
  const [newShadeName, setNewShadeName] = useState("");

  const handlePresetChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const preset =
      event.target.selectedIndex === 0
        ? getSavedPalette()
        : PRESETS[event.target.selectedIndex - 1];

    setSelectedColor({
      hue: Math.floor((preset.hues.length - 1) / 2),
      shade: Math.floor((preset.shades.length - 1) / 2)
    });
    setPalette(preset);
    setIsUsingLocal(event.target.selectedIndex === 0);
  };

  const handleSavePalette = () => {
    localStorage.setItem("preset", JSON.stringify({ hues, shades, colors }));
  };

  const handleAddHue = () => {
    setPalette({
      hues: [...hues, newHueName],
      shades,
      colors: [...colors, Array(shades.length).fill(DEFAULT_COLOR)]
    });
  };

  const handleAddShade = () => {
    setPalette({
      hues,
      shades: [...shades, newShadeName],
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
    <>
      <Navbar
        style={{
          backgroundColor: rgbToHex(selectedColorRGB),
          transition: "background-color 0.5s, color 0.5s"
        }}
        variant={isHeaderTextWhite ? "dark" : "light"}
      >
        <Navbar.Brand href="/">
          <FontAwesomeIcon icon={faPalette} />
        </Navbar.Brand>

        <Nav className="mr-auto">
          <Nav.Link active href="/">
            cielab.io
          </Nav.Link>

          <Nav.Link
            className="ml-3"
            href="https://github.com/ucarion/cielab.io"
          >
            About this tool
          </Nav.Link>

          <Form className="ml-3" inline>
            <Form.Label
              className={isHeaderTextWhite ? "text-light" : "text-dark"}
            >
              Load preset
            </Form.Label>
            <Form.Control
              as="select"
              className="ml-3"
              onChange={handlePresetChange}
            >
              <option>Locally saved preset</option>
              <option>Google (Material UI)</option>
              <option>IBM (Carbon)</option>
              <option>US Digital Service (USWDS)</option>
              <option>Ant Financial (Ant Design)</option>
              <option>Segment (Evergreen)</option>
              <option>GitHub (Primer)</option>
              <option>Contentful (Forma 36)</option>
            </Form.Control>
          </Form>

          {isUsingLocal && (
            <Button
              className="ml-3"
              variant={isHeaderTextWhite ? "outline-light" : "outline-dark"}
              onClick={handleSavePalette}
            >
              Save
            </Button>
          )}
        </Nav>

        <Button
          variant={isHeaderTextWhite ? "outline-light" : "outline-dark"}
          onClick={handleExportJSON}
        >
          Export as JSON / JavaScript
        </Button>
      </Navbar>

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

            {isUsingLocal && (
              <>
                <InputGroup className="mt-3 mb-3">
                  <Form.Control
                    placeholder="New hue name"
                    value={newHueName}
                    onChange={(event: any) => setNewHueName(event.target.value)}
                  />
                  <InputGroup.Append>
                    <Button onClick={handleAddHue} variant="outline-secondary">
                      Add Hue
                    </Button>
                  </InputGroup.Append>
                </InputGroup>

                <InputGroup className="mb-3">
                  <Form.Control
                    placeholder="New shade name"
                    value={newShadeName}
                    onChange={(event: any) =>
                      setNewShadeName(event.target.value)
                    }
                  />
                  <InputGroup.Append>
                    <Button
                      onClick={handleAddShade}
                      variant="outline-secondary"
                    >
                      Add Shade
                    </Button>
                  </InputGroup.Append>
                </InputGroup>
              </>
            )}

            <ColorEditor
              rgb={selectedColorRGB}
              lch={selectedColorLCH}
              hue={hues[selectedColor.hue]}
              shade={shades[selectedColor.shade]}
              onUpdate={rgb => updateSelectedColor(rgb)}
            />
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
            <h2>{hues[selectedColor.hue]}</h2>
            <h2>{shades[selectedColor.shade]}</h2>
            <div>
              <h3 className="h4">
                Luminance{" "}
                <small className="text-muted">
                  vs. other {hues[selectedColor.hue]}s
                  <OverlayTrigger
                    placement="bottom"
                    overlay={
                      <Tooltip id="tooltip-hue-l">
                        Usually, you want shades to have roughly equal luminance
                        step sizes.
                        <br />
                        <br />
                        That way, you have uniform coverage of light and dark
                        colors.
                      </Tooltip>
                    }
                  >
                    <FontAwesomeIcon className="ml-2" icon={faQuestionCircle} />
                  </OverlayTrigger>
                </small>
              </h3>
              <TunnelGraph
                axis="l"
                displayPrecision={0}
                sequence={hueSequence}
                selectedIndex={selectedColor.shade}
              />
            </div>
            <div>
              <h3 className="h4">
                Luminance{" "}
                <small className="text-muted">
                  vs. other {shades[selectedColor.shade]}s
                  <OverlayTrigger
                    placement="bottom"
                    overlay={
                      <Tooltip id="tooltip-shade-l">
                        Usually, you want hues to have roughly the same
                        luminance.
                        <br />
                        <br />
                        That way, hues have consistent visual weight.
                      </Tooltip>
                    }
                  >
                    <FontAwesomeIcon className="ml-2" icon={faQuestionCircle} />
                  </OverlayTrigger>
                </small>
              </h3>
              <TunnelGraph
                axis="l"
                displayPrecision={0}
                sequence={shadeSequence}
                selectedIndex={selectedColor.hue}
              />
            </div>
            <div>
              <h3 className="h4">
                Chroma{" "}
                <small className="text-muted">
                  vs. other {hues[selectedColor.hue]}s
                  <OverlayTrigger
                    overlay={
                      <Tooltip id="tooltip-hue-c">
                        Usually, you want chroma to be greatest in the "middle"
                        shades, and should step smoothly between shades.
                        <br />
                        <br />
                        Oftentimes, you can sacrifice chroma to make luminance
                        and hue work.
                      </Tooltip>
                    }
                  >
                    <FontAwesomeIcon className="ml-2" icon={faQuestionCircle} />
                  </OverlayTrigger>
                </small>
              </h3>
              <TunnelGraph
                axis="c"
                displayPrecision={0}
                sequence={hueSequence}
                selectedIndex={selectedColor.shade}
              />
            </div>
            <div>
              <h3 className="h4">
                Chroma{" "}
                <small className="text-muted">
                  vs. other {shades[selectedColor.shade]}s
                  <OverlayTrigger
                    overlay={
                      <Tooltip id="tooltip-shade-c">
                        Usually, it's fine if this graph doesn't have any clear
                        pattern.
                        <br />
                        <br />
                        Oftentimes, you can sacrifice chroma to make luminance
                        and hue work.
                      </Tooltip>
                    }
                  >
                    <FontAwesomeIcon className="ml-2" icon={faQuestionCircle} />
                  </OverlayTrigger>
                </small>
              </h3>
              <TunnelGraph
                axis="c"
                displayPrecision={0}
                sequence={shadeSequence}
                selectedIndex={selectedColor.hue}
              />
            </div>
            <div>
              <h3 className="h4">
                Hue{" "}
                <small className="text-muted">
                  vs. other {hues[selectedColor.hue]}s
                  <OverlayTrigger
                    overlay={
                      <Tooltip id="tooltip-hue-h">
                        Usually, you want shades to have roughly the same hue.
                        <br />
                        <br />
                        That way, shades don't seem to "drift" into a different
                        color.
                      </Tooltip>
                    }
                  >
                    <FontAwesomeIcon className="ml-2" icon={faQuestionCircle} />
                  </OverlayTrigger>
                </small>
              </h3>
              <TunnelGraph
                axis="h"
                displayPrecision={1}
                sequence={hueSequence}
                selectedIndex={selectedColor.shade}
              />
            </div>
            <div>
              <h3 className="h4">
                Hue{" "}
                <small className="text-muted">
                  vs. other {shades[selectedColor.shade]}s
                  <OverlayTrigger
                    overlay={
                      <Tooltip id="tooltip-shade-h">
                        Usually, you want hues to have roughly equal hue step
                        sizes.
                        <br />
                        <br />
                        That way, you have uniform coverage of the color wheel.
                      </Tooltip>
                    }
                  >
                    <FontAwesomeIcon className="ml-2" icon={faQuestionCircle} />
                  </OverlayTrigger>
                </small>
              </h3>
              <TunnelGraph
                axis="h"
                displayPrecision={1}
                sequence={shadeSequence}
                selectedIndex={selectedColor.hue}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
