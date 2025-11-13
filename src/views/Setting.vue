<script setup lang="ts">
import { ref, watch } from "vue";
import { useRouter } from "vue-router";
import { Modal } from "bootstrap";
import { useAlbumStore } from "@/stores/album";
import { useErrorRedirect } from "@/composables/useErrorRedirect";
import { useAlert } from "@/composables/useAlert";

defineOptions({
  name: "SettingPage",
});

interface EditableFolder {
  _id: string;
  name: string;
  fileCount: number;
  isEditing?: boolean;
  tempName?: string;
}

const router = useRouter();
const albumStore = useAlbumStore();
const { handleError } = useErrorRedirect();
const { alerts, triggerAlert } = useAlert();
const folders = ref<EditableFolder[]>([]);
const createFolderName = ref("");

watch(
  () => albumStore.folder,
  (newVal) => {
    folders.value = newVal.map((folder) => ({
      ...folder,
      fileCount: folder.files.length,
      isEditing: false,
      tempName: "",
    }));
  },
  { immediate: true, deep: true }
);

const goToDetail = (id: string) => {
  router.push(`/edit/${id}`);
};

const deleteFolder = async (folderId: string) => {
  if (confirm("確定要刪除嗎?")) {
    try {
      await albumStore.deleteFolder(folderId);
    } catch (error) {
      handleError(error, "saveEdit");
    }
  }
};

const startEdit = (item: EditableFolder) => {
  item.isEditing = true;
  item.tempName = item.name;
};

const saveEdit = async (item: EditableFolder) => {
  if (!item.isEditing) return;
  if (!item.tempName?.trim()) {
    triggerAlert("請輸入名稱");
    return;
  }

  try {
    await albumStore.updateFolderName(item._id, item.tempName);
    item.isEditing = false;
  } catch (error) {
    handleError(error, "saveEdit");
  }
};

const cancelEdit = (item: EditableFolder) => {
  item.isEditing = false;
};

const createFolder = async () => {
  if (!createFolderName.value.trim()) {
    alert("請輸入名稱");
    return;
  }

  try {
    await albumStore.createFolder(createFolderName.value);
    createFolderName.value = "";
    closeModal();
  } catch (error) {
    handleError(error, "createFolder");
  }
};

const closeModal = () => {
  const modalEl = document.getElementById("folderModal");
  if (!modalEl) return;
  if (document.activeElement instanceof HTMLElement) {
    document.activeElement.blur();
  }
  const modalInstance = Modal.getInstance(modalEl) || new Modal(modalEl);
  modalInstance.hide();
};
</script>

<template>
  <div>
    <PhotoNavbar :isLoggedIn="true" />
    <CssDoodle :isLoggedIn="true" />
  </div>
  <div class="container mt-3">
    <AlertMessage
      v-for="alert in alerts"
      :key="alert.id"
      :message="alert.message"
      :type="alert.type"
    />
    <div>
      <div v-if="albumStore.isFolderLimitExceeded" class="alert alert-danger text-center">
        已達新增上限 (最多 5 個資料夾)
      </div>
      <button
        v-else
        type="button"
        class="btn btn-primary btn-custom mb-3"
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
                aria-label="Close"
                @click="closeModal"
              ></button>
              <input
                class="form-control mt-3 mb-3"
                placeholder="請輸入資料夾名稱"
                v-model="createFolderName"
              />
              <button type="button" class="btn btn-primary btn-custom" @click="createFolder">
                <VueFeather type="check"></VueFeather>
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
              <button type="button" class="btn btn-success btn-custom" @click="saveEdit(item)">
                <VueFeather type="save"></VueFeather>
              </button>
              <button type="button" class="btn btn-danger btn-custom" @click="cancelEdit(item)">
                <VueFeather type="x"></VueFeather>
              </button>
            </template>
            <template v-else>
              <button
                type="button"
                class="btn btn-primary btn-custom position-relative"
                @click="goToDetail(item._id)"
              >
                <VueFeather type="file"></VueFeather>
                <span
                  class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
                >
                  {{ item.fileCount }}
                </span>
              </button>
              <button type="button" class="btn btn-success btn-custom" @click="startEdit(item)">
                <VueFeather type="edit"></VueFeather>
              </button>
              <button
                type="button"
                class="btn btn-danger btn-custom"
                @click="deleteFolder(item._id)"
              >
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

.alert-custom {
  top: 75% !important;
  left: 50%;
  transform: translate(-60%, -50%);
}
</style>
