/** Wraps each word of an element's text in a masked span so it can be revealed with a stagger. */
export function splitWords(el) {
  const words = el.textContent.trim().split(/\s+/);
  el.textContent = "";
  el.setAttribute("aria-label", words.join(" "));
  const inners = [];
  words.forEach((word, i) => {
    const mask = document.createElement("span");
    mask.className = "split-word-mask";
    mask.setAttribute("aria-hidden", "true");
    const inner = document.createElement("span");
    inner.className = "split-word-inner";
    inner.textContent = word + (i < words.length - 1 ? " " : "");
    mask.appendChild(inner);
    el.appendChild(mask);
    inners.push(inner);
  });
  return inners;
}
