// hooks/useFacebookPixel.js
import { useEffect } from 'react';
import ReactPixel from 'react-facebook-pixel';

const useFacebookPixel = (pixelId) => {
  useEffect(() => {
    if (!pixelId) return;

    ReactPixel.init(pixelId);
    ReactPixel.pageView();
  }, [pixelId]);
};

export default useFacebookPixel;
