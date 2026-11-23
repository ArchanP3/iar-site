/* Should this device run live 3D (WebGL) effects?
   No for: reduced-motion users, data saver, weak devices, and browsers with no
   real graphics chip (software rendering like SwiftShader, which Google's
   PageSpeed test uses). Those get a still image instead, so phones stay fast. */
let cached: boolean | null = null;

export function canRun3D(): boolean {
  if (cached !== null) return cached;
  cached = check();
  return cached;
}

function check(): boolean {
  if (typeof window === "undefined") return false;
  try {
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return false;
    const nav = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
    if (nav.connection?.saveData) return false;
    if (nav.deviceMemory && nav.deviceMemory <= 2) return false;
    if (nav.hardwareConcurrency && nav.hardwareConcurrency <= 2) return false;

    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl2");
    if (!gl) return false;
    const info = gl.getExtension("WEBGL_debug_renderer_info");
    const renderer = String(info ? gl.getParameter(info.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER));
    gl.getExtension("WEBGL_lose_context")?.loseContext();
    return !/swiftshader|llvmpipe|softpipe|software|basic render/i.test(renderer);
  } catch {
    return false;
  }
}
