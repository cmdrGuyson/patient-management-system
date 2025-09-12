import * as React from "react";

const MOBILE_BREAKPOINT = 768;

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(
    undefined
  );

  React.useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };

    checkIsMobile();

    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const handleChange = () => {
      checkIsMobile();
    };

    mql.addEventListener("change", handleChange);
    window.addEventListener("resize", checkIsMobile);

    return () => {
      mql.removeEventListener("change", handleChange);
      window.removeEventListener("resize", checkIsMobile);
    };
  }, []);

  return !!isMobile;
}
