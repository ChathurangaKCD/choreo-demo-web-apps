import { Backdrop, CircularProgress } from "@mui/material";
import React, { useContext, useEffect, useState } from "react";

const PageLoaderCtx = React.createContext<(v: boolean) => void>(() => {});

/**
 * Render loader component in a common parent,
 *  to prevent resetting circular animation
 */
export function PageLoaderProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isActive, setIsActive] = useState(false);
  return (
    <PageLoaderCtx.Provider value={setIsActive}>
      <Backdrop open={isActive} transitionDuration={0}>
        <CircularProgress color="inherit" />
      </Backdrop>
      {children}
    </PageLoaderCtx.Provider>
  );
}

export function PageLoader() {
  const setIsActive = useContext(PageLoaderCtx);
  useEffect(() => {
    setIsActive(true);
    return () => setIsActive(false);
  }, [setIsActive]);
  return null;
}
