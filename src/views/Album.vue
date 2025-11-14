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
    <NavbarComponent :isLoggedIn="true" />
    <CssDoodleComponent :isLoggedIn="true" />
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
        <img class="w-100 h-100" :src="file.imageUrl" />
        <div class="caption">{{ file.customName }}</div>
      </SwiperSlide>
    </VueSwiper>
  </div>
  <div v-else class="m-3">
    <table class="table table-hover">
      <tbody>
        <tr
          v-for="item in albumStore.folder"
          :key="item._id"
          @click="handleFolder(item.name, item.files)"
        >
          <td class="folder d-flex align-items-center">
            <img :src="getFolderImage(item.files)" />
            <span>&ensp;{{ item.name }}</span>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style lang="scss" scoped>
table tr {
  cursor: pointer;
}

.folder {
  img {
    width: 30px;
  }
  span {
    font-size: 18px;
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
