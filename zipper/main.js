(() => {
  "use strict";

  const cfg = Object.assign(
    { notarized: false, requirements: "macOS 14 Sonoma or later" },
    window.ZIPPER_SITE || {}
  );
  const root = document.documentElement;
  root.dataset.notarized = String(Boolean(cfg.notarized));

  // ---------- Download buttons: direct link to the DMG in config.js ----------

  const dl = cfg.download || {};
  if (dl.url) {
    document.querySelectorAll("[data-download]").forEach((a) => (a.href = dl.url));
    const name = dl.url.split("/").pop();
    document.querySelectorAll("[data-dmg-name]").forEach((el) => (el.textContent = name));
  }
  const meta = [dl.version && `Version ${dl.version}`, dl.size, cfg.requirements].filter(Boolean).join(" · ");
  document.querySelectorAll("[data-release-meta]").forEach((el) => (el.textContent = meta));
  document.querySelectorAll("[data-checksum]").forEach((a) => {
    if (dl.checksumUrl) a.href = dl.checksumUrl;
    a.hidden = !dl.checksumUrl;
  });

  // ---------- App window illustrations: scale a fixed-size design to fit ----------

  const frames = document.querySelectorAll("[data-frame]");
  const fit = (frame) => {
    const w = Number(frame.dataset.w) || 960;
    const h = Number(frame.dataset.h) || 600;
    const scale = Math.min(1, frame.clientWidth / w);
    frame.style.setProperty("--s", String(scale));
    frame.style.height = `${h * scale}px`;
  };
  if ("ResizeObserver" in window) {
    const ro = new ResizeObserver((entries) => entries.forEach((e) => fit(e.target)));
    frames.forEach((f) => ro.observe(f));
  } else {
    const all = () => frames.forEach(fit);
    window.addEventListener("resize", all);
    all();
  }

  // ---------- Screenshot tabs ----------

  const tabs = Array.from(document.querySelectorAll("[role=tab]"));
  const select = (tab, focus) => {
    tabs.forEach((t) => {
      const on = t === tab;
      t.setAttribute("aria-selected", String(on));
      t.tabIndex = on ? 0 : -1;
      const panel = document.getElementById(t.getAttribute("aria-controls"));
      if (panel) panel.hidden = !on;
    });
    if (focus) tab.focus();
    const panel = document.getElementById(tab.getAttribute("aria-controls"));
    panel && panel.querySelectorAll("[data-frame]").forEach(fit);
  };
  tabs.forEach((tab, i) => {
    tab.addEventListener("click", () => select(tab, false));
    tab.addEventListener("keydown", (e) => {
      const d = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
      if (!d) return;
      e.preventDefault();
      select(tabs[(i + d + tabs.length) % tabs.length], true);
    });
  });

  // ---------- Gentle reveal on scroll ----------

  const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const revealables = document.querySelectorAll("[data-reveal]");
  if (!reduce && "IntersectionObserver" in window) {
    root.classList.add("js-reveal");
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("is-in");
            io.unobserve(e.target);
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px" }
    );
    revealables.forEach((el) => io.observe(el));
  }

  // ---------- Footer year ----------

  document.querySelectorAll("[data-year]").forEach((el) => (el.textContent = String(new Date().getFullYear())));
})();
