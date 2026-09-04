// src/components/ScrollToTop.jsx
// React Router preserves scroll position across navigations, so moving from a
// scrolled landing page to /pricing would drop you mid-page. Reset on every
// path change — but leave hash links alone so /#features still anchors.

import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) return;
    window.scrollTo(0, 0);
  }, [pathname, hash]);

  return null;
}
