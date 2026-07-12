import { trpc } from "@/lib/trpc";
import { TRPCClientError } from "@trpc/client";
import { useCallback, useEffect, useMemo } from "react";
import { useLocation } from "wouter";

type UseAuthOptions = {
  redirectOnUnauthenticated?: boolean;
};

export function useAuth(options?: UseAuthOptions) {
  const { redirectOnUnauthenticated = false } = options ?? {};
  const [location, navigate] = useLocation();
  const utils = trpc.useUtils();

  const meQuery = trpc.auth.me.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
  });

  // Redirect unauthenticated users once the query has settled
  useEffect(() => {
    if (
      redirectOnUnauthenticated &&
      !meQuery.isLoading &&
      !meQuery.data &&
      location !== "/login"
    ) {
      navigate("/login");
    }
  }, [
    redirectOnUnauthenticated,
    meQuery.isLoading,
    meQuery.data,
    location,
    navigate,
  ]);

  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => {
      utils.auth.me.setData(undefined, null);
      navigate("/login");
    },
  });

  const logout = useCallback(async () => {
    try {
      await logoutMutation.mutateAsync();
    } catch (error: unknown) {
      // Even on error, clear the local cache and redirect
      utils.auth.me.setData(undefined, null);
      if (
        error instanceof TRPCClientError &&
        error.data?.code === "UNAUTHORIZED"
      ) {
        navigate("/login");
        return;
      }
      navigate("/login");
    }
  }, [logoutMutation, navigate, utils]);

  const state = useMemo(() => {
    return {
      user: meQuery.data ?? null,
      // Granular flags — consumers can choose which one to watch.
      // `loading` (legacy) = only true while the initial auth check is in-flight,
      // NOT during logout, so route guards don't show a full-page spinner on sign-out.
      loading: meQuery.isLoading,
      isLoggingOut: logoutMutation.isPending,
      error: meQuery.error ?? logoutMutation.error ?? null,
      isAuthenticated: Boolean(meQuery.data),
    };
  }, [
    meQuery.data,
    meQuery.error,
    meQuery.isLoading,
    logoutMutation.error,
    logoutMutation.isPending,
  ]);

  return {
    ...state,
    refresh: () => meQuery.refetch(),
    logout,
  };
}
