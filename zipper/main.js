(() => {
  "use strict";

  const cfg = Object.assign(
    { repo: "erfanj/Zipper", notarized: false, requirements: "macOS 14 Sonoma or later" },
    window.ZIPPER_SITE || {}
  );
  const root = document.documentElement;
  root.dataset.notarized = String(Boolean(cfg.notarized));

  // ---------- Download button: link to the latest release's DMG ----------

  const releasesPage = `https://github.com/${cfg.repo}/releases/latest`;
  const links = document.querySelectorAll("[data-download]");
  const metas = document.querySelectorAll("[data-release-meta]");
  const dmgNames = document.querySelectorAll("[data-dmg-name]");
  const checksums = document.querySelectorAll("[data-checksum]");

  links.forEach((a) => (a.href = releasesPage));
  metas.forEach((el) => (el.textContent = `${cfg.requirements} · Apple silicon & Intel`));

  const formatSize = (bytes) => {
    if (!bytes) return "";
    const mb = bytes / 1048576;
    return mb >= 10 ? `${Math.round(mb)} MB` : `${mb.toFixed(1)} MB`;
  };

  const apply = (release) => {
    const assets = release.assets || [];
    const dmg = assets.find((a) => /\.dmg$/i.test(a.name));
    if (!dmg) return;
    const version = String(release.tag_name || "").replace(/^v/i, "");
    links.forEach((a) => {
      a.href = dmg.browser_download_url;
      a.setAttribute("download", "");
    });
    const parts = [version && `Version ${version}`, formatSize(dmg.size), cfg.requirements].filter(Boolean);
    metas.forEach((el) => (el.textContent = parts.join(" · ")));
    dmgNames.forEach((el) => (el.textContent = dmg.name));
    const sum = assets.find((a) => /\.dmg\.sha256$/i.test(a.name));
    if (sum) {
      checksums.forEach((a) => {
        a.href = sum.browser_download_url;
        a.hidden = false;
      });
    }
  };

  const CACHE_KEY = `zipper-release:${cfg.repo}`;
  let cached = null;
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Date.now() - parsed.at < 10 * 60 * 1000) cached = parsed.release;
    }
  } catch (_) {
    /* storage unavailable: fetch instead */
  }

  if (cached) {
    apply(cached);
  } else if (window.fetch) {
    fetch(`https://api.github.com/repos/${cfg.repo}/releases/latest`, {
      headers: { Accept: "application/vnd.github+json" },
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((release) => {
        if (!release) return;
        const slim = {
          tag_name: release.tag_name,
          assets: (release.assets || []).map(({ name, size, browser_download_url }) => ({ name, size, browser_download_url })),
        };
        apply(slim);
        try {
          sessionStorage.setItem(CACHE_KEY, JSON.stringify({ at: Date.now(), release: slim }));
        } catch (_) {
          /* ignore */
        }
      })
      .catch(() => {
        /* offline or rate-limited: the releases-page link stays */
      });
  }

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
