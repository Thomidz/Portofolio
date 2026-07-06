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
    tag: "Web Development",
    year: "2024",
    title: "GoalDrul",
    desc: "A web-based football competition management system designed to simplify tournament organization.",
    detail: "Administrators can manage teams, set up match schedules, track standings, record fixtures, and input match results through an intuitive dashboard. The system automates bracket generation and updates the leaderboard in real-time after each result is entered.",
    stack: ["HTML", "JavaScript", "MySQL", "PHP", "Bootstrap"],
    source: "https://github.com/Thomidz/goaldruldc.git"
  },
  {
    tag: "Machine Learning",
    year: "2026",
    title: "SmartFit",
    desc: "Food recommendation app built as the final capstone project for DBS Coding Camp.",
    detail: "Uses a content-based filtering recommendation algorithm combined with data preprocessing techniques (normalization, feature encoding) to deliver personalized food suggestions based on user preferences, dietary goals, and caloric targets. The dataset was cleaned and preprocessed using Pandas before being fed into the Scikit-Learn pipeline.",
    stack: ["Python", "Pandas", "Scikit-Learn", "Jupyter Notebook"],
    demo: "https://smartfit-app.vercel.app/",
    source: "https://github.com/susenayw/SmartFit.git"
  },
  {
    tag: "Mobile Development",
    year: "2025",
    title: "JagaJiwa",
    desc: "Flutter mobile app supporting public awareness campaigns against online gambling.",
    detail: "JagaJiwa provides educational content about the dangers of online gambling, an anonymous reporting feature for users to flag suspicious platforms, and curated resources such as hotlines and counseling links. The app integrates Firebase for real-time data sync and user authentication, and was designed with a clean, accessible UI to reach a broad demographic.",
    stack: ["Flutter", "Dart", "Firebase", "Figma"],
    source: "https://github.com/garmandsk/jagajiwa.git"
  },
  {
    tag: "Game Development",
    year: "2025",
    title: "UNBIRD",
    desc: "2D arcade game inspired by Flappy Bird — control a plane, dodge obstacles, and shoot enemies for the highest score.",
    detail: "Developed independently using Unity 6.2. The game features procedurally generated obstacle patterns with increasing difficulty, an enemy shooting mechanic where enemies fire projectiles back at the player, pixel art assets created from scratch, a parallax scrolling background, and a persistent high-score system. Audio feedback and screen shake effects add game-feel polish.",
    stack: ["Unity 6.2", "C#", "TextMesh Pro", "Pixel Art"],
    source: "https://github.com/Thomidz/DERGEN.git"
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

  const demoBtn   = document.getElementById("modal-demo");
  const sourceBtn = document.getElementById("modal-source");
  const playBtn   = document.getElementById("modal-play");

  // Live demo — hanya tampil jika ada URL
  if (p.demo) {
    demoBtn.href = p.demo;
    demoBtn.style.display = "inline-flex";
  } else {
    demoBtn.style.display = "none";
  }

  // Source code — selalu tampil jika ada
  if (p.source) {
    sourceBtn.href = p.source;
    sourceBtn.style.display = "inline-flex";
  } else {
    sourceBtn.style.display = "none";
  }

  // Play game — hanya tampil jika ada playUrl
  if (p.playUrl && playBtn) {
    playBtn.href = p.playUrl;
    playBtn.style.display = "inline-flex";
  } else if (playBtn) {
    playBtn.style.display = "none";
  }

  // Style the modal box for game projects
  const box = document.querySelector(".modal-box");
  if (p.tag === "Game Development") {
    box.classList.add("modal-box--game");
  } else {
    box.classList.remove("modal-box--game");
  }

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