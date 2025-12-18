// ===== Detect Mobile/Desktop =====
const isMobile = window.innerWidth <= 900;
if (isMobile) {
  document.body.classList.add("mobile-free");
} else {
  document.body.classList.add("desktop-locked");
}

// ===== SECTION 1 – Motion Background =====
const bg = document.getElementById("bg");
const motionBtn = document.getElementById("motionToggle");
let motionEnabled = false;

// Mouse parallax (Desktop)
if (!isMobile && bg) {
  document.addEventListener("mousemove", (e) => {
    if (!motionEnabled) return;
    const x = (e.clientX / window.innerWidth - 0.5) * 30;
    const y = (e.clientY / window.innerHeight - 0.5) * 30;
    bg.style.transform = `translate(${x}px, ${y}px) scale(1.2)`;
  });
}

// Gyro (Mobile) + permission
function enableMobileMotion() {
  if (!bg) return;

  function attachOrientationListener() {
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
      .then((response) => {
        if (response === "granted") {
          attachOrientationListener();
        }
      })
      .catch(() => {});
  } else {
    attachOrientationListener();
  }
}

// Motion button
if (motionBtn) {
  motionBtn.addEventListener("click", () => {
    motionEnabled = !motionEnabled;
    motionBtn.classList.toggle("active", motionEnabled);

    if (isMobile && motionEnabled) {
      enableMobileMotion();
    }
  });
}

// Optional: play text sound
window.addEventListener("load", () => {
  const sound = document.getElementById("textSound");
  if (sound) {
    setTimeout(() => {
      sound.play().catch(() => {});
    }, 400);
  }
});

// ===== SECTION 3 – Click to unlock + Drag-to-Unlock =====
const playUnlockBtn = document.getElementById("playUnlockBtn");
const dragGame = document.getElementById("dragGame");
const dragLogo = document.getElementById("dragLogo");
const dropTarget = document.getElementById("dropTarget");
const gameList = document.getElementById("gameList");
const voiceStatus = document.getElementById("voiceStatus");

if (playUnlockBtn) {
  playUnlockBtn.addEventListener("click", () => {
    playUnlockBtn.classList.add("hidden");
    dragGame.classList.remove("hidden");
    if (voiceStatus) voiceStatus.textContent = "Drag the logo into the target.";
  });
}

// Drag & Drop – Desktop (mouse)
if (dragLogo && dropTarget && gameList) {
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
    }
  });

  // Drag & Drop – Mobile (touch)
  let touchDragging = false;

  dragLogo.addEventListener("touchstart", (e) => {
    touchDragging = true;
    dragLogo.style.position = "absolute";
    dragLogo.style.zIndex = "10";
  });

  dragLogo.addEventListener("touchmove", (e) => {
    if (!touchDragging) return;
    const touch = e.touches[0];
    const rect = dragGame.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;

    dragLogo.style.left = x - dragLogo.offsetWidth / 2 + "px";
    dragLogo.style.top  = y - dragLogo.offsetHeight / 2 + "px";

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
    if (!touchDragging) return;
    touchDragging = false;

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
      // برگردوندن لوگو به جای اولیه
      dragLogo.style.left = "";
      dragLogo.style.top = "";
      dragLogo.style.position = "relative";
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
    if (voiceStatus) voiceStatus.textContent = "Unlocked. These are my games.";
  }
}

// ===== Scroll Slide (Desktop only) =====
if (!isMobile) {
  const sections = document.querySelectorAll(".panel");
  let currentIndex = 0;
  let isScrolling = false;

  function goToSection(index) {
    if (index < 0 || index >= sections.length) return;
    isScrolling = true;
    currentIndex = index;
    const target = sections[index];
    window.scrollTo({
      top: target.offsetTop,
      behavior: "smooth"
    });
    setTimeout(() => {
      isScrolling = false;
    }, 700);
  }

  window.addEventListener("wheel", (e) => {
    if (isScrolling) return;
    if (e.deltaY > 0) {
      goToSection(currentIndex + 1);
    } else if (e.deltaY < 0) {
      goToSection(currentIndex - 1);
    }
  });

  const arrow = document.querySelector(".arrow");
  if (arrow) {
    arrow.addEventListener("click", () => {
      goToSection(currentIndex + 1);
    });
  }
}
