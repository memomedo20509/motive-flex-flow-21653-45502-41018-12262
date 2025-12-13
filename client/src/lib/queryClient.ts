import { QueryClient } from "@tanstack/react-query";

async function handleResponse(response: Response) {
  if (!response.ok) {
    let errorMessage = `HTTP error! status: ${response.status}`;
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorMessage;
    } catch (e) {
      // If response is not JSON, use default error message
    }
    throw new Error(errorMessage);
  }
  return response.json();
}

export async function apiRequest(
  url: string,
  options?: RequestInit
): Promise<any> {
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });
  return handleResponse(response);
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: async ({ queryKey }) => {
        let url = queryKey[0] as string;
        if (queryKey.length > 1 && typeof queryKey[1] === "object" && queryKey[1] !== null) {
          const params = new URLSearchParams();
          for (const [key, value] of Object.entries(queryKey[1] as Record<string, unknown>)) {
            if (value !== undefined && value !== null && value !== "") {
              params.append(key, String(value));
            }
          }
          const paramString = params.toString();
          if (paramString) {
            url += `?${paramString}`;
          }
        }
        const response = await fetch(url);
        return handleResponse(response);
      },
      staleTime: 1000 * 60 * 5,
      retry: false,
    },
  },
});
