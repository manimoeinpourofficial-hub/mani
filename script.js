// BACKGROUND PARALLAX — DESKTOP
document.addEventListener("mousemove", (e) => {
    const bg = document.getElementById("bg");
    if (!bg) return;

    const x = (e.clientX / window.innerWidth - 0.5) * 25;
    const y = (e.clientY / window.innerHeight - 0.5) * 25;

    bg.style.transform = `translate(${x}px, ${y}px) scale(1.1)`;
});

// MOBILE SPATIAL SCENE
if (window.DeviceOrientationEvent) {
    window.addEventListener("deviceorientation", (event) => {
        const x = event.gamma || 0;
        const y = event.beta || 0;

        const bg = document.getElementById("bg");
        if (bg) {
            bg.style.transform = `translate(${x * 1.5}px, ${y * 1.5}px) scale(1.1)`;
        }
    });
}

// PLAY SOUND ON TEXT ANIMATION
window.addEventListener("load", () => {
    const sound = document.getElementById("textSound");
    setTimeout(() => {
        sound.play();
    }, 300);
});

// ICON CLICK EFFECT
document.querySelectorAll(".icon-box").forEach(icon => {
    icon.addEventListener("click", () => {
        icon.style.transform = "scale(0.9)";
        setTimeout(() => {
            icon.style.transform = "scale(1)";
        }, 150);
    });
});
