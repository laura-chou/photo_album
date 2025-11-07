<script setup lang="ts">
defineOptions({
  name: "AlbumPage",
});
</script>

<template>
  <PhotoNavbar :isLoggedIn="true" />
  <CssDoodle :isLoggedIn="true" />
  <nav class="navbar navbar-light bg-light">
    <div class="d-flex align-items-center">
      <ol class="breadcrumb m-0 ms-4">
        <li class="breadcrumb-item active" aria-current="page">資料夾</li>
      </ol>
      <div class="ms-5">
        <button type="button" class="btn btn-primary">
          <vue-feather type="folder-plus"></vue-feather>
        </button>
        <button type="button" class="btn btn-danger">
          <vue-feather type="folder-minus"></vue-feather>
        </button>
      </div>
    </div>
  </nav>
</template>

<style lang="scss" scoped>
.btn {
  line-height: 17px;
  margin: 0 5px;
}
</style>
