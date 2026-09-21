import { gsap } from "gsap";

/** Subtle cursor-follow effect: the element eases toward the pointer, then springs back. */
export function attachMagnetic(el, strength = 16) {
  const moveX = gsap.quickTo(el, "x", { duration: 0.5, ease: "power3.out" });
  const moveY = gsap.quickTo(el, "y", { duration: 0.5, ease: "power3.out" });

  el.addEventListener("mousemove", (e) => {
    const rect = el.getBoundingClientRect();
    const relX = e.clientX - (rect.left + rect.width / 2);
    const relY = e.clientY - (rect.top + rect.height / 2);
    moveX((relX / rect.width) * strength);
    moveY((relY / rect.height) * strength);
  });

  el.addEventListener("mouseleave", () => {
    moveX(0);
    moveY(0);
  });
}

/** Gentle 3D tilt that follows the pointer across a wrapper, applied to a target element. */
export function attachTilt(wrapper, target, maxTilt = 7) {
  const rotateX = gsap.quickTo(target, "rotationX", { duration: 0.6, ease: "power3.out" });
  const rotateY = gsap.quickTo(target, "rotationY", { duration: 0.6, ease: "power3.out" });

  wrapper.addEventListener("mousemove", (e) => {
    const rect = wrapper.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    rotateY(px * maxTilt * 2);
    rotateX(-py * maxTilt * 2);
  });

  wrapper.addEventListener("mouseleave", () => {
    rotateX(0);
    rotateY(0);
  });
}

/** A slow, barely-there idle float so the resting arepa feels alive rather than static. */
export function startIdleFloat(el) {
  return gsap.to(el, {
    y: "+=8",
    duration: 2.6,
    ease: "sine.inOut",
    yoyo: true,
    repeat: -1,
  });
}
