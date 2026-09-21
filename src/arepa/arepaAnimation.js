import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  fillings,
  ingredientAnim,
  ingredientElementIds,
  allIngredientKeys,
} from "./fillings.js";
import { splitWords } from "../utils/splitText.js";
import { attachMagnetic, attachTilt, startIdleFloat } from "./microinteractions.js";

gsap.registerPlugin(ScrollTrigger);

const LID_OPEN_PEAK = { y: -150, rotate: -5 };
const LID_RESTING = { y: -86, rotate: -2 };
const LID_CLOSED = { y: 0, rotate: 0 };
const FILL_THRESHOLD = 0.55;

function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

/** Maps continuous scroll progress (0-1) to the lid's transform, in three organic phases. */
function lidStateForProgress(progress) {
  if (progress <= 0.25) {
    return { ...LID_CLOSED };
  }
  if (progress <= 0.6) {
    const t = easeOutCubic((progress - 0.25) / 0.35);
    return {
      y: lerp(LID_CLOSED.y, LID_OPEN_PEAK.y, t),
      rotate: lerp(LID_CLOSED.rotate, LID_OPEN_PEAK.rotate, t),
    };
  }
  const t = easeOutCubic((progress - 0.6) / 0.4);
  return {
    y: lerp(LID_OPEN_PEAK.y, LID_RESTING.y, t),
    rotate: lerp(LID_OPEN_PEAK.rotate, LID_RESTING.rotate, t),
  };
}

function entranceVarsFor(anim) {
  switch (anim) {
    case "slide-left":
      return { x: -74, opacity: 0, rotate: -8 };
    case "slide-right":
      return { x: 74, opacity: 0, rotate: 8 };
    case "fall":
      return { y: -64, opacity: 0 };
    case "rise":
      return { y: 64, opacity: 0 };
    case "bounce":
      return { y: -46, opacity: 0, scale: 0.65 };
    case "pop":
      return { scale: 0, opacity: 0 };
    case "pop-slide":
      return { x: 44, scale: 0.7, opacity: 0 };
    case "pop-soft":
      return { scale: 0.5, opacity: 0, y: 12 };
    default:
      return { opacity: 0 };
  }
}

function easeFor(anim) {
  switch (anim) {
    case "bounce":
      return "back.out(1.9)";
    case "pop":
      return "back.out(2.3)";
    case "pop-slide":
      return "back.out(1.6)";
    case "pop-soft":
      return "back.out(1.4)";
    case "fall":
      return "power2.out";
    case "rise":
      return "power3.out";
    default:
      return "power2.out";
  }
}

function durationFor(anim) {
  switch (anim) {
    case "fall":
      return 0.85;
    case "rise":
      return 0.7;
    case "bounce":
      return 0.75;
    default:
      return 0.6;
  }
}

export function initArepaAnimation() {
  const stage = document.getElementById("arepaStage");
  const visual = document.getElementById("arepaVisual");
  const top = document.getElementById("arepaTop");
  const selector = document.getElementById("fillingSelector");
  const nameText = document.querySelector(".filling-name__text");
  const nameDesc = document.querySelector(".filling-name__desc");
  const nameBlock = document.getElementById("fillingName");

  if (!stage || !visual || !top || !selector) return;

  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  const els = {};
  allIngredientKeys.forEach((key) => {
    els[key] = document.getElementById(ingredientElementIds[key]);
  });

  let currentFilling = "reinaPepiada";
  let isFilled = false;
  let switching = false;

  function hideIngredientInstant(key) {
    const el = els[key];
    if (!el) return;
    gsap.set(el, { opacity: 0, clearProps: "transform" });
  }

  allIngredientKeys.forEach(hideIngredientInstant);
  gsap.set(nameBlock, { opacity: 0, y: 10 });

  function playIngredientsIn(fillingKey) {
    const keys = fillings[fillingKey].ingredients;
    const tl = gsap.timeline();
    keys.forEach((key, i) => {
      const el = els[key];
      if (!el) return;
      const anim = ingredientAnim[key];
      const fromVars = entranceVarsFor(anim);
      gsap.set(el, fromVars);
      tl.to(
        el,
        {
          x: 0,
          y: 0,
          rotate: 0,
          scale: 1,
          opacity: 1,
          duration: reduceMotion ? 0.2 : durationFor(anim),
          ease: reduceMotion ? "power1.out" : easeFor(anim),
        },
        reduceMotion ? 0 : i * 0.13
      );
    });
    return tl;
  }

  function playIngredientsOut(fillingKey) {
    const keys = fillings[fillingKey].ingredients;
    const tl = gsap.timeline();
    keys.forEach((key, i) => {
      const el = els[key];
      if (!el) return;
      tl.to(
        el,
        {
          opacity: 0,
          y: -12,
          scale: 0.92,
          duration: reduceMotion ? 0.15 : 0.32,
          ease: "power1.in",
        },
        reduceMotion ? 0 : i * 0.05
      );
    });
    return tl;
  }

  function showFillingLabel(fillingKey) {
    const data = fillings[fillingKey];
    const tl = gsap.timeline();
    tl.to(nameBlock, {
      opacity: 0,
      y: 6,
      duration: reduceMotion ? 0.1 : 0.2,
      ease: "power1.in",
      onComplete: () => {
        nameText.textContent = data.label;
        nameDesc.textContent = data.desc;
      },
    }).to(nameBlock, {
      opacity: 1,
      y: 0,
      duration: reduceMotion ? 0.15 : 0.45,
      ease: "power2.out",
    });
    return tl;
  }

  // --- Section title: staggered word reveal, agency-style ---
  const sectionTitle = document.querySelector(".arepa-section__title");
  if (sectionTitle && !reduceMotion) {
    const titleWords = splitWords(sectionTitle);
    gsap.set(titleWords, { yPercent: 115 });
    ScrollTrigger.create({
      trigger: sectionTitle,
      start: "top 88%",
      once: true,
      onEnter: () => {
        gsap.to(titleWords, {
          yPercent: 0,
          duration: 0.9,
          ease: "expo.out",
          stagger: 0.04,
        });
      },
    });
  }

  // --- Step 1: the arepa gently enters the scene ---
  gsap.set(visual, { opacity: 0, y: 46, scale: 0.94 });
  ScrollTrigger.create({
    trigger: visual,
    start: "top 85%",
    once: true,
    onEnter: () => {
      gsap.to(visual, {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: reduceMotion ? 0.3 : 1.2,
        ease: "expo.out",
        onComplete: () => {
          if (!reduceMotion) startIdleFloat(visual);
        },
      });
    },
  });

  if (!reduceMotion) {
    attachTilt(stage, visual, 6);
  }

  // --- Steps 2-6: scroll-driven opening + filling narrative ---
  if (!reduceMotion) {
    ScrollTrigger.create({
      trigger: stage,
      start: "top top",
      end: "+=130%",
      pin: true,
      scrub: 0.65,
      onUpdate: (self) => {
        if (switching) return;
        const state = lidStateForProgress(self.progress);
        gsap.set(top, { y: state.y, rotate: state.rotate });

        const shouldFill = self.progress >= FILL_THRESHOLD;
        if (shouldFill && !isFilled) {
          isFilled = true;
          playIngredientsIn(currentFilling);
          showFillingLabel(currentFilling);
        } else if (!shouldFill && isFilled) {
          isFilled = false;
          playIngredientsOut(currentFilling);
          gsap.to(nameBlock, { opacity: 0, y: 6, duration: 0.25 });
        }
      },
    });
  } else {
    // Reduced motion: skip the scroll choreography, present the final state directly.
    gsap.set(top, LID_RESTING);
    isFilled = true;
    playIngredientsIn(currentFilling);
    gsap.set(nameBlock, { opacity: 1, y: 0 });
    nameText.textContent = fillings[currentFilling].label;
    nameDesc.textContent = fillings[currentFilling].desc;
  }

  // --- Filling selector interaction ---
  const buttons = Array.from(selector.querySelectorAll(".filling-btn"));

  function setActiveButton(fillingKey) {
    buttons.forEach((btn) => {
      const active = btn.dataset.filling === fillingKey;
      btn.classList.toggle("is-active", active);
      btn.setAttribute("aria-selected", String(active));
    });
  }

  let pendingFilling = null;

  function performSwitch(nextKey) {
    switching = true;

    const tl = gsap.timeline({
      onComplete: () => {
        switching = false;
        if (pendingFilling && pendingFilling !== currentFilling) {
          const next = pendingFilling;
          pendingFilling = null;
          performSwitch(next);
        } else {
          pendingFilling = null;
        }
      },
    });

    if (isFilled) {
      tl.add(playIngredientsOut(currentFilling));
    }

    if (!reduceMotion) {
      tl.to(
        top,
        { y: LID_OPEN_PEAK.y, rotate: LID_OPEN_PEAK.rotate, duration: 0.55, ease: "power2.out" },
        isFilled ? "-=0.1" : 0
      );
    }

    tl.call(() => {
      currentFilling = nextKey;
    });

    tl.add(playIngredientsIn(nextKey), reduceMotion ? 0 : "+=0.05");

    if (!reduceMotion) {
      tl.to(
        top,
        { y: LID_RESTING.y, rotate: LID_RESTING.rotate, duration: 0.6, ease: "power2.inOut" },
        "-=0.35"
      );
    }

    tl.add(showFillingLabel(nextKey), reduceMotion ? 0 : "-=0.2");

    isFilled = true;
  }

  // Public entry point: gives instant button feedback and queues the visual
  // transition (last click wins) instead of dropping it if one is in flight.
  function switchFilling(nextKey) {
    if (nextKey === currentFilling && isFilled && !switching) return;
    setActiveButton(nextKey);
    if (switching) {
      pendingFilling = nextKey;
      return;
    }
    performSwitch(nextKey);
  }

  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      switchFilling(btn.dataset.filling);
    });
    if (!reduceMotion) attachMagnetic(btn, 10);
  });
}
