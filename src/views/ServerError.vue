<script setup lang="ts">
defineOptions({
  name: "ServerError",
});
</script>

<template>
  <div class="server-error">
    <img src="@/assets/server-error.png" />
    <h2 class="mt-3 fw-bold">伺服器錯誤</h2>
  </div>
</template>

<style lang="scss" scoped>
.server-error {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  img {
    width: 200px;
  }
}
</style>
