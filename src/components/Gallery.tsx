import { useEffect, useState } from "react";
import { GITSHEET_CONFIG } from "../config";

const API_URL = `https://api.github.com/repos/${GITSHEET_CONFIG.GITHUB_USER}/${GITSHEET_CONFIG.REPO}/contents/${GITSHEET_CONFIG.IMAGES_DIR}?ref=${GITSHEET_CONFIG.BRANCH}`;

type ImageItem = {
  name: string;
  download_url: string;
};

export default function Gallery() {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch(API_URL)
      .then(res => {
        if (!res.ok) throw new Error(`Failed to load: ${res.statusText}`);
        return res.json();
      })
      .then((data: any[]) => {
        // Keep jpg/png only
        const files = data.filter(
          f => typeof f.name === "string" && /\.(jpe?g|png)$/i.test(f.name)
        );
        // Ascending filename sort
        files.sort((a, b) => a.name.localeCompare(b.name));
        setImages(files);
        setError(null);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-gray-500">Loading images...</div>;
  if (error) return <div className="text-red-500">Failed to load images: {error}</div>;

  return (
    <div>
      {images.length === 0 ? (
        <div className="text-center text-gray-400 py-12">No sheets found, upload some!</div>
      ) : (
        <div className="grid grid-cols-2 gap-4 mb-6">
          {images.map(img => (
            <img
              key={img.name}
              src={img.download_url}
              className="rounded shadow"
              alt={img.name}
            />
          ))}
        </div>
      )}
    </div>
  );
}