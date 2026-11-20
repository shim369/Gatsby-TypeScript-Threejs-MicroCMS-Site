import type { CSSProperties } from "react";

/** Inline `--d` custom property used for staggered reveal / intro delays. */
export const delay = (seconds: number) => ({ "--d": `${seconds}s` }) as CSSProperties;
