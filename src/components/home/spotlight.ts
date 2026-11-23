/* Pointer handler for a card grid: tells the hovered .aq-card where the pointer is,
   so its blue edge light follows the mouse. Attach to the grid (one listener for all cards). */
export function moveSpotlight(e: React.PointerEvent<HTMLElement>) {
  if (e.pointerType !== "mouse") return;
  const card = (e.target as HTMLElement).closest<HTMLElement>(".aq-card");
  if (!card) return;
  const r = card.getBoundingClientRect();
  card.style.setProperty("--mx", `${e.clientX - r.left}px`);
  card.style.setProperty("--my", `${e.clientY - r.top}px`);
}
