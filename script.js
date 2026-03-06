const cat = document.getElementById("cat");
const scoreDisplay = document.getElementById("score");
const messageOverlay = document.getElementById("message-overlay");
const gameContainer = document.getElementById("game-container");

let score = 0;
const targetScore = 50; // Increased so she can experience Zoomies and Cucumbers!
let isGameOver = false;
let gameStarted = false;

// Move Cat
let catX = window.innerWidth / 2;
const speed = 15;

document.addEventListener("mousemove", (e) => {
  if (isGameOver || !gameStarted) return;
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
  if (isGameOver || !gameStarted) return;
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
  meowClone.play().catch((e) => console.log("Audio play failed:", e));
}

// Spawn Objects
function spawnHeart() {
  if (isGameOver) return;

  const heart = document.createElement("div");
  heart.classList.add("heart");

  // Randomize emoji (hearts, cotton, treats, and rarely... CUCUMBERS!)
  let objects = ["❤️", "☁️", "🐟", "💕"];
  
  // 15% chance to spawn the Cucumber of Doom 🥒
  let isCucumber = false;
  if (Math.random() < 0.15) {
     objects = ["🥒"];
     isCucumber = true;
  }
  
  heart.innerText = objects[Math.floor(Math.random() * objects.length)];

  // Random position starting from top
  const startX = Math.random() * (window.innerWidth - 30);
  heart.style.left = `${startX}px`;

  // Random speed - gets faster during Zoomies! (score >= 25)
  const isZoomies = score >= 25;
  if (isZoomies && !document.body.classList.contains("zoomies")) {
      document.body.classList.add("zoomies");
      cat.classList.add("zoomies");
  }

  let baseDuration = isZoomies ? 1.0 : (score >= 15 ? 1.5 : 3);
  let randomExtra = isZoomies ? 0.5 : (score >= 15 ? 1 : 2);
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
      clearInterval(checkCollision);
      heart.remove(); // Remove item
      
      if (isCucumber) {
        // Oh no!! JUMP SCARE!
        score = Math.max(0, score - 3); // Lose 3 points!
        scoreDisplay.innerText = score;
        
        // Hiss! 😾 (We lower the pitch of playMeow to sound angry)
        const angryMeow = meowSound.cloneNode();
        angryMeow.playbackRate = 0.5;
        angryMeow.volume = 0.8;
        angryMeow.play().catch(e => console.log(e));
        
        // Spin scare animation
        cat.style.animation = "spinScare 0.6s ease-in-out";
        setTimeout(() => {
           cat.style.animation = "none";
        }, 600);
        
      } else {
        // Yay! Good catch
        score++;
        scoreDisplay.innerText = score;
        
        playMeow(); // 🎶 Meow!

        // Cute effect on the cat when it catches something
        cat.style.transform = `translateX(-50%) scale(1.2)`;
        setTimeout(() => {
          cat.style.transform = `translateX(-50%) scale(1)`;
        }, 100);

        checkWin();
      }
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
  // Zoomies mode makes hearts spawn incredibly fast!
  const delay = score >= 25 ? 200 : (score >= 15 ? 500 : 1000);
  setTimeout(scheduleNextHeart, delay);
}

// Start Game Logic
const startOverlay = document.getElementById("start-overlay");
const startBtn = document.getElementById("start-btn");

startBtn.addEventListener("click", () => {
  // Unlock audio on first interaction
  meowSound
    .play()
    .then(() => {
      meowSound.pause();
      meowSound.currentTime = 0;
    })
    .catch((e) => console.log("Audio unlock failed:", e));

  startOverlay.classList.add("hidden");
  gameStarted = true;
  scheduleNextHeart(); // Start the loop
});
