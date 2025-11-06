<script setup lang="ts">
import axios from "axios";
import { onMounted } from "vue";
import { useStore } from "@/stores";
import { useRouter } from "vue-router";
import { useAlert } from "@/composables/useAlert";
import { useErrorRedirect } from "@/composables/useErrorRedirect";
const { handleError } = useErrorRedirect();
const { alerts, triggerAlert } = useAlert();
const router = useRouter();
const store = useStore();

onMounted(async () => {
  try {
    await store.handleLoading();
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
          handleError(error, "handleLoading", status);
      }
    } else {
      handleError(error, "handleLoading");
    }
  }
});
</script>

<template>
  <div class="loading">
    <AlertMessage
      v-for="alert in alerts"
      :key="alert.id"
      :message="alert.message"
      :type="alert.type"
    />
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
