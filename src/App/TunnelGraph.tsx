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

// export default function TunnelGraph({ axis, sequence }: Props) {
//   const ijToCoords = (i: number, j: number): [number, number] => {
//     return [i / (sequence.length - 1), j / (SWEEP_STEPS - 1)];
//   };

//   const pathCommand = useMemo(() => {
//     const ranges = sequence.map(color => sweepRange(color, axis));
//     const sequenceRangeEdges = ranges.map((range, index) => ({
//       sequenceNumber: index,
//       edges: findRangeEdges(range)
//     }));

//     const coverPaths = findCoverPaths(sequenceRangeEdges);

//     return coverPaths
//       .map(
//         path =>
//           path
//             .map(
//               ([i, j], index) =>
//                 `${index === 0 ? "M" : "L"}${i / (sequence.length - 1)} ${j /
//                   (SWEEP_STEPS - 1)}`
//             )
//             .join(" ") + "Z"
//       )
//       .join(" ");
//   }, [axis, sequence]);

//   return (
//     <svg width="100%" height="100%" preserveAspectRatio="none">
//       <defs>
//         <pattern
//           id="background"
//           width="6"
//           height="6"
//           patternUnits="userSpaceOnUse"
//           preserveAspectRatio="none"
//         >
//           <path
//             d="M0 0 L1 0 L6 5 L6 6 L5 6 L0 1 Z M5 0 L6 0 L6 1 Z M0 5 L0 6 L1 6 Z"
//             fill="#aaa"
//           />
//         </pattern>
//       </defs>

//       <rect fill="url(#background)" width="100%" height="100%" />

//       <svg
//         width="100%"
//         height="100%"
//         viewBox="0 0 1 1"
//         preserveAspectRatio="none"
//       >
//         <path fillRule="evenodd" fill="green" d={pathCommand} />
//         {/* {sequence.map((color, index) => {
//           const [min, max] = {
//             l: [MIN_SRGB_LUMINANCE, MAX_SRGB_LUMINANCE],
//             c: [MIN_SRGB_CHROMA, MAX_SRGB_CHROMA],
//             h: [MIN_SRGB_HUE, MAX_SRGB_HUE]
//           }[axis];

//           const value = rgbToLCH(color)[axis];
//           const [x, y] = ijToCoords(
//             index,
//             value - (min / (max - min)) * SWEEP_STEPS
//           );
//           return <circle r="0.1" x={x} y={y} />;
//         })} */}
//       </svg>
//     </svg>
//   );
// }

// const SWEEP_STEPS = 100;

// function sweepRange(rgb: RGB, axis: "l" | "c" | "h"): boolean[] {
//   const lch = rgbToLCH(rgb);

//   const range = [];
//   for (let i = 0; i < SWEEP_STEPS; i++) {
//     const { [axis]: _, ...rest } = lch;
//     const [min, max] = {
//       l: [MIN_SRGB_LUMINANCE, MAX_SRGB_LUMINANCE],
//       c: [MIN_SRGB_CHROMA, MAX_SRGB_CHROMA],
//       h: [MIN_SRGB_HUE, MAX_SRGB_HUE]
//     }[axis];

//     const result = {
//       [axis]: min + (max * i) / (SWEEP_STEPS - 1),
//       ...rest
//     } as LCH;
//     range.push(rgbIsDisplayable(lchToRGB(result)));
//   }

//   return range;
// }

// interface RangeEdges {
//   risingEdges: number[];
//   fallingEdges: number[];
// }

// interface SequenceRangeEdges {
//   sequenceNumber: number;
//   edges: RangeEdges;
// }

// function findRangeEdges(vals: boolean[]): RangeEdges {
//   const risingEdges = [];

//   if (vals[0]) {
//     risingEdges.push(0);
//   }

//   for (let i = 1; i < vals.length; i++) {
//     if (!vals[i - 1] && vals[i]) {
//       risingEdges.push(i);
//     }
//   }

//   const fallingEdges = [];

//   for (let i = 0; i < vals.length - 1; i++) {
//     if (vals[i] && !vals[i + 1]) {
//       fallingEdges.push(i);
//     }
//   }

//   if (vals[vals.length - 1]) {
//     fallingEdges.push(vals.length - 1);
//   }

//   return { risingEdges, fallingEdges };
// }

// function findCoverPaths(sequence: SequenceRangeEdges[]): [number, number][][] {
//   let result: [number, number][][] = [];
//   let subSequences = [sequence];
//   let positive = true;

//   while (subSequences.length !== 0) {
//     for (const subSequence of subSequences) {
//       if (positive) {
//         result.push(positivePass(subSequence));
//       } else {
//         result.push(negativePass(subSequence));
//       }
//     }

//     subSequences = ([] as SequenceRangeEdges[][]).concat(
//       ...subSequences.map(subSequence => splitIntervals(subSequence))
//     );

//     positive = !positive;
//   }

//   return result;
// }

// function positivePass(sequence: SequenceRangeEdges[]): [number, number][] {
//   const result = [];

//   for (let i = 0; i < sequence.length; i++) {
//     result.push([
//       sequence[i].sequenceNumber,
//       sequence[i].edges.risingEdges.shift()
//     ] as [number, number]);
//   }

//   for (let i = sequence.length - 1; i >= 0; i--) {
//     result.push([
//       sequence[i].sequenceNumber,
//       sequence[i].edges.fallingEdges.pop()
//     ] as [number, number]);
//   }

//   return result;
// }

// function negativePass(sequence: SequenceRangeEdges[]) {
//   const result = [];

//   for (let i = 0; i < sequence.length; i++) {
//     result.push([
//       sequence[i].sequenceNumber,
//       sequence[i].edges.fallingEdges.pop()
//     ] as [number, number]);
//   }

//   for (let i = sequence.length - 1; i >= 0; i--) {
//     result.push([
//       sequence[i].sequenceNumber,
//       sequence[i].edges.risingEdges.shift()
//     ] as [number, number]);
//   }

//   return result;
// }

// function splitIntervals(
//   sequence: SequenceRangeEdges[]
// ): SequenceRangeEdges[][] {
//   const result: SequenceRangeEdges[][] = [[]];

//   for (const sequenceRange of sequence) {
//     if (sequenceRange.edges.risingEdges.length === 0) {
//       result.push([]);
//     } else {
//       result[result.length - 1].push(sequenceRange);
//     }
//   }

//   return result.filter(subSequence => subSequence.length !== 0);
// }
