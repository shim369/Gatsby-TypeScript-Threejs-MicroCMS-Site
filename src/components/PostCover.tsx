import { useId } from "react";

type Eyecatch = { url?: string | null; width?: number | null; height?: number | null } | null | undefined;

type Props = { eyecatch: Eyecatch; seed: number; width?: number; eager?: boolean };

const variants = [
  { angle: -18, cx: 70, cy: 118, r: 64 },
  { angle: 14, cx: 30, cy: 108, r: 54 },
  { angle: -32, cx: 62, cy: 112, r: 70 },
];

/** microCMS images are served by imgix, so resize and convert on the fly. */
const imgix = (url: string, w: number) => {
  const u = new URL(url);
  u.searchParams.set("w", String(w));
  u.searchParams.set("fm", "webp");
  return u.toString();
};

/** The post's eyecatch, or a generated planet when there is none. */
export default function PostCover({ eyecatch, seed, width = 960, eager = false }: Props) {
  if (eyecatch?.url) {
    return (
      <img
        src={imgix(eyecatch.url, width)}
        srcSet={`${imgix(eyecatch.url, width / 2)} ${width / 2}w, ${imgix(eyecatch.url, width)} ${width}w`}
        sizes={`(width <= 900px) 100vw, ${width / 2}px`}
        width={eyecatch.width ?? undefined}
        height={eyecatch.height ?? undefined}
        alt=""
        loading={eager ? "eager" : "lazy"}
        fetchPriority={eager ? "high" : undefined}
      />
    );
  }
  return <PlanetArt seed={seed} />;
}

function PlanetArt({ seed }: { seed: number }) {
  const id = useId();
  const { angle, cx, cy, r } = variants[seed % variants.length];
  const ringY = cy - r * 0.35;
  const dots = Array.from({ length: 160 }, (_, i) => ({
    x: ((i * 97.3 + seed * 41) % 160).toFixed(1),
    y: ((i * 53.7 + seed * 17) % 100).toFixed(1),
    r: i % 7 === 0 ? 0.5 : 0.25,
    o: (0.2 + (i % 5) * 0.12).toFixed(2),
  }));

  return (
    <svg viewBox="0 0 160 100" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <radialGradient id={`${id}p`} cx="35%" cy="30%" r="80%">
          <stop offset="0" stopColor="#b48cff" />
          <stop offset=".55" stopColor="#663399" />
          <stop offset="1" stopColor="#1b0f33" />
        </radialGradient>
        <radialGradient id={`${id}g`} cx="50%" cy="50%" r="50%">
          <stop offset=".7" stopColor="#a77bf3" stopOpacity=".45" />
          <stop offset="1" stopColor="#a77bf3" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="160" height="100" fill="#0e0919" />
      {dots.map((d, i) => (
        <circle key={i} cx={d.x} cy={d.y} r={d.r} fill="#e8defe" opacity={d.o} />
      ))}
      <circle cx={cx} cy={cy} r={r * 1.12} fill={`url(#${id}g)`} />
      <circle cx={cx} cy={cy} r={r} fill={`url(#${id}p)`} />
      <path
        d={`M${cx - r} ${cy} a${r} ${r} 0 0 1 ${r * 0.9} ${-r * 0.98}`}
        fill="none"
        stroke="#ffb46b"
        strokeWidth=".8"
        opacity=".9"
      />
      <g transform={`rotate(${angle} ${cx} ${ringY})`}>
        <ellipse cx={cx} cy={ringY} rx={r * 1.7} ry={r * 0.32} fill="none" stroke="#e8defe" strokeWidth=".35" opacity=".55" />
        <circle cx={cx + r * 1.45} cy={ringY - r * 0.32 * 0.2} r="1.6" fill="#ffb46b" />
      </g>
    </svg>
  );
}
