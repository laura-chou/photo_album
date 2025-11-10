<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import { useRouter } from "vue-router";
import { useAlbumStore } from "@/stores/album";
interface FileItem {
  _id: string;
  customName: string;
  storeName: string;
}
const route = useRoute();
const router = useRouter();
const alnumStore = useAlbumStore();
const selectedFolder = ref<FileItem[] | null>(null);

onMounted(async () => {
  const id = route.params.id;
  const folder = alnumStore.folder.find((item) => item._id === id);
  selectedFolder.value = folder ? folder.files : [];
});

const handleEdit = (id: string) => {
  console.log(id);
};

const previous = () => {
  router.push(`/setting`);
};
</script>

<template>
  <PhotoNavbar :isLoggedIn="true" />
  <CssDoodle :isLoggedIn="true" />
  <div class="container mt-3">
    <button
      type="button"
      class="btn btn-secondary d-flex align-items-center mb-3"
      @click="previous"
    >
      <VueFeather type="arrow-left"></VueFeather>返回
    </button>
    <table class="table table-hover text-center align-middle">
      <thead>
        <tr class="table-info">
          <th>檔案名稱</th>
          <th>編輯</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in selectedFolder" :key="item._id">
          <td>{{ item.customName }}</td>
          <td>
            <button type="button" class="btn btn-success btn-td" @click="handleEdit(item._id)">
              <VueFeather type="edit"></VueFeather>
            </button>
            <button type="button" class="btn btn-danger btn-td">
              <VueFeather type="trash-2"></VueFeather>
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style lang="scss" scoped>
.btn {
  line-height: 14px;
  margin: 0 5px;
}
</style>
