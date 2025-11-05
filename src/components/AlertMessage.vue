<script setup lang="ts">
import { ref, onMounted } from "vue";

defineProps<{
  message: string;
}>();

const visible = ref(true);

onMounted(() => {
  setTimeout(() => {
    visible.value = false;
  }, 2000);
});
</script>

<template>
  <div class="alert alert-danger d-flex align-items-center" role="alert">
    <vue-feather class="me-2" type="alert-triangle" />
    <div>{{ message }}</div>
  </div>
</template>

<style lang="scss" scoped>
.alert {
  position: absolute;
  top: 15%;
}
</style>
