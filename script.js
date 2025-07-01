// const PASSWORD_HASH = "ca4053a30521714d666ffb67462821f69d70ba009374d01558d0aea15326c152"; // SHA-256 hashed(Ikbal@12)
// ============================
// CONFIGURATION
// ============================
const PASSWORD_HASH = "ca4053a30521714d666ffb67462821f69d70ba009374d01558d0aea15326c152"; // SHA-256 hashed(Ikbal@12)

// ============================
// AUTH + LOGIN HANDLING
// ============================
async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

async function login() {
  const input = document.getElementById("passwordInput").value;
  const remember = document.getElementById("rememberMe").checked;
  const spinner = document.getElementById("spinner");
  const errorMsg = document.getElementById("errorMsg");
  spinner.style.display = "block";
  errorMsg.textContent = "";

  const hashed = await hashPassword(input);
  if (hashed === PASSWORD_HASH) {
    showToast("✅ Logged in successfully!");
    if (remember) {
      localStorage.setItem("loggedIn", true);
      localStorage.setItem("stayLoggedIn", true);
    } else {
      sessionStorage.setItem("loggedIn", true);
    }
    setTimeout(() => (window.location.href = "index.html"), 1200);
  } else {
    errorMsg.textContent = "❌ Incorrect password";
  }

  spinner.style.display = "none";
}

function checkLogin() {
  const stay = localStorage.getItem("stayLoggedIn") === "true";
  const isLogged = stay ? localStorage.getItem("loggedIn") : sessionStorage.getItem("loggedIn");
  if (!isLogged) window.location.href = "login.html";
}

function logout() {
  localStorage.removeItem("loggedIn");
  sessionStorage.removeItem("loggedIn");
  window.location.href = "login.html"; // or your login page
}


function confirmLogout() {
  localStorage.removeItem("loggedIn");
  localStorage.removeItem("stayLoggedIn");
  sessionStorage.removeItem("loggedIn");
  window.location.href = "login.html";
}

function cancelLogout() {
  document.getElementById("logoutConfirmation").style.display = "none";
}

// ============================
// PASSWORD STRENGTH CHECKER
// ============================
function checkStrength() {
  const input = document.getElementById("passwordInput").value;
  const bar = document.getElementById("bar");
  const text = document.getElementById("strengthText");

  let strength = 0;
  if (input.length > 5) strength++;
  if (/[A-Z]/.test(input)) strength++;
  if (/[0-9]/.test(input)) strength++;
  if (/[^A-Za-z0-9]/.test(input)) strength++;

  const strengthMap = ["Weak", "Okay", "Strong", "Very Strong"];
  const colorMap = ["#ff4d4d", "#ffa500", "#00c853", "#0072ff"];
  bar.style.width = (strength * 25) + "%";
  bar.style.backgroundColor = colorMap[strength - 1] || "#ccc";
  text.textContent = strengthMap[strength - 1] || "";
}

// ============================
// TOGGLE PASSWORD VISIBILITY
// ============================
function togglePassword() {
  const input = document.getElementById("passwordInput");
  input.type = input.type === "password" ? "text" : "password";
}

// ============================
// DARK MODE TOGGLE + AUTO
// ============================
function applyTheme() {
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const saved = localStorage.getItem("darkMode");
  const enableDark = saved !== null ? saved === "true" : prefersDark;
  document.body.classList.toggle("dark-mode", enableDark);
}

// ============================
// ON LOAD SETUP
// ============================
window.addEventListener("DOMContentLoaded", () => {
  applyTheme();

  const toggleBtn = document.getElementById("toggleDark");
  toggleBtn?.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");
    localStorage.setItem("darkMode", document.body.classList.contains("dark-mode"));
  });

  // Resume last document
  if (window.location.pathname.endsWith("documents.html")) {
    const last = localStorage.getItem("lastDocument");
    if (last) {
      setTimeout(() => {
        if (confirm("🔁 Resume where you left off?\nGo to: " + last)) {
          window.location.href = last;
        }
      }, 1000);
    }
  }
});

// ============================
// PROFILE DROPDOWN
// ============================
function toggleProfileDropdown() {
  document.getElementById("dropdownMenu").classList.toggle("show");
}

window.addEventListener("click", (e) => {
  if (!e.target.closest(".profile-menu")) {
    document.getElementById("dropdownMenu")?.classList.remove("show");
  }
});

// ============================
// MOBILE MENU
// ============================
function toggleMobileMenu() {
  document.getElementById("mobileNav").classList.toggle("show");
}

// ============================
// LIVE SEARCH
// ============================
const searchBox = document.getElementById("searchBox");
searchBox?.addEventListener("input", () => {
  const q = searchBox.value.toLowerCase();
  document.querySelectorAll(".doc-card").forEach(card => {
    const key = card.dataset.keywords?.toLowerCase() || "";
    const text = card.textContent.toLowerCase();
    card.style.display = (key.includes(q) || text.includes(q)) ? "flex" : "none";
  });
});

// ============================
// EMOJI BURST ON HOVER
// ============================
function triggerEmojiBurst(x, y) {
  const emojis = ["📄", "✨", "💾", "🎉"];
  for (let i = 0; i < 8; i++) {
    const span = document.createElement("span");
    span.textContent = emojis[Math.floor(Math.random() * emojis.length)];
    span.className = "emoji-burst";
    span.style.left = `${x}px`;
    span.style.top = `${y}px`;
    document.body.appendChild(span);

    const angle = Math.random() * 2 * Math.PI;
    const radius = Math.random() * 80 + 30;
    const dx = Math.cos(angle) * radius;
    const dy = Math.sin(angle) * radius;

    span.animate([{ transform: "translate(0,0)", opacity: 1 }, { transform: `translate(${dx}px,${dy}px)`, opacity: 0 }], {
      duration: 1000,
      easing: "ease-out"
    });
    setTimeout(() => span.remove(), 1000);
  }
}

document.querySelectorAll(".doc-card").forEach(card => {
  card.addEventListener("mouseover", (e) => {
    const rect = card.getBoundingClientRect();
    triggerEmojiBurst(rect.left + rect.width / 2, rect.top + rect.height / 2);
  });
  card.addEventListener("click", () => {
    localStorage.setItem("lastDocument", card.getAttribute("href"));
  });
});

// ============================
// TOAST MESSAGE
// ============================
function showToast(message = "✅ Success!", duration = 3000) {
  const toast = document.createElement("div");
  toast.textContent = message;
  toast.className = "toast";
  document.body.appendChild(toast);
  setTimeout(() => toast.classList.add("show"), 10);
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 500);
  }, duration);
}

// ============================
// GSAP ANIMATIONS (Optional)
// ============================
document.querySelectorAll(".doc-card").forEach(card => {
  card.addEventListener("mouseenter", () => {
    if (typeof gsap !== "undefined") {
      gsap.to(card, { scale: 1.05, duration: 0.2 });
    }
  });
  card.addEventListener("mouseleave", () => {
    if (typeof gsap !== "undefined") {
      gsap.to(card, { scale: 1, duration: 0.2 });
    }
  });
});

// ============================
// SMOOTH SCROLL FOR LINKS
// ============================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  });
});
// Optional JS for smooth scrolling on anchor clicks
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  });
});
/* <script> */
  const canvas = document.getElementById("bgCanvas");
  const ctx = canvas.getContext("2d");
  let width, height;

  function resizeCanvas() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }
  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);

  const circles = Array.from({ length: window.innerWidth < 500 ? 20 : 50 }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    r: Math.random() * 20 + 5,
    dx: (Math.random() - 0.5) * 0.6,
    dy: (Math.random() - 0.5) * 0.6,
    color: `hsla(${Math.random() * 360}, 70%, 60%, 0.2)`
  }));

  function animate() {
    ctx.clearRect(0, 0, width, height);
    for (const c of circles) {
      ctx.beginPath();
      ctx.arc(c.x, c.y, c.r, 0, 2 * Math.PI);
      ctx.fillStyle = c.color;
      ctx.fill();
      c.x += c.dx;
      c.y += c.dy;
      if (c.x < 0 || c.x > width) c.dx *= -1;
      if (c.y < 0 || c.y > height) c.dy *= -1;
    }
    requestAnimationFrame(animate);
  }

  animate();
// nav
src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js"


  const nav = document.getElementById("mobileNav");
  const overlay = document.getElementById("navOverlay");
  const links = nav.querySelectorAll("a");
  const hamburger = document.querySelector(".hamburger");
  let isNavOpen = false;

  function toggleMobileMenu() {
    if (!isNavOpen) {
      overlay.style.display = "block";

      gsap.to(nav, {
        x: "250px",
        duration: 0.4,
        ease: "power2.out"
      });

      gsap.fromTo(links, {
        opacity: 0,
        x: -20
      }, {
        opacity: 1,
        x: 0,
        stagger: 0.1,
        delay: 0.2
      });

      isNavOpen = true;
      document.addEventListener("click", handleOutsideClick);
    } else {
      gsap.to(nav, {
        x: "-250px",
        duration: 0.4,
        ease: "power2.in"
      });

      overlay.style.display = "none";
      isNavOpen = false;
      document.removeEventListener("click", handleOutsideClick);
    }
  }

  // Auto-close when a nav link is clicked
  links.forEach(link => {
    link.addEventListener("click", () => {
      if (window.innerWidth < 768) {
        toggleMobileMenu();
      }
    });
  });

  // Close if clicked outside
  function handleOutsideClick(e) {
    if (!nav.contains(e.target) && !hamburger.contains(e.target)) {
      toggleMobileMenu();
    }
  }

  // Start hidden on small screens
  if (window.innerWidth < 768) {
    gsap.set(nav, { x: "-250px" });
  }
// login
    particlesJS("particles-js", {
      particles: {
        number: { value: 60 },
        color: { value: "#ffffff" },
        shape: { type: "circle" },
        opacity: { value: 0.2 },
        size: { value: 3 },
        move: { enable: true, speed: 1 }
      },
      interactivity: {
        events: { onhover: { enable: true, mode: "repulse" } }
      },
      retina_detect: true
    });

    function handleLoginFlip() {
      const box = document.getElementById("loginBox");
      box.classList.add("flip");
      setTimeout(() => {
        login();
        box.classList.remove("flip");
      }, 600);
    }