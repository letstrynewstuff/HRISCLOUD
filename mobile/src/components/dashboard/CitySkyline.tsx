// src/components/dashboard/CitySkyline.tsx
// Light decorative skyline + sun illustration for the Clock In hero card.
// Pure SVG so it's resolution-independent and themeable via colors.ts.

import Svg, { Rect, Circle, Path } from "react-native-svg";
import C from "../../styles/colors";

type CitySkylineProps = {
  width?: number;
  height?: number;
};

export default function CitySkyline({
  width = 220,
  height = 100,
}: CitySkylineProps) {
  return (
    <Svg width={width} height={height} viewBox="0 0 220 100" fill="none">
      {/* sun */}
      <Circle cx={184} cy={22} r={9} fill="#FBBF24" opacity={0.9} />

      {/* clouds */}
      <Path
        d="M30 36c-6 0-10 4-10 9s4 9 10 9h26c5 0 9-4 9-8s-4-8-8-8c-1-7-7-12-14-12-6 0-11 4-13 10z"
        fill={C.surfaceAlt}
      />
      <Path
        d="M150 28c-4 0-7 3-7 6s3 6 7 6h18c4 0 6-3 6-6s-3-6-6-6c-1-5-5-8-10-8s-7 3-8 8z"
        fill={C.surfaceAlt}
      />

      {/* back buildings (muted) */}
      <Rect x={20} y={52} width={16} height={40} rx={2} fill="#E5E2F5" />
      <Rect x={160} y={48} width={18} height={44} rx={2} fill="#E5E2F5" />
      <Rect x={182} y={58} width={14} height={34} rx={2} fill="#E5E2F5" />

      {/* front buildings (brand violet, varying heights) */}
      <Rect
        x={44}
        y={40}
        width={20}
        height={52}
        rx={2}
        fill={C.violet}
        opacity={0.85}
      />
      <Rect
        x={68}
        y={56}
        width={16}
        height={36}
        rx={2}
        fill={C.primary}
        opacity={0.9}
      />
      <Rect
        x={88}
        y={30}
        width={22}
        height={62}
        rx={2}
        fill={C.navy}
        opacity={0.9}
      />
      <Rect
        x={114}
        y={50}
        width={18}
        height={42}
        rx={2}
        fill={C.violet}
        opacity={0.85}
      />
      <Rect
        x={136}
        y={62}
        width={16}
        height={30}
        rx={2}
        fill={C.primary}
        opacity={0.8}
      />

      {/* center tower spire */}
      <Rect
        x={97}
        y={20}
        width={4}
        height={12}
        rx={1}
        fill={C.navy}
        opacity={0.9}
      />

      {/* windows on the tallest tower */}
      {[38, 46, 54, 62, 70, 78].map((y, i) => (
        <Rect
          key={i}
          x={94}
          y={y}
          width={4}
          height={5}
          rx={1}
          fill="#FBBF24"
          opacity={0.55}
        />
      ))}

      {/* ground line */}
      <Rect x={14} y={91} width={188} height={2} rx={1} fill={C.border} />
    </Svg>
  );
}
