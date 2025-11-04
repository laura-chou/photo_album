<script setup lang="ts"></script>

<template>
  <css-doodle>
    :doodle { @grid: 1x150 / 100vw 100vh; background: radial-gradient(circle at 50% 30%, #0a1f44,
    #000814); overflow: hidden; } @place-cell: center; @size: @rand(1px, 2px); border-radius: 50%;
    background: white; opacity: @rand(0.05, 0.15); transform: translate( @rand(-50vw, 50vw),
    @rand(-50vh, 50vh) ) scale(@rand(0.8, 1.2)); animation: twinkle @rand(4s, 10s) ease-in-out
    infinite; @keyframes twinkle { 0%, 100% { opacity: @rand(0.05, 0.15); } 50% { opacity:
    @rand(0.2, 0.4); } }
  </css-doodle>
</template>

<style lang="scss" scoped>
css-doodle {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  z-index: -1;
}
</style>
