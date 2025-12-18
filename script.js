// Detect mobile
const isMobile = window.innerWidth <= 900;

/* ========= SECTION 1 — MOTION BACKGROUND ========= */
const bg = document.getElementById("bg");
const motionBtn = document.getElementById("motionToggle");
let motionEnabled = false;

// Desktop mouse motion
if (!isMobile && bg) {
  document.addEventListener("mousemove", (e) => {
    if (!motionEnabled) return;
    const x = (e.clientX / window.innerWidth - 0.5) * 30;
    const y = (e.clientY / window.innerHeight - 0.5) * 30;
    bg.style.transform = `translate(${x}px, ${y}px) scale(1.15)`;
  });
}

// Mobile gyro motion
function enableMobileMotion() {
  if (!bg) return;

  function attachGyro() {
    window.addEventListener("deviceorientation", (event) => {
      if (!motionEnabled) return;
      const x = event.gamma || 0;
      const y = event.beta || 0;
      bg.style.transform = `translate(${x * 2}px, ${y * 2}px) scale(1.15)`;
    });
  }

  if (typeof DeviceOrientationEvent !== "undefined" &&
      typeof DeviceOrientationEvent.requestPermission === "function") {
    DeviceOrientationEvent.requestPermission()
      .then((res) => {
        if (res === "granted") attachGyro();
      })
      .catch(() => {});
  } else {
    attachGyro();
  }
}

// Toggle motion
if (motionBtn) {
  motionBtn.addEventListener("click", () => {
    motionEnabled = !motionEnabled;
    motionBtn.classList.toggle("active", motionEnabled);
    if (isMobile && motionEnabled) enableMobileMotion();
  });
}

/* ========= Arrow scroll to next section ========= */
const arrow = document.querySelector(".arrow");
if (arrow) {
  arrow.addEventListener("click", () => {
    const sections = document.querySelectorAll(".panel");
    if (sections.length > 1) {
      const nextTop = sections[1].offsetTop;
      window.scrollTo({ top: nextTop, behavior: "smooth" });
    }
  });
}

/* ========= SECTION 3 — CLICK TO UNLOCK + DRAG GAME ========= */
const unlockBtn   = document.getElementById("unlockBtn");
const dragGame    = document.getElementById("dragGame");
const dragLogo    = document.getElementById("dragLogo");
const dropTarget  = document.getElementById("dropTarget");
const gameList    = document.getElementById("gameList");

if (unlockBtn && dragGame && dragLogo && dropTarget && gameList) {
  // مرحله ۱: کلیک برای شروع بازی
  unlockBtn.addEventListener("click", () => {
    unlockBtn.classList.add("hidden");
    dragGame.classList.remove("hidden");
  });

  // Desktop Drag & Drop (HTML5 drag)
  dragLogo.addEventListener("dragstart", (e) => {
    e.dataTransfer.setData("text/plain", "anfo-logo");
  });

  dropTarget.addEventListener("dragover", (e) => {
    e.preventDefault();
    dropTarget.classList.add("active");
  });

  dropTarget.addEventListener("dragleave", () => {
    dropTarget.classList.remove("active");
  });

  dropTarget.addEventListener("drop", (e) => {
    e.preventDefault();
    const data = e.dataTransfer.getData("text/plain");
    if (data === "anfo-logo") {
      unlockGames();
    } else {
      dropTarget.classList.remove("active");
    }
  });

  // Pointer-based drag (کار می‌کند روی موبایل و دسکتاپ مدرن)
  let pointerDown = false;

  dragLogo.addEventListener("pointerdown", (e) => {
    pointerDown = true;
    dragLogo.setPointerCapture(e.pointerId);
    dragLogo.style.position = "absolute";
    dragLogo.style.zIndex = "10";
  });

  dragLogo.addEventListener("pointermove", (e) => {
    if (!pointerDown) return;

    const parentRect = dragGame.getBoundingClientRect();
    const x = e.clientX - parentRect.left;
    const y = e.clientY - parentRect.top;

    dragLogo.style.left = (x - dragLogo.offsetWidth / 2) + "px";
    dragLogo.style.top  = (y - dragLogo.offsetHeight / 2) + "px";

    const targetRect = dropTarget.getBoundingClientRect();
    const logoRect   = dragLogo.getBoundingClientRect();

    const isOver =
      logoRect.left < targetRect.right &&
      logoRect.right > targetRect.left &&
      logoRect.top < targetRect.bottom &&
      logoRect.bottom > targetRect.top;

    dropTarget.classList.toggle("active", isOver);
  });

  dragLogo.addEventListener("pointerup", () => {
    if (!pointerDown) return;
    pointerDown = false;

    const targetRect = dropTarget.getBoundingClientRect();
    const logoRect   = dragLogo.getBoundingClientRect();

    const isOver =
      logoRect.left < targetRect.right &&
      logoRect.right > targetRect.left &&
      logoRect.top < targetRect.bottom &&
      logoRect.bottom > targetRect.top;

    if (isOver) {
      unlockGames();
    } else {
      // reset position
      dragLogo.style.left = "";
      dragLogo.style.top = "";
      dragLogo.style.position = "relative";
      dragLogo.style.zIndex = "";
      dropTarget.classList.remove("active");
    }
  });

  function unlockGames() {
    dropTarget.classList.add("active");
    dragGame.classList.add("hidden");
    gameList.classList.remove("hidden");

    dragLogo.style.left = "";
    dragLogo.style.top = "";
    dragLogo.style.position = "relative";
    dragLogo.style.zIndex = "";
  }
}
