<script setup lang="ts">
import axios from "axios";
import { onMounted } from "vue";
import { useUserStore } from "@/stores/user";
import { useRouter } from "vue-router";
import { useAlert } from "@/composables/useAlert";
import { useErrorRedirect } from "@/composables/useErrorRedirect";
const { handleError } = useErrorRedirect();
const { alerts, triggerAlert } = useAlert();
const router = useRouter();
const userStore = useUserStore();

onMounted(async () => {
  try {
    await userStore.loading();
    router.push("/login");
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      switch (status) {
        case 429:
          triggerAlert("請求過多，請稍後再試");
          setTimeout(() => {
            router.push("/login");
          }, 2000);
          break;
        default:
          handleError(error, "loading");
      }
    } else {
      handleError(error, "loading");
    }
  }
});
</script>

<template>
  <AlertComponent
    v-for="alert in alerts"
    :key="alert.id"
    :message="alert.message"
    :type="alert.type"
  />
  <LoadingComponent />
</template>
