<script setup lang="ts">
import { onMounted } from "vue";
import { useRouter } from "vue-router";

import { useUserStore } from "@/stores/user-store";

const router = useRouter();
const userSore = useUserStore();

onMounted(async () => {
  try {
    await userSore.logout();
  } finally {
    setTimeout(() => {
      router.push("/");
    }, 1000);
  }
});
</script>

<template>
  <LoadingComponent />
</template>
