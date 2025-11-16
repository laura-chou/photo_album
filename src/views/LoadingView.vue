<script setup lang="ts">
import { onMounted } from "vue";
import { useRouter } from "vue-router";

import { useAlert } from "@/composables/useAlert";
import { useErrorRedirect } from "@/composables/useErrorRedirect";
import { useErrorStore } from "@/stores/error-store";
import { useUserStore } from "@/stores/user-store";

const { handleError } = useErrorRedirect();
const { alerts, triggerAlert } = useAlert();
const router = useRouter();
const userStore = useUserStore();
const errorStore = useErrorStore();

onMounted(async () => {
  try {
    await userStore.loading();
    router.push("/login");
  } catch (error) {
    handleError(error, "loading");
    if (errorStore.message !== "") {
      triggerAlert(errorStore.message);
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
