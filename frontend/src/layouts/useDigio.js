// useDigio.js
import { useEffect, useState } from 'react';

const useDigio = () => {
  const [digioLoaded, setDigioLoaded] = useState(false);

  useEffect(() => {
    if (window.Digio) {
      setDigioLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://ext.digio.in/sdk/v11/digio.js';
    script.async = true;
    script.onload = () => setDigioLoaded(true);
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  return digioLoaded;
};

export default useDigio;