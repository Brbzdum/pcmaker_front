<template>
  <svg
          viewBox="0 0 500 250"
          xmlns="http://www.w3.org/2000/svg"
          class="pcmaker-logo"
  >
    <!-- Monitor -->
    <rect x="20" y="30" width="140" height="100" rx="10" class="neon-blue" />
    <!-- Tower inside monitor -->
    <rect x="65" y="45" width="50" height="70" rx="6" class="neon-pink" />
    <circle cx="90" cy="100" r="4" class="neon-pink" />
    <line x1="70" y1="60" x2="110" y2="60" class="neon-pink-line" stroke-width="4" />
    <line x1="70" y1="70" x2="110" y2="70" class="neon-pink-line" stroke-width="4" />

    <!-- Mouse -->
    <rect x="190" y="50" width="60" height="90" rx="30" class="neon-orange" />
    <line x1="220" y1="50" x2="220" y2="70" class="neon-orange-line" stroke-width="4" />
    <line x1="220" y1="30" x2="220" y2="50" class="neon-orange-line" stroke-width="4" />

    <!-- Text -->
    <text x="20" y="200" class="neon-text">PcMaker</text>
  </svg>
</template>

<script setup lang="ts">
// No imports needed
</script>

<style scoped>
.pcmaker-logo {
  width: 100%;
  height: auto;
  background-color: transparent;
  border-radius: 0;
  padding: 8px;
  transition: all 0.3s ease;
}

/* Base neon styles (subtle for light theme) */
.neon-blue,
.neon-pink,
.neon-orange,
.neon-text,
.neon-pink-line,
.neon-orange-line {
  transition: filter 0.3s ease, stroke 0.3s ease, fill 0.3s ease;
}

/* Monitor */
.neon-blue {
  fill: none;
  stroke: #0077ff;
  stroke-width: 3;
  filter: drop-shadow(0 0 3px #0077ff);
}

/* Tower */
.neon-pink {
  fill: none;
  stroke: #cc00cc;
  stroke-width: 3;
  filter: drop-shadow(0 0 3px #cc00cc);
}

.neon-pink-line {
  stroke: #cc00cc;
  filter: drop-shadow(0 0 3px #cc00cc);
}

/* Mouse */
.neon-orange {
  fill: none;
  stroke: #ff8800;
  stroke-width: 3;
  filter: drop-shadow(0 0 3px #ff8800);
}

.neon-orange-line {
  stroke: #ff8800;
  filter: drop-shadow(0 0 3px #ff8800);
}

/* Text */
.neon-text {
  font-size: 40px;
  fill: #0077ff;
  font-weight: bold;
  font-family: 'Segoe UI', sans-serif;
  filter: drop-shadow(0 0 3px #0077ff);
}

/* Hover glow enhancement */
.pcmaker-logo:hover .neon-blue {
  stroke: #00aaff;
  filter: drop-shadow(0 0 6px #00aaff);
}

.pcmaker-logo:hover .neon-pink,
.pcmaker-logo:hover .neon-pink-line {
  stroke: #ff00cc;
  filter: drop-shadow(0 0 6px #ff00cc);
}

.pcmaker-logo:hover .neon-orange,
.pcmaker-logo:hover .neon-orange-line {
  stroke: #ffaa00;
  filter: drop-shadow(0 0 6px #ffaa00);
}

.pcmaker-logo:hover .neon-text {
  fill: #00aaff;
  filter: drop-shadow(0 0 6px #00aaff);
}

/* Dark theme enhancements */
:global(.theme-dark) .pcmaker-logo {
  background-color: var(--dark-surface-color, #1e1e1e);
}

:global(.theme-dark) .neon-blue {
  filter: drop-shadow(0 0 3px #0077ff);
}

:global(.theme-dark) .neon-pink,
:global(.theme-dark) .neon-pink-line {
  filter: drop-shadow(0 0 3px #cc00cc);
}

:global(.theme-dark) .neon-orange,
:global(.theme-dark) .neon-orange-line {
  filter: drop-shadow(0 0 3px #ff8800);
}

:global(.theme-dark) .neon-text {
  filter: drop-shadow(0 0 3px #0077ff);
}

/* Dark theme hover */
:global(.theme-dark) .pcmaker-logo:hover .neon-blue {
  filter: drop-shadow(0 0 8px #00aaff);
}

:global(.theme-dark) .pcmaker-logo:hover .neon-pink,
:global(.theme-dark) .pcmaker-logo:hover .neon-pink-line {
  filter: drop-shadow(0 0 8px #ff00cc);
}

:global(.theme-dark) .pcmaker-logo:hover .neon-orange,
:global(.theme-dark) .pcmaker-logo:hover .neon-orange-line {
  filter: drop-shadow(0 0 8px #ffaa00);
}

:global(.theme-dark) .pcmaker-logo:hover .neon-text {
  filter: drop-shadow(0 0 8px #00aaff);
}
</style> 