<script setup lang="ts">
import { ref, watch } from "vue";
import { useRouter } from "vue-router";
import { useAlbumStore } from "@/stores/album";

defineOptions({
  name: "SettingPage",
});

export interface FolderItem {
  _id: string;
  name: string;
  isEditing?: boolean;
  tempName?: string;
}

const router = useRouter();
const albumStore = useAlbumStore();
const folders = ref<FolderItem[]>([]);
const createFolderName = ref("");

watch(
  () => albumStore.folder,
  (newVal) => {
    folders.value = newVal.map((f) => ({
      ...f,
      isEditing: false,
      tempName: "",
    }));
  },
  { immediate: true, deep: true }
);

const goToDetail = (id: string) => {
  router.push(`/edit/${id}`);
};

const deleteFolder = (folderId: string) => {
  if (confirm("確定要刪除嗎?")) {
    albumStore.deleteFolder(folderId);
  }
};

const startEdit = (item: FolderItem) => {
  item.isEditing = true;
  item.tempName = item.name;
};

const saveEdit = (item: FolderItem) => {
  if (!item.isEditing) return;
  if (!item.tempName?.trim()) {
    alert("請輸入名稱");
    return;
  }
  item.name = item.tempName;

  albumStore.updateFolderName(item._id, item.name);

  item.isEditing = false;
};

const cancelEdit = (item: FolderItem) => {
  item.isEditing = false;
  item.tempName = item.name;
};

const createFolder = () => {
  if (!createFolderName.value.trim()) {
    alert("請輸入名稱");
    return;
  }
  albumStore.createFolder(createFolderName.value);
  createFolderName.value = "";
};
</script>

<template>
  <div>
    <PhotoNavbar :isLoggedIn="true" />
    <CssDoodle :isLoggedIn="true" />
  </div>
  <div class="container mt-3">
    <div class="text-end">
      <button
        type="button"
        class="btn btn-primary btn-td mb-3"
        data-bs-toggle="modal"
        data-bs-target="#folderModal"
      >
        <VueFeather type="folder-plus"></VueFeather>
      </button>
      <div
        class="modal fade"
        id="folderModal"
        data-bs-backdrop="static"
        data-bs-keyboard="false"
        tabindex="-1"
        aria-hidden="true"
      >
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content">
            <div class="modal-body">
              <button
                type="button"
                class="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
              <input
                class="form-control mt-3 mb-3"
                placeholder="請輸入資料夾名稱"
                v-model="createFolderName"
              />
              <button type="button" class="btn btn-success btn-td" @click="createFolder">
                <VueFeather type="save"></VueFeather>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    <table class="table table-hover text-center align-middle">
      <thead>
        <tr class="table-info">
          <th>資料夾</th>
          <th>編輯</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in folders" :key="item._id">
          <td>
            <template v-if="item.isEditing">
              <input class="form-control" v-model="item.tempName" />
            </template>
            <template v-else>
              {{ item.name }}
            </template>
          </td>
          <td>
            <template v-if="item.isEditing">
              <button type="button" class="btn btn-primary btn-td" @click="saveEdit(item)">
                <VueFeather type="check"></VueFeather>
              </button>
              <button type="button" class="btn btn-danger btn-td" @click="cancelEdit(item)">
                <VueFeather type="x"></VueFeather>
              </button>
            </template>
            <template v-else>
              <button type="button" class="btn btn-primary btn-td" @click="goToDetail(item._id)">
                <VueFeather type="file"></VueFeather>
              </button>
              <button type="button" class="btn btn-success btn-td" @click="startEdit(item)">
                <VueFeather type="edit"></VueFeather>
              </button>
              <button type="button" class="btn btn-danger btn-td" @click="deleteFolder(item._id)">
                <VueFeather type="trash-2"></VueFeather>
              </button>
            </template>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style lang="scss" scoped>
.table-info th {
  &:nth-child(1) {
    width: 45%;
  }
  &:nth-child(2) {
    width: 55%;
  }
}
</style>
