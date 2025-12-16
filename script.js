// SELECT SECTIONS
const sections = document.querySelectorAll('.section');
let currentIndex = 0;
let isScrolling = false;

// DESKTOP — MOUSE PARALLAX
document.addEventListener("mousemove", (e) => {
    const bg = document.getElementById("bg");
    if (!bg) return;

    const x = (e.clientX / window.innerWidth - 0.5) * 25;
    const y = (e.clientY / window.innerHeight - 0.5) * 25;

    bg.style.transform = `translate(${x}px, ${y}px) scale(1.1)`;
});

// SCROLL SNAP MANUAL (NO FREE SCROLL)
function goToSection(index) {
    if (index < 0 || index >= sections.length) return;
    isScrolling = true;
    currentIndex = index;

    const targetTop = sections[index].offsetTop;

    window.scrollTo({
        top: targetTop,
        behavior: 'smooth'
    });

    setTimeout(() => {
        isScrolling = false;
    }, 650); // زمان انیمیشن اسکرول
}

// ما اسکرول عادی رو به "مرحله" تبدیل می‌کنیم
window.addEventListener('wheel', (e) => {
    e.preventDefault();
    if (isScrolling) return;

    if (e.deltaY > 0) {
        goToSection(currentIndex + 1);
    } else if (e.deltaY < 0) {
        goToSection(currentIndex - 1);
    }
}, { passive: false });

// TOUCH (MOBILE SWIPE)
let touchStartY = 0;

window.addEventListener('touchstart', (e) => {
    touchStartY = e.touches[0].clientY;
}, { passive: true });

window.addEventListener('touchend', (e) => {
    const endY = e.changedTouches[0].clientY;
    const diff = touchStartY - endY;

    if (Math.abs(diff) < 40 || isScrolling) return;

    if (diff > 0) {
        goToSection(currentIndex + 1);
    } else {
        goToSection(currentIndex - 1);
    }
}, { passive: true });

// DEVICE ORIENTATION (IPHONE / MOBILE)
// بک‌گراند + هیپنوتیزم
if (window.DeviceOrientationEvent) {
    window.addEventListener("deviceorientation", (event) => {
        const x = event.gamma || 0;
        const y = event.beta || 0;

        const bg = document.getElementById("bg");
        if (bg) {
            bg.style.transform = `translate(${x * 1.5}px, ${y * 1.5}px) scale(1.1)`;
        }

        const hypno = document.querySelector(".hypno-img");
        if (hypno) {
            hypno.style.transform = `rotate(${x * 3}deg)`;
        }
    });
}

// شروع: ببر سکشن ۰
window.addEventListener('load', () => {
    goToSection(0);
});