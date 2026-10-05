import { useEffect, useState } from "react";

export default function ResilientImage({ src, alt, className, fallback }) {
  const [failed, setFailed] = useState(!src);

  useEffect(() => {
    setFailed(!src);
  }, [src]);

  if (failed) return fallback;

  return <img src={src} alt={alt} className={className} onError={() => setFailed(true)} />;
}
