const header = document.querySelector("[data-header]");
const statValues = document.querySelectorAll("[data-count]");
const revealItems = document.querySelectorAll(".reveal");
const playButton = document.querySelector(".play-button");
const scheduleButton = document.querySelector(".schedule-button");
const lockedMutedVideos = document.querySelectorAll("[data-lock-muted]");
const intro = document.querySelector("[data-intro]");
const introSkip = document.querySelector("[data-intro-skip]");
const toast = document.querySelector("[data-toast]");

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
let introTimeout;

function updateHeader() {
  header.classList.toggle("is-scrolled", window.scrollY > 12);
}

function formatStat(value, element) {
  const prefix = element.dataset.prefix || "";
  const suffix = element.dataset.suffix || "";

  if (element.dataset.format === "height") {
    const feet = Math.floor(value / 12);
    const inches = Math.round(value % 12);
    return `${feet}'${inches}"`;
  }

  return `${prefix}${Math.round(value)}${suffix}`;
}

function animateCounter(element) {
  if (element.dataset.animated === "true") return;

  element.dataset.animated = "true";
  const target = Number(element.dataset.count);
  const duration = reducedMotion ? 1 : 1200;
  const start = performance.now();

  function tick(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    element.textContent = formatStat(target * eased, element);

    if (progress < 1) {
      requestAnimationFrame(tick);
    } else {
      element.textContent = formatStat(target, element);
    }
  }

  requestAnimationFrame(tick);
}

function showToast(message) {
  if (!toast) return;

  toast.textContent = message;
  toast.classList.add("is-visible");
  window.clearTimeout(showToast.timeout);
  showToast.timeout = window.setTimeout(() => {
    toast.classList.remove("is-visible");
  }, 2600);
}

function finishIntro() {
  if (!intro || intro.classList.contains("is-done")) return;

  intro.classList.add("is-done");
  window.clearTimeout(introTimeout);
  window.setTimeout(() => {
    intro.remove();
  }, reducedMotion ? 40 : 1250);
}

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.18 }
);

const statObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        statObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.65 }
);

window.addEventListener("scroll", updateHeader, { passive: true });
updateHeader();

if (intro) {
  introTimeout = window.setTimeout(finishIntro, reducedMotion ? 700 : 7800);
}

if (introSkip) {
  introSkip.addEventListener("click", finishIntro);
}

revealItems.forEach((item) => revealObserver.observe(item));
statValues.forEach((item) => statObserver.observe(item));
lockedMutedVideos.forEach((video) => {
  video.muted = true;
  video.addEventListener("volumechange", () => {
    if (!video.muted) video.muted = true;
  });
});

if (playButton) {
  playButton.addEventListener("click", () => {
    showToast("2026 highlight reel coming soon.");
  });
}

if (scheduleButton) {
  scheduleButton.addEventListener("click", () => {
    showToast("JSlide journey updates coming soon.");
  });
}
