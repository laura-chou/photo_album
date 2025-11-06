import { useRouter } from "vue-router";

export const useErrorRedirect = () => {
  const router = useRouter();

  const handleError = (error: unknown, context?: string, status?: number) => {
    const source = context ?? "UnknownFunction";

    if (status) {
      console.error(`${source} failed with status: ${status}`);
    } else {
      console.error(`${source} unknown error:\n`, String(error));
    }

    setTimeout(() => {
      router.push("/error");
    }, 100);
  };

  return { handleError };
};
