import {
  MutationCache,
  QueryClient,
  QueryClientProvider,
  type QueryClientConfig,
} from "@tanstack/react-query";
import { type ReactNode, useEffect, useRef, useState } from "react";

export const DEFAULT_SYSTEM_ERROR_MESSAGE =
  "System error, please contact technical support";

type NotifySystemError = (message: string, error: unknown) => void;

export interface CreateAppQueryClientOptions {
  config?: Omit<QueryClientConfig, "mutationCache">;
  getSystemErrorMessage?: () => string;
  notifySystemError?: NotifySystemError;
}

export interface AppQueryProviderProps extends CreateAppQueryClientOptions {
  children: ReactNode;
  client?: QueryClient;
  systemErrorMessage?: string;
}

export const normalizeMutationServerError = (
  error: any,
  message = DEFAULT_SYSTEM_ERROR_MESSAGE,
) => {
  const status = error?.response?.status || error?.status;
  if (status !== 500) return false;

  error.message = message;

  if (error.response) {
    const data = error.response.data;
    if (data && typeof data === "object") {
      error.response.data = {
        ...data,
        title: message,
        message,
      };
    } else {
      error.response.data = {
        title: message,
        message,
        status: 500,
      };
    }
  }

  return true;
};

const defaultNotifySystemError: NotifySystemError = () => {};

const buildDefaultOptions = (
  defaultOptions: QueryClientConfig["defaultOptions"],
) => ({
  ...defaultOptions,
  queries: {
    refetchOnWindowFocus: false,
    retry: 1,
    staleTime: 5 * 60 * 1000,
    ...defaultOptions?.queries,
  },
});

export const createAppQueryClient = ({
  config,
  getSystemErrorMessage = () => DEFAULT_SYSTEM_ERROR_MESSAGE,
  notifySystemError = defaultNotifySystemError,
}: CreateAppQueryClientOptions = {}) =>
  new QueryClient({
    ...config,
    mutationCache: new MutationCache({
      onError: (error, _variables, _context, mutation) => {
        const message = getSystemErrorMessage();
        const isServerError = normalizeMutationServerError(error, message);
        if (isServerError && !mutation.options.onError) {
          notifySystemError(message, error);
        }
      },
    }),
    defaultOptions: buildDefaultOptions(config?.defaultOptions),
  });

export const AppQueryProvider = ({
  children,
  client,
  config,
  systemErrorMessage = DEFAULT_SYSTEM_ERROR_MESSAGE,
  notifySystemError,
}: AppQueryProviderProps) => {
  const systemErrorMessageRef = useRef(systemErrorMessage);
  systemErrorMessageRef.current = systemErrorMessage;

  const [queryClient] = useState(
    () =>
      client ??
      createAppQueryClient({
        config,
        getSystemErrorMessage: () => systemErrorMessageRef.current,
        notifySystemError,
      }),
  );

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleLanguageChange = () => {
      queryClient.invalidateQueries({ refetchType: "active" });
    };

    window.addEventListener("app-language-change", handleLanguageChange);
    return () => {
      window.removeEventListener("app-language-change", handleLanguageChange);
    };
  }, [queryClient]);

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};
