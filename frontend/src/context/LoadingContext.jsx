import { createContext, useContext, useState, useCallback, useMemo } from "react";

const LoadingContext = createContext(null);

export function LoadingProvider({ children }) {
  const [tasks, setTasks] = useState(new Set());

  const startLoading = useCallback((taskKey = "general") => {
    setTasks((prev) => {
      const next = new Set(prev);
      next.add(taskKey);
      return next;
    });
  }, []);

  const stopLoading = useCallback((taskKey = "general") => {
    setTasks((prev) => {
      const next = new Set(prev);
      next.delete(taskKey);
      return next;
    });
  }, []);

  const isLoading = tasks.size > 0;

  const value = useMemo(
    () => ({
      isLoading,
      startLoading,
      stopLoading,
    }),
    [isLoading, startLoading, stopLoading]
  );

  return (
    <LoadingContext.Provider value={value}>
      {/* Background Top Progress Line for Rovado Loader Context */}
      {isLoading && (
        <div className="fixed top-0 left-0 right-0 z-50 pointer-events-none">
          <div className="h-1 w-full bg-green-100 overflow-hidden">
            <div className="h-full bg-green-600 animate-[pulse_1s_infinite] w-full" />
          </div>
          <div className="mx-auto mt-2 w-fit rounded-full bg-white/95 px-3 py-1 text-[11px] font-semibold text-green-700 shadow-md ring-1 ring-black/5 backdrop-blur-sm flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-green-600 animate-ping" />
            <span>Rovado • Loading...</span>
          </div>
        </div>
      )}
      {children}
    </LoadingContext.Provider>
  );
}

export const useLoading = () => {
  const ctx = useContext(LoadingContext);
  if (!ctx) {
    return {
      isLoading: false,
      startLoading: () => {},
      stopLoading: () => {},
    };
  }
  return ctx;
};
