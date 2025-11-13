<script setup lang="ts">
import { onMounted } from "vue";
import { useRouter } from "vue-router";
import { useUserStore } from "@/stores/user";
import { useErrorRedirect } from "@/composables/useErrorRedirect";

defineOptions({
  name: "LogoutPage",
});

const { handleError } = useErrorRedirect();
const router = useRouter();
const userSore = useUserStore();

onMounted(async () => {
  try {
    await userSore.logout();
    setTimeout(() => {
      router.push("/");
    }, 1000);
  } catch (error) {
    handleError(error, "logout");
  }
});
</script>

<template>
  <div class="loading">
    <img src="@/assets/loading.svg" />
  </div>
</template>

<style lang="scss" scoped>
.loading {
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
