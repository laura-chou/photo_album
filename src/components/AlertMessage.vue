<script setup lang="ts">
import { ref, onMounted, computed } from "vue";

const props = defineProps<{
  message: string;
  type?: "success" | "error";
}>();

const visible = ref(true);

onMounted(() => {
  setTimeout(() => {
    visible.value = false;
  }, 2000);
});

const alertClass = computed(() => {
  switch (props.type) {
    case "success":
      return "alert alert-success alert-custom d-flex align-items-center";
    case "error":
    default:
      return "alert alert-danger alert-custom d-flex align-items-center";
  }
});

const iconType = computed(() => {
  switch (props.type) {
    case "success":
      return "check-circle";
    default:
      return "alert-triangle";
  }
});
</script>

<template>
  <div :class="alertClass" role="alert">
    <vue-feather class="me-2" :type="iconType" />
    <div>{{ message }}</div>
  </div>
</template>

<style lang="scss" scoped>
.alert-custom {
  position: absolute;
  top: 15%;
}
</style>
