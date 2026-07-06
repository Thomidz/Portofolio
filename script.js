const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// ============================================
// FOOTER YEAR
// ============================================
document.getElementById("year").textContent = new Date().getFullYear();

// ============================================
// SCROLL PROGRESS BAR
// ============================================
const progressFill = document.getElementById("scroll-progress-fill");

function updateScrollProgress() {
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
  if (progressFill) progressFill.style.width = pct + "%";
}

// ============================================
// INDEX RAIL — highlight active section + click to scroll
// ============================================
const railItems = document.querySelectorAll(".rail-item");
const trackedSections = document.querySelectorAll("main .section, .hero");

railItems.forEach((item) => {
  item.addEventListener("click", () => {
    const target = document.getElementById(item.dataset.target);
    if (target) target.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth" });
  });
});

const railObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute("id");
        railItems.forEach((item) => {
          item.classList.toggle("is-active", item.dataset.target === id);
        });
      }
    });
  },
  { threshold: 0.5 }
);

trackedSections.forEach((section) => railObserver.observe(section));

// ============================================
// SCROLL REVEAL (with stagger for element groups)
// ============================================
const revealTargets = document.querySelectorAll(
  ".section-head, .about-grid, .timeline-item, .contact-layout, .education-card"
);
revealTargets.forEach((el) => el.classList.add("reveal"));

// Groups whose children reveal one at a time
const staggerGroups = document.querySelectorAll(
  ".about-stats, .skills-grid, .project-list, .fact-list, .skill-chips, .contact-primary, .contact-social, .org-list, .project-stack"
);
staggerGroups.forEach((group) => {
  Array.from(group.children).forEach((child, i) => {
    child.classList.add("reveal-child");
    child.style.transitionDelay = `${i * 90}ms`;
  });
});

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.15 }
);

revealTargets.forEach((el) => revealObserver.observe(el));

const staggerChildObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        staggerChildObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.2 }
);

document.querySelectorAll(".reveal-child").forEach((el) => staggerChildObserver.observe(el));

// ============================================
// COUNT-UP STAT NUMBERS
// ============================================
const statNumbers = document.querySelectorAll(".stat-number");

function animateCount(el) {
  const target = parseFloat(el.dataset.countTo) || 0;

  // Cek apakah target memiliki angka desimal
  const decimals = (target.toString().split(".")[1] || "").length;

  if (prefersReducedMotion) {
    el.textContent = target.toFixed(decimals);
    return;
  }

  const duration = 1200;
  const start = performance.now();
  el.classList.add("is-counting");

  function step(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);

    const value = eased * target;

    el.textContent =
      decimals > 0
        ? value.toFixed(decimals)
        : Math.round(value);

    if (progress < 1) {
      requestAnimationFrame(step);
    } else {
      el.textContent = target.toFixed(decimals);
    }
  }

  requestAnimationFrame(step);
}

const countObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        animateCount(entry.target);
        countObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.6 }
);

statNumbers.forEach((el) => countObserver.observe(el));

// ============================================
// HERO PARTICLE CANVAS
// ============================================
(function() {
  const canvas = document.getElementById("hero-particles");
  if (!canvas || prefersReducedMotion) return;
  const ctx = canvas.getContext("2d");
  let W, H, particles = [];
  const COUNT = 55;
  const ACCENT = "108,43,217";
  const ACCENT2 = "219,39,119";

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }

  function randBetween(a, b) { return a + Math.random() * (b - a); }

  function spawnParticle() {
    return {
      x: Math.random() * W,
      y: Math.random() * H,
      r: randBetween(0.8, 2.2),
      vx: randBetween(-0.18, 0.18),
      vy: randBetween(-0.22, -0.06),
      alpha: randBetween(0.2, 0.7),
      color: Math.random() > 0.5 ? ACCENT : ACCENT2,
    };
  }

  for (let i = 0; i < COUNT; i++) particles.push(spawnParticle());

  function drawLine(a, b) {
    const dx = a.x - b.x, dy = a.y - b.y;
    const dist = Math.sqrt(dx*dx + dy*dy);
    if (dist > 140) return;
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.strokeStyle = `rgba(${a.color},${(1 - dist/140) * 0.12})`;
    ctx.lineWidth = 0.8;
    ctx.stroke();
  }

  function tick() {
    ctx.clearRect(0, 0, W, H);
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      p.x += p.vx; p.y += p.vy;
      if (p.y < -5) { p.y = H + 5; p.x = Math.random() * W; }
      if (p.x < -5) p.x = W + 5;
      if (p.x > W + 5) p.x = -5;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${p.color},${p.alpha})`;
      ctx.fill();
      for (let j = i + 1; j < particles.length; j++) drawLine(p, particles[j]);
    }
    requestAnimationFrame(tick);
  }

  window.addEventListener("resize", resize, { passive: true });
  resize();
  tick();
})();

// ============================================
// HERO PORTRAIT PARALLAX — removed (no portrait in hero)
// ============================================

// ============================================
// PROJECT CARD TILT ON CURSOR
// ============================================
if (!prefersReducedMotion) {
  document.querySelectorAll(".project-card").forEach((card) => {
    card.addEventListener("mousemove", (e) => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      card.style.setProperty("--tiltX", `${y * -6}deg`);
      card.style.setProperty("--tiltY", `${x * 6}deg`);
    });
    card.addEventListener("mouseleave", () => {
      card.style.setProperty("--tiltX", "0deg");
      card.style.setProperty("--tiltY", "0deg");
    });
  });
}

// ============================================
// PROJECT MODAL
// ============================================
const projectData = [
  {
    tag: "Web App",
    year: "2026",
    title: "Coursework Task Manager",
    desc: "A web app for tracking coursework deadlines with reminders, priority labels, and a weekly calendar view.",
    detail: "Built a full-stack task management application to help students stay on top of academic deadlines. Features include recurring reminders, priority tagging, a weekly calendar view, and progress tracking across courses.",
    stack: ["React", "Node.js", "Express", "MongoDB"],
    demo: "#",
    source: "#"
  },
  {
    tag: "Algorithms",
    year: "2025",
    title: "Sorting Algorithm Visualizer",
    desc: "An interactive learning tool that shows bubble sort, merge sort, and quick sort step by step, visually.",
    detail: "Designed and built an in-browser visualizer that animates classic sorting algorithms frame-by-frame. Users can adjust array size and speed, pause, and step through each comparison manually.",
    stack: ["JavaScript", "Canvas API", "HTML", "CSS"],
    demo: "#",
    source: "#"
  },
  {
    tag: "Database",
    year: "2025",
    title: "Library Lending System",
    desc: "A relational database design and simple interface for tracking book loans and returns at a campus library.",
    detail: "Designed the entity-relationship model and normalized schema for a campus library system, then built a simple PHP interface for librarians to manage loans, returns, and overdue notices.",
    stack: ["MySQL", "PHP", "Bootstrap", "HTML"],
    demo: "#",
    source: "#"
  }
];

const modalOverlay = document.getElementById("modal-overlay");
const modalClose   = document.getElementById("modal-close");

function openModal(idx) {
  const p = projectData[idx];
  if (!p) return;
  document.getElementById("modal-tag").textContent    = p.tag;
  document.getElementById("modal-year").textContent   = p.year;
  document.getElementById("modal-title").textContent  = p.title;
  document.getElementById("modal-desc").textContent   = p.desc;
  document.getElementById("modal-detail").textContent = p.detail;
  const stackEl = document.getElementById("modal-stack");
  stackEl.innerHTML = p.stack.map(s => `<li>${s}</li>`).join("");
  document.getElementById("modal-demo").href   = p.demo;
  document.getElementById("modal-source").href = p.source;
  modalOverlay.classList.add("is-open");
  document.body.style.overflow = "hidden";
  modalClose.focus();
}

function closeModal() {
  modalOverlay.classList.remove("is-open");
  document.body.style.overflow = "";
}

document.querySelectorAll(".btn-open-modal").forEach((btn) => {
  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    const card = btn.closest(".project-card");
    openModal(parseInt(card.dataset.project, 10));
  });
});

document.querySelectorAll(".project-card").forEach((card) => {
  card.addEventListener("click", () => {
    openModal(parseInt(card.dataset.project, 10));
  });
});

if (modalClose) modalClose.addEventListener("click", closeModal);
if (modalOverlay) {
  modalOverlay.addEventListener("click", (e) => {
    if (e.target === modalOverlay) closeModal();
  });
}
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeModal();
});

// ============================================
// MAIN SCROLL LISTENERS
// ============================================
window.addEventListener("scroll", updateScrollProgress, { passive: true });
updateScrollProgress();