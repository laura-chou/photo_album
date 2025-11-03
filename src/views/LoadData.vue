<script setup lang="ts">
import { onMounted } from 'vue'
import { useStore } from '@/stores'
import { useRouter } from 'vue-router'
const router = useRouter()
const store = useStore()

onMounted(async () => {
  try {
    await store.handleLoading()
    router.push('/login')
  } catch (error) {
    console.log(`handleClick failed:${error}`)
    router.push('/not-found')
  }
})
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
