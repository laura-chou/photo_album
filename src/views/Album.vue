<script setup lang="ts">
import { ref, onMounted } from "vue";
import { Pagination } from "swiper/modules";
import { useAlbumStore } from "@/stores/album";
import folderImage from "@/assets/folder.png";
import emptyfolderImage from "@/assets/empty-folder.png";
import type { FileItem } from "@/types/album";
import { useFolderProcess } from "@/composables/useFolderProcess";

defineOptions({
  name: "AlbumPage",
});

const albumStore = useAlbumStore();
const { processFolders } = useFolderProcess();
const swiperModules = [Pagination];

const folderFiles = ref<FileItem[] | null>(null);
const folderName = ref("");

onMounted(async () => {
  const formattedFolders = await processFolders(albumStore.folder);
  albumStore.setFolderList(formattedFolders);
});

const previous = () => {
  folderName.value = "";
  folderFiles.value = null;
};

const getFolderImage = (files: FileItem[]) => {
  return files && files.length > 0 ? folderImage : emptyfolderImage;
};

const handleFolder = (name: string, files: FileItem[]) => {
  folderName.value = name;
  folderFiles.value = files;
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
          <li v-if="folderName" class="breadcrumb-item active">
            {{ folderName }}
          </li>
        </ol>
      </div>
    </nav>
  </div>

  <div v-if="folderFiles" class="h-100">
    <VueSwiper
      class="swiper"
      :pagination="{
        dynamicBullets: true,
      }"
      :modules="swiperModules"
    >
      <SwiperSlide class="text-center" v-for="file in folderFiles" :key="file._id">
        <img class="w-100 h-100" :src="file.storeName" />
        <div class="caption">{{ file.customName }}</div>
      </SwiperSlide>
    </VueSwiper>
  </div>
  <div v-else class="m-3">
    <div class="row">
      <div class="folder col-6 col-sm-3 col-lg-2" v-for="item in albumStore.folder" :key="item._id">
        <button
          type="button"
          class="btn btn-outline-secondary"
          @click="handleFolder(item.name, item.files)"
        >
          <img :src="getFolderImage(item.files)" />
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
