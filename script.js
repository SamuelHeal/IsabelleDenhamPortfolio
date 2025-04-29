// Wait for DOM to be fully loaded
document.addEventListener("DOMContentLoaded", () => {
  // Smooth scroll for navigation links
  document.querySelectorAll("nav a").forEach((link) => {
    link.addEventListener("click", (e) => {
      if (link.getAttribute("href") === "#") {
        e.preventDefault();
      }
    });
  });

  // Hamburger menu functionality
  const hamburgerMenu = document.querySelector(".hamburger-menu");
  const headerRight = document.querySelector(".header-right");

  if (hamburgerMenu) {
    hamburgerMenu.addEventListener("click", () => {
      hamburgerMenu.classList.toggle("active");
      headerRight.classList.toggle("active");
    });

    // Close menu when clicking on a link
    document.querySelectorAll(".header-right a").forEach((link) => {
      link.addEventListener("click", () => {
        hamburgerMenu.classList.remove("active");
        headerRight.classList.remove("active");
      });
    });

    // Close menu when clicking outside
    document.addEventListener("click", (e) => {
      if (
        !e.target.closest(".hamburger-menu") &&
        !e.target.closest(".header-right") &&
        headerRight.classList.contains("active")
      ) {
        hamburgerMenu.classList.remove("active");
        headerRight.classList.remove("active");
      }
    });
  }

  // Add animation to the big name
  const nameElements = document.querySelectorAll(".big-name h1");
  nameElements.forEach((el, index) => {
    el.style.opacity = "0";
    el.style.transform = "translateY(20px)";
    el.style.transition = "opacity 0.5s ease, transform 0.5s ease";

    // Stagger the animation
    setTimeout(() => {
      el.style.opacity = "1";
      el.style.transform = "translateY(0)";
    }, 100 * index);
  });

  // Create and position diamond stars in the background
  createBackgroundStars();
});

// Function to create the background diamond stars
function createBackgroundStars() {
  const container = document.querySelector(".background-stars");
  const starCount = 30; // Increased number of stars

  // Clear any existing stars
  container.innerHTML = "";

  // Create the stars
  for (let i = 0; i < starCount; i++) {
    // Create a star element
    const star = document.createElement("div");
    star.classList.add("star");

    // Randomize position
    const xPos = Math.random() * 100; // percentage across screen
    const yPos = Math.random() * 100; // percentage down screen

    // Randomize size - wider range for more variety
    const size = 0.3 + Math.random() * 2.2; // between 0.3 and 2.5

    // Randomize animation duration and delay
    const animationDuration = 2 + Math.random() * 4; // between 2 and 6 seconds
    const animationDelay = 0.05 + Math.random() * 0.3; // small initial delay + random

    // Set styles
    star.style.left = `${xPos}%`;
    star.style.top = `${yPos}%`;

    // Apply initial state first
    star.style.transform = `scale(1) rotate(0deg)`;
    star.style.opacity = "0.3";

    // Add a small delay to wait for the initial state to be applied
    setTimeout(() => {
      star.style.animationDuration = `${animationDuration}s`;
      star.style.animationDelay = `${animationDelay}s`;
    }, 10);

    // Add to container
    container.appendChild(star);
  }
}
