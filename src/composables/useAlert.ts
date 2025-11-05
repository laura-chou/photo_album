import { ref } from "vue";

export function useAlert() {
  const alertMessage = ref("");
  const showAlert = ref(false);

  function triggerAlert(message: string, duration = 2000) {
    alertMessage.value = message;
    showAlert.value = true;
    setTimeout(() => {
      showAlert.value = false;
    }, duration);
  }

  return {
    alertMessage,
    showAlert,
    triggerAlert,
  };
}
