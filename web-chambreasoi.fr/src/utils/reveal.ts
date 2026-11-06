export function initRevealOnIntersect({
  selector = "[data-reveal]",
  threshold = 0.1,
}: {
  selector?: string;
  threshold?: number;
} = {}): void {
  const revealEls = document.querySelectorAll<HTMLElement>(selector);

  if (!revealEls.length) {
    return;
  }

  revealEls.forEach((el) => {
    el.style.setProperty("--reveal-delay", `${el.dataset.revealDelay ?? "0"}ms`);
  });

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        requestAnimationFrame(() => {
          (entry.target as HTMLElement).classList.add("is-visible");
        });
        revealObserver.unobserve(entry.target);
      });
    },
    { threshold }
  );

  revealEls.forEach((el) => revealObserver.observe(el));
}
