import { useEffect, useRef } from "react";
import { sisters } from "../data/site";
import { ArrowNE } from "./Icons";

/** Fixed WebGL planet behind the page, with the sister sites as orbiting labels. */
export default function Space() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const labelRefs = useRef<(HTMLAnchorElement | null)[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let disposed = false;
    let cleanup = () => {};

    // The scene (and Three.js) is a separate chunk, loaded after first paint.
    import("../three/planet").then(({ createPlanet }) => {
      if (!disposed) cleanup = createPlanet(canvas, labelRefs.current);
    });

    return () => {
      disposed = true;
      cleanup();
    };
  }, []);

  return (
    <>
      <canvas ref={canvasRef} className="space" aria-hidden="true" />
      <div className="sat-labels">
        {sisters.map((s, i) => (
          <a
            key={s.url}
            ref={(el) => {
              labelRefs.current[i] = el;
            }}
            className="sat"
            href={s.url}
            target="_blank"
            rel="noopener noreferrer"
            tabIndex={-1}
          >
            {s.name}
            <ArrowNE />
            <span className="sr"> (sister site, opens in a new tab)</span>
          </a>
        ))}
      </div>
    </>
  );
}
