<template>
  <div class="splash-screen">
    <svg class="splash-logo" viewBox="0 0 249 345" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M0 177.945C0 167.946 6.45984 159.093 15.9817 156.042L163.982 108.619C178.824 103.863 194 114.936 194 130.522V266.055C194 276.054 187.54 284.907 178.018 287.958L30.0183 335.381C15.1755 340.137 0 329.064 0 313.478V177.945Z"
        fill="#24827D"
      />
      <path
        opacity="0.78"
        d="M194 126.258C194 117.233 188.722 109.042 180.504 105.313L84.5042 61.7499C69.2773 54.8402 52 65.973 52 82.6943V222.742C52 231.767 57.2777 239.958 65.4958 243.687L161.496 287.25C176.723 294.16 194 283.027 194 266.306V126.258Z"
        fill="#06D2DD"
      />
      <path
        opacity="0.78"
        d="M52 81.1133C52 71.1657 58.395 62.3455 67.8497 59.253L218.85 9.86197C233.719 4.99836 249 16.0778 249 31.7223V173.887C249 183.834 242.605 192.654 233.15 195.747L82.1504 245.138C67.2812 250.002 52 238.922 52 223.278V81.1133Z"
        fill="#9C6CFE"
      />
    </svg>
    <div class="splash-title">Split Bill</div>
  </div>
</template>

<style scoped>
.splash-screen {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.splash-logo {
  width: 120px;
  height: 120px;
  margin-bottom: 24px;
  animation: float 3s ease-in-out infinite;
}

.splash-title {
  font-size: 32px;
  font-weight: 700;
  color: white;
  animation: fadeInUp 0.8s ease-out;
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-20px);
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (prefers-color-scheme: dark) {
  .splash-screen {
    background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
  }
}
</style>
