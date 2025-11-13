<script setup lang="ts">
import axios from "axios";
import { ref, watch } from "vue";
import { useRoute } from "vue-router";
import { useRouter } from "vue-router";
import { useAlbumStore } from "@/stores/album";
import { useErrorRedirect } from "@/composables/useErrorRedirect";
import { useAlert } from "@/composables/useAlert";

interface EditableFile {
  _id: string;
  customName: string;
  isEditing?: boolean;
  tempName?: string;
}

const route = useRoute();
const router = useRouter();
const albumStore = useAlbumStore();
const { handleError } = useErrorRedirect();
const { alerts, triggerAlert } = useAlert();

const processedFiles = ref<EditableFile[] | null>(null);
const fileInput = ref<HTMLInputElement | null>(null);

const id = route.params.id as string;
const files = albumStore.getFilsByFolderId(id);

watch(
  () => files.value,
  (newVal) => {
    if (!newVal) return;
    processedFiles.value = newVal.map((file) => ({
      ...file,
      isEditing: false,
      tempName: "",
    }));
  },
  { immediate: true, deep: true }
);

const previous = () => {
  router.push(`/setting`);
};

const openFilePicker = () => {
  fileInput.value?.click();
};

const handleFileUpload = async (event: Event) => {
  const input = event.target as HTMLInputElement;
  const files = Array.from(input?.files || []);
  if (files.length === 0) return;
  try {
    await albumStore.uploadFiles(id, files);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      switch (status) {
        case 400:
          triggerAlert("已達上傳上限 (最多 5 個檔案)", "error", 1500);
          break;
        case 413:
          triggerAlert("檔案太大，單檔不得超過 1MB", "error", 1500);
          break;
        default:
          handleError(error, "handleFileUpload", status);
      }
    } else {
      handleError(error, "handleFileUpload");
    }
  } finally {
    input.value = "";
  }
};

const startEdit = (item: EditableFile) => {
  item.isEditing = true;
  item.tempName = item.customName;
};

const saveEdit = async (item: EditableFile) => {
  if (!item.isEditing) return;
  if (!item.tempName?.trim()) {
    triggerAlert("請輸入名稱");
    return;
  }

  try {
    await albumStore.updateFileName(item._id, item.tempName);
    item.isEditing = false;
  } catch (error) {
    handleError(error, "saveEdit");
  }
};

const cancelEdit = (item: EditableFile) => {
  item.isEditing = false;
};

const deleteFile = async (fileId: string) => {
  if (confirm("確定要刪除嗎?")) {
    try {
      await albumStore.deleteFile(fileId);
    } catch (error) {
      handleError(error, "deleteFile");
    }
  }
};
</script>

<template>
  <PhotoNavbar :isLoggedIn="true" />
  <CssDoodle :isLoggedIn="true" />
  <div class="container mt-3">
    <AlertMessage
      v-for="alert in alerts"
      :key="alert.id"
      :message="alert.message"
      :type="alert.type"
    />
    <div class="d-flex align-items-center justify-content-between mb-3">
      <button
        type="button"
        class="btn btn-secondary btn-custom d-flex align-items-center"
        @click="previous"
      >
        <VueFeather type="arrow-left"></VueFeather>返回
      </button>
      <div v-if="albumStore.isUploading" class="progress">
        <div
          class="progress-bar progress-bar-striped progress-bar-animated"
          role="progressbar"
          :aria-valuenow="albumStore.uploadProgress"
          aria-valuemin="0"
          aria-valuemax="100"
        >
          <span class="fw-bold fs-6">&ensp;{{ albumStore.uploadProgress }} %</span>
        </div>
      </div>
      <div
        v-else-if="albumStore.isFilesLimitExceeded(id)"
        class="alert alert-danger text-center alert-limit"
      >
        已達上傳上限 (最多 5 個檔案)
      </div>
      <button
        v-else-if="!albumStore.isUploading || !albumStore.isFilesLimitExceeded(id)"
        type="button"
        class="btn btn-primary btn-custom"
        @click="openFilePicker"
      >
        <VueFeather type="upload"></VueFeather>
      </button>
      <input
        class="d-none"
        ref="fileInput"
        type="file"
        accept="image/*"
        @change="handleFileUpload"
        multiple
      />
    </div>

    <table class="table table-hover text-center align-middle">
      <thead>
        <tr class="table-info">
          <th>檔案名稱</th>
          <th>編輯</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in processedFiles" :key="item._id">
          <td>
            <template v-if="item.isEditing">
              <input class="form-control" v-model="item.tempName" />
            </template>
            <template v-else>
              {{ item.customName }}
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
              <button type="button" class="btn btn-success btn-custom" @click="startEdit(item)">
                <VueFeather type="edit"></VueFeather>
              </button>
              <button type="button" class="btn btn-danger btn-custom" @click="deleteFile(item._id)">
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
.alert-limit {
  line-height: 10px;
  margin: 0 5px;
  width: 70%;
}

.alert-custom {
  top: 75% !important;
  left: 50%;
  transform: translate(-60%, -50%);
}

.table-info th {
  &:nth-child(1) {
    width: 45%;
  }
  &:nth-child(2) {
    width: 55%;
  }
}

.progress {
  width: 250px;
  height: 20px;
}
</style>
