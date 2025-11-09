<script setup lang="ts">
import { ref } from "vue";
import { Pagination } from "swiper/modules";
import { useStore } from "@/stores";
import fileImage from "@/assets/file.png";
import emptyFileImage from "@/assets/empty_file.png";

defineOptions({
  name: "AlbumPage",
});

interface FileItem {
  _id: string;
  customName: string;
  storeName: string;
}

const store = useStore();
const selectedFolder = ref<FileItem[] | null>(null);
const breadcrumbName = ref("");
const swiperModules = [Pagination];

const previous = () => {
  breadcrumbName.value = "";
  selectedFolder.value = null;
};

const getFileImage = (files: FileItem[]) => {
  return files && files.length > 0 ? fileImage : emptyFileImage;
};

const handleFolder = (folderName: string, files: FileItem[]) => {
  breadcrumbName.value = folderName;
  selectedFolder.value = files;
};
</script>

<template>
  <div style="height: 97px">
    <PhotoNavbar :isLoggedIn="true" />
    <CssDoodle :isLoggedIn="true" />
    <nav class="navbar navbar-light bg-light">
      <div class="d-flex align-items-center">
        <ol class="breadcrumb m-0 ms-4">
          <li class="breadcrumb-item"><a href="javascript:void(0)" @click="previous">資料夾</a></li>
          <li v-if="breadcrumbName" class="breadcrumb-item active">
            {{ breadcrumbName }}
          </li>
        </ol>
      </div>
    </nav>
  </div>

  <div v-if="selectedFolder" class="h-100">
    <VueSwiper
      class="swiper"
      :pagination="{
        dynamicBullets: true,
      }"
      :modules="swiperModules"
    >
      <SwiperSlide class="text-center" v-for="file in selectedFolder" :key="file._id">
        <img class="w-100 h-100" :src="file.storeName" />
        <div class="caption">{{ file.customName }}</div>
      </SwiperSlide>
    </VueSwiper>
  </div>
  <div v-else class="m-3">
    <div class="row">
      <div class="col-2 folder" v-for="item in store.folder" :key="item._id">
        <button
          type="button"
          class="btn btn-outline-secondary"
          @click="handleFolder(item.name, item.files)"
        >
          <img :src="getFileImage(item.files)" />
          <div class="file-name">
            <span>{{ item.name }}</span>
          </div>
        </button>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.btn {
  line-height: 17px;
  margin: 0 5px;
}

.folder {
  text-align: center;
  img {
    width: 100px;
  }
  .file-name {
    font-size: 20px;
    margin-top: 10px;
    font-weight: bold;
    color: #3c3c3c;
  }
}

.swiper {
  height: calc(100% - 97px);
}

.caption {
  position: absolute;
  top: 0;
  left: 0;
  background: rgba(0, 0, 0, 0.5);
  color: #fff;
  padding: 6px 12px;
  border-radius: 0 6px 6px 0;
  font-size: 1.2rem;
}
</style>
