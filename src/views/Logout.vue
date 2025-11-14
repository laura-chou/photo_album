<script setup lang="ts">
import { onMounted } from "vue";
import { useRouter } from "vue-router";
import { useUserStore } from "@/stores/user";
import { useErrorStore } from "@/stores/error";
import { useAlert } from "@/composables/useAlert";
import { useErrorRedirect } from "@/composables/useErrorRedirect";

defineOptions({
  name: "LogoutPage",
});

const { alerts, triggerAlert } = useAlert();
const { handleError } = useErrorRedirect();
const router = useRouter();
const userSore = useUserStore();
const errorStore = useErrorStore();

onMounted(async () => {
  try {
    await userSore.logout();
    setTimeout(() => {
      router.push("./");
    }, 1000);
  } catch (error) {
    handleError(error, "logout");
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

<style lang="scss" scoped>
.alert-custom {
  width: max-content;
  top: 20%;
  left: 50%;
  transform: translate(-50%, -20%);
}
</style>
