/* ============================
   DEVICE DETECTION
============================ */
const isMobile = window.innerWidth <= 900;

if (isMobile) {
  document.body.classList.add("mobile-free");
} else {
  document.body.classList.add("desktop-locked");
}

/* ============================
   SECTION 1 — MOTION BACKGROUND
============================ */
const bg = document.getElementById("bg");
const motionBtn = document.getElementById("motionToggle");
let motionEnabled = false;

// Desktop mouse motion
if (!isMobile && bg) {
  document.addEventListener("mousemove", (e) => {
    if (!motionEnabled) return;
    const x = (e.clientX / window.innerWidth - 0.5) * 30;
    const y = (e.clientY / window.innerHeight - 0.5) * 30;
    bg.style.transform = `translate(${x}px, ${y}px) scale(1.2)`;
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
      bg.style.transform = `translate(${x * 2}px, ${y * 2}px) scale(1.2)`;
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

/* ============================
   SECTION 3 — CLICK TO UNLOCK + DRAG GAME
============================ */
const unlockBtn = document.getElementById("unlockBtn");
const dragGame = document.getElementById("dragGame");
const dragLogo = document.getElementById("dragLogo");
const dropTarget = document.getElementById("dropTarget");
const gameList = document.getElementById("gameList");

// Step 1 — Click to unlock
if (unlockBtn) {
  unlockBtn.addEventListener("click", () => {
    unlockBtn.classList.add("hidden");
    dragGame.classList.remove("hidden");
  });
}

/* ============================
   DRAG & DROP — DESKTOP
============================ */
if (dragLogo && dropTarget) {
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
    if (data === "anfo-logo") unlockGames();
  });
}

/* ============================
   DRAG & DROP — MOBILE (TOUCH)
============================ */
let dragging = false;

dragLogo.addEventListener("touchstart", (e) => {
  dragging = true;
  dragLogo.style.position = "absolute";
  dragLogo.style.zIndex = "10";
});

dragLogo.addEventListener("touchmove", (e) => {
  if (!dragging) return;

  const touch = e.touches[0];
  const parentRect = dragGame.getBoundingClientRect();

  const x = touch.clientX - parentRect.left;
  const y = touch.clientY - parentRect.top;

  dragLogo.style.left = x - dragLogo.offsetWidth / 2 + "px";
  dragLogo.style.top = y - dragLogo.offsetHeight / 2 + "px";

  const targetRect = dropTarget.getBoundingClientRect();
  const logoRect = dragLogo.getBoundingClientRect();

  const isOver =
    logoRect.left < targetRect.right &&
    logoRect.right > targetRect.left &&
    logoRect.top < targetRect.bottom &&
    logoRect.bottom > targetRect.top;

  dropTarget.classList.toggle("active", isOver);
});

dragLogo.addEventListener("touchend", () => {
  if (!dragging) return;
  dragging = false;

  const targetRect = dropTarget.getBoundingClientRect();
  const logoRect = dragLogo.getBoundingClientRect();

  const isOver =
    logoRect.left < targetRect.right &&
    logoRect.right > targetRect.left &&
    logoRect.top < targetRect.bottom &&
    logoRect.bottom > targetRect.top;

  if (isOver) {
    unlockGames();
  } else {
    dragLogo.style.left = "";
    dragLogo.style.top = "";
    dragLogo.style.position = "relative";
    dropTarget.classList.remove("active");
  }
});

/* ============================
   UNLOCK FUNCTION
============================ */
function unlockGames() {
  dropTarget.classList.add("active");
  dragGame.classList.add("hidden");
  gameList.classList.remove("hidden");

  dragLogo.style.left = "";
  dragLogo.style.top = "";
  dragLogo.style.position = "relative";
}

/* ============================
   DESKTOP — SCROLL SLIDE
============================ */
if (!isMobile) {
  const sections = document.querySelectorAll(".panel");
  let index = 0;
  let locked = false;

  function goTo(i) {
    if (i < 0 || i >= sections.length) return;
    locked = true;
    index = i;
    window.scrollTo({
      top: sections[i].offsetTop,
      behavior: "smooth"
    });
    setTimeout(() => (locked = false), 700);
  }

  window.addEventListener("wheel", (e) => {
    if (locked) return;
    if (e.deltaY > 0) goTo(index + 1);
    else goTo(index - 1);
  });

  const arrow = document.querySelector(".arrow");
  if (arrow) {
    arrow.addEventListener("click", () => goTo(index + 1));
  }
}
