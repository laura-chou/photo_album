import { reactive } from "vue";

interface AlertItem {
  id: number;
  message: string;
  type: "success" | "error";
}

export const useAlert = () => {
  const alerts = reactive<AlertItem[]>([]);
  let nextId = 1;

  const triggerAlert = (message: string, type: "success" | "error" = "error", duration = 1000) => {
    const id = nextId++;
    alerts.push({ id, message, type });

    setTimeout(() => {
      const index = alerts.findIndex((a) => a.id === id);
      if (index !== -1) alerts.splice(index, 1);
    }, duration);
  };

  return {
    alerts,
    triggerAlert,
  };
};
