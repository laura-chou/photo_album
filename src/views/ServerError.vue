<script setup lang="ts">
import { onMounted } from "vue";
import { useRouter } from "vue-router";

defineOptions({
  name: "ServerError",
});

const router = useRouter();

onMounted(() => {
  setTimeout(() => {
    router.push("/logout");
  }, 5000);
});
</script>

<template>
  <div class="server-error">
    <img src="@/assets/server-error.png" />
    <h2 class="mt-3 fw-bold">伺服器錯誤</h2>
    <h2 class="fw-bold">請稍後再試</h2>
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
