// ===== تشخیص موبایل / دسکتاپ =====
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

// Mouse parallax (دسکتاپ)
if (!isMobile && bg) {
  document.addEventListener("mousemove", (e) => {
    if (!motionEnabled) return;
    const x = (e.clientX / window.innerWidth - 0.5) * 25;
    const y = (e.clientY / window.innerHeight - 0.5) * 25;
    bg.style.transform = `translate(${x}px, ${y}px) scale(1.1)`;
  });
}

// Gyro (موبایل) + permission
function enableMobileMotion() {
  if (!bg) return;

  function attachOrientationListener() {
    window.addEventListener("deviceorientation", (event) => {
      if (!motionEnabled) return;
      const x = event.gamma || 0;
      const y = event.beta || 0;
      bg.style.transform = `translate(${x * 2}px, ${y * 2}px) scale(1.1)`;
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

// دکمه Enable Motion
if (motionBtn) {
  motionBtn.addEventListener("click", () => {
    motionEnabled = !motionEnabled;
    motionBtn.classList.toggle("active", motionEnabled);

    if (isMobile && motionEnabled) {
      enableMobileMotion();
    }
  });
}

// ===== پخش صدای متن (اختیاری) =====
window.addEventListener("load", () => {
  const sound = document.getElementById("textSound");
  if (sound) {
    setTimeout(() => {
      sound.play().catch(() => {});
    }, 400);
  }
});

// ===== انیمیشن ورود روی اسکرول برای سکشن ۲ و ۳ =====
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
      }
    });
  },
  {
    threshold: 0.3
  }
);

// هر المنتی که کلاس fade-in یا fade-up دارد، در ورود فعال می‌شود
document.querySelectorAll(".fade-in, .fade-up").forEach(el => {
  observer.observe(el);
});

// ===== SECTION 3 – Voice Recognition =====
const voiceBtn = document.getElementById("voiceBtn");
const gameList = document.getElementById("gameList");
const voiceStatus = document.getElementById("voiceStatus");

if (voiceBtn) {
  voiceBtn.addEventListener("click", () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      if (voiceStatus) {
        voiceStatus.textContent = "Voice recognition not supported in this browser.";
      }
      return;
    }

    const rec = new SpeechRecognition();
    rec.lang = "en-US";
    rec.interimResults = false;
    rec.maxAlternatives = 1;

    if (voiceStatus) voiceStatus.textContent = "Listening for 'show me'...";

    rec.start();

    rec.onresult = (e) => {
      const text = e.results[0][0].transcript.toLowerCase();
      if (text.includes("show me")) {
        gameList.classList.remove("hidden");
        if (voiceStatus) voiceStatus.textContent = "Got it. Showing your games.";
      } else {
        if (voiceStatus) {
          voiceStatus.textContent = `Heard: "${text}" (try saying "show me")`;
        }
      }
    };

    rec.onerror = () => {
      if (voiceStatus) voiceStatus.textContent = "There was an error with recognition.";
    };

    rec.onend = () => {
      if (!gameList.classList.contains("hidden")) return;
      if (voiceStatus && !voiceStatus.textContent) {
        voiceStatus.textContent = "Stopped listening.";
      }
    };
  });
}

// ===== Scroll Slide (فقط دسکتاپ) =====
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
