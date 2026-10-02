import React, { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Moves keyboard focus to the page heading when the route changes, so
 * screen-reader and keyboard users hear/see where they have landed.
 * Skips the initial mount so focus starts at the browser's default
 * position (the skip link) on first load.
 */
export const RouteFocusManager: React.FC = () => {
  const location = useLocation();
  const firstRender = useRef(true);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }

    const heading = document.querySelector<HTMLElement>('#main-content h1');
    if (heading) {
      heading.setAttribute('tabindex', '-1');
      heading.focus();
    }
  }, [location.pathname]);

  return null;
};
