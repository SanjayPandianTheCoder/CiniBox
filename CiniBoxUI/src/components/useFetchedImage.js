
import { useEffect, useState } from "react";

export default function useFetchedImage(imageUrl) {
  const [imageUri, setImageUri] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const loadImage = async () => {
      if (!imageUrl) {
        setImageUri(null);
        return;
      }

      try {
        const response = await fetch(imageUrl);

        if (!response.ok) {
          throw new Error(`Image request failed: ${response.status}`);
        }

        const blob = await response.blob();

        const reader = new FileReader();

        reader.onloadend = () => {
          if (!cancelled && typeof reader.result === "string") {
            setImageUri(reader.result);
          }
        };

        reader.onerror = () => {
          console.error("Failed to convert image:", imageUrl);
        };

        reader.readAsDataURL(blob);
      } catch (error) {
        console.error("Image fetch failed:", imageUrl, error.message);
      }
    };

    loadImage();

    return () => {
      cancelled = true;
    };
  }, [imageUrl]);

  return imageUri;
}
