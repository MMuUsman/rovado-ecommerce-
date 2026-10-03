import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Har page change pe top pe scroll karo
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "smooth", // ya "smooth" agar animation chahiye
    });
  }, [pathname]);

  return null;
}
