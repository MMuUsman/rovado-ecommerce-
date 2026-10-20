import { createContext, useContext, useState, useCallback, useMemo } from "react";

const LoadingContext = createContext(null);

export function RovadoLoadingScreen({ message = "Loading...", fullScreen = true }) {
  const content = (
    <div className="flex flex-col items-center justify-center p-8 text-center select-none">
      <div className="relative mb-5 flex items-center justify-center">
        <div className="size-20 sm:size-24 rounded-2xl overflow-hidden bg-white shadow-lg ring-1 ring-black/5 animate-rovado-pulse flex items-center justify-center p-2">
          <img
            src="/Rovadologo.jpg"
            alt="Rovado"
            className="w-full h-full object-contain"
          />
        </div>
        <div className="absolute -inset-2 rounded-3xl bg-green-500/10 -z-10 blur-md animate-pulse" />
      </div>

      <div className="w-36 h-1 bg-stone-200 rounded-full overflow-hidden mb-3">
        <div className="h-full bg-green-600 rounded-full w-2/3 animate-[pulse_1s_infinite]" />
      </div>

      <p className="text-xs font-semibold uppercase tracking-wider text-stone-700">
        {message}
      </p>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="min-h-[50vh] w-full flex items-center justify-center bg-white/80 backdrop-blur-sm rounded-xl py-12">
        {content}
      </div>
    );
  }

  return content;
}

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
      RovadoLoadingScreen,
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
          <div className="mx-auto mt-2 w-fit rounded-full bg-white/95 px-3 py-1 text-[11px] font-semibold text-green-700 shadow-md ring-1 ring-black/5 backdrop-blur-sm flex items-center gap-2">
            <img src="/Rovadologo.jpg" alt="" className="size-3.5 object-contain" />
            <span className="size-1.5 rounded-full bg-green-600 animate-ping" />
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
      RovadoLoadingScreen,
    };
  }
  return ctx;
};
