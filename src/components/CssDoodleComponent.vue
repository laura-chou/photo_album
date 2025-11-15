<script setup lang="ts">
const props = withDefaults(defineProps<{ isLoggedIn?: boolean }>(), { isLoggedIn: false });
</script>

<template>
  <css-doodle v-if="!props.isLoggedIn">
    :doodle { @grid: 1x150 / 100vw 100vh; background: radial-gradient(circle at 50% 30%, #0a1f44,
    #000814); overflow: hidden; } @place-cell: center; @size: @rand(1px, 2px); border-radius: 50%;
    background: white; opacity: @rand(0.05, 0.15); transform: translate( @rand(-50vw, 50vw),
    @rand(-50vh, 50vh) ) scale(@rand(0.8, 1.2)); animation: twinkle @rand(4s, 10s) ease-in-out
    infinite; @keyframes twinkle { 0%, 100% { opacity: @rand(0.05, 0.15); } 50% { opacity:
    @rand(0.2, 0.4); } }
  </css-doodle>
  <css-doodle v-else>
    :doodle { @grid: 10x6 / 100vmax / #d8dde5; overflow: hidden; } @shape: circle; @size: @r(0.4em,
    1em); background: hsla(@r(0, 360), @r(30%, 60%), @r(75%, 90%), @r(.4, .8)); transform:
    translate(@r(-60px, 60px), @r(-60px, 60px)) scale(@r(.5, 1.2)); opacity: @r(.5, 1); animation:
    float @r(4s, 10s) ease-in-out infinite alternate; @keyframes float { 0% { transform:
    translate(@r(-60px, 60px), @r(-60px, 60px)) rotate(0deg); } 100% { transform:
    translate(@r(-60px, 60px), @r(-60px, 60px)) rotate(360deg); } }
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
