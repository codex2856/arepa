import "./style.css";
import { gsap } from "gsap";
import { splitWords } from "./utils/splitText.js";
import { initArepaAnimation } from "./arepa/arepaAnimation.js";

function revealHero() {
  const title = document.querySelector(".hero__title");
  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  if (!title) return;

  if (reduceMotion) return;

  const words = splitWords(title);
  gsap.set(words, { yPercent: 115 });
  gsap.to(words, {
    yPercent: 0,
    duration: 1,
    ease: "expo.out",
    stagger: 0.045,
    delay: 0.15,
  });

  gsap.from(
    [".hero__eyebrow", ".hero__text"],
    { opacity: 0, y: 16, duration: 0.8, ease: "power2.out", stagger: 0.1, delay: 0.5 }
  );
}

revealHero();
initArepaAnimation();
