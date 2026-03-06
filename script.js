const cat = document.getElementById("cat");
const scoreDisplay = document.getElementById("score");
const messageOverlay = document.getElementById("message-overlay");
const gameContainer = document.getElementById("game-container");

let score = 0;
const targetScore = 30;
let isGameOver = false;

// Move Cat
let catX = window.innerWidth / 2;
const speed = 15;

document.addEventListener("mousemove", (e) => {
  if (isGameOver) return;
  const halfWidth = cat.offsetWidth / 2;
  catX = e.clientX;

  // Boundary check
  if (catX < halfWidth) catX = halfWidth;
  if (catX > window.innerWidth - halfWidth)
    catX = window.innerWidth - halfWidth;

  cat.style.left = `${catX}px`;
});

// Mobile Touch Support
document.addEventListener("touchmove", (e) => {
  if (isGameOver) return;
  const touch = e.touches[0];
  const halfWidth = cat.offsetWidth / 2;
  // Boundary check
  if (catX < halfWidth) catX = halfWidth;
  if (catX > window.innerWidth - halfWidth)
    catX = window.innerWidth - halfWidth;

  cat.style.left = `${catX}px`;
});

// Audio for Meow Sound
const meowSound = new Audio("meow-1.mp3");

function playMeow() {
  // Clone the node so rapid meows can overlap
  const meowClone = meowSound.cloneNode();
  meowClone.volume = 0.5; // Optional: Adjust volume here (0.0 to 1.0)
  meowClone.play().catch(e => console.log("Audio play failed:", e));
}

// Spawn Objects
function spawnHeart() {
  if (isGameOver) return;

  const heart = document.createElement("div");
  heart.classList.add("heart");

  // Randomize emoji (hearts, cotton, treats)
  const objects = ["❤️", "☁️", "🐟", "💕"];
  heart.innerText = objects[Math.floor(Math.random() * objects.length)];

  // Random position starting from top
  const startX = Math.random() * (window.innerWidth - 30);
  heart.style.left = `${startX}px`;

  // Random speed - gets faster if score >= 15
  let baseDuration = score >= 15 ? 1.5 : 3;
  let randomExtra = score >= 15 ? 1 : 2;
  const duration = Math.random() * randomExtra + baseDuration;
  heart.style.animationDuration = `${duration}s`;

  gameContainer.appendChild(heart);

  // Collision Detection Loop for this heart
  const checkCollision = setInterval(() => {
    if (isGameOver) {
      clearInterval(checkCollision);
      return;
    }

    const catRect = cat.getBoundingClientRect();
    const heartRect = heart.getBoundingClientRect();

    // Check intersection
    if (
      heartRect.left < catRect.right &&
      heartRect.right > catRect.left &&
      heartRect.bottom > catRect.top &&
      heartRect.top < catRect.bottom
    ) {
      // Collision detected!
      score++;
      scoreDisplay.innerText = score;
      clearInterval(checkCollision);
      heart.remove(); // Remove heart
      
      playMeow(); // 🎶 Meow!

      // Cute effect on the cat when it catches something
      cat.style.transform = `translateX(-50%) scale(1.2)`;
      setTimeout(() => {
        cat.style.transform = `translateX(-50%) scale(1)`;
      }, 100);

      checkWin();
    }

    // Remove if off screen
    if (heartRect.top > window.innerHeight) {
      clearInterval(checkCollision);
      heart.remove();
    }
  }, 50); // Check frequently
}

function checkWin() {
  if (score >= targetScore) {
    isGameOver = true;

    // Remove active falling hearts
    document.querySelectorAll(".heart").forEach((h) => h.remove());

    // Show message
    messageOverlay.classList.remove("hidden");
  }
}

// Spawning Loop
function scheduleNextHeart() {
  if (isGameOver) return;
  spawnHeart();
  // Spawn faster if score >= 15
  const delay = score >= 15 ? 500 : 1000;
  setTimeout(scheduleNextHeart, delay);
}
scheduleNextHeart();
