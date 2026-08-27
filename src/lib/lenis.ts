import type Lenis from "lenis";

// SmoothScroll owns the Lenis instance. Anything that needs to freeze the page
// behind an overlay registers here rather than reaching into that component.
// Under prefers-reduced-motion no instance is ever created, so every call is a
// no-op and callers must also set overflow on the body.

let instance: Lenis | null = null;

export function registerLenis(l: Lenis | null) {
  instance = l;
}

export function stopLenis() {
  instance?.stop();
}

export function startLenis() {
  instance?.start();
}
