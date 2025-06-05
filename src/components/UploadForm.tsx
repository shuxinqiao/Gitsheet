import { useState } from "react";
import { GITSHEET_CONFIG } from "../config";

const TOKEN_KEY = "gitsheet_token"; // Localstorage key

export default function UploadForm() {
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY) || "");

  // handle token change and store in localStorage存
  function handleTokenChange(e: React.ChangeEvent<HTMLInputElement>) {
    setToken(e.target.value.trim());
    localStorage.setItem(TOKEN_KEY, e.target.value.trim());
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setMessage("");
    setPreview(null);

    // Preview
    const reader = new FileReader();
    reader.onloadend = async () => {
      setPreview(reader.result as string);

      if (!token) {
        setMessage("Please check your GitHub Token");
        return;
      }

      setUploading(true);
      try {
        const base64 = (reader.result as string).split(",")[1];

        const { GITHUB_USER, REPO, BRANCH, IMAGES_DIR } = GITSHEET_CONFIG;
        const path = `${IMAGES_DIR}/${file.name}`;

        // Check if iamge is existed, get sha
        let sha = undefined;
        const checkUrl = `https://api.github.com/repos/${GITHUB_USER}/${REPO}/contents/${path}?ref=${BRANCH}`;
        const checkRes = await fetch(checkUrl, {
          headers: { Authorization: `token ${token}` },
        });
        if (checkRes.ok) {
          const checkJson = await checkRes.json();
          sha = checkJson.sha;
        }

        // Upload image
        const url = `https://api.github.com/repos/${GITHUB_USER}/${REPO}/contents/${path}`;
        const body: any = {
          message: `Upload sheet: ${file.name}`,
          content: base64,
          branch: BRANCH,
        };
        if (sha) body.sha = sha;

        const res = await fetch(url, {
          method: "PUT",
          headers: {
            Authorization: `token ${token}`,
            "Content-Type": "application/json",
            Accept: "application/vnd.github+json",
          },
          body: JSON.stringify(body),
        });

        if (res.ok) {
          setMessage("✅ Upload succeed! Please refresh if page not updated");
        } else {
          const errJson = await res.json();
          setMessage(`❌ Upload failed: ${errJson.message || res.statusText}`);
        }
      } catch (err: any) {
        setMessage(`❌ Internet or Authentication failed: ${err.message}`);
      } finally {
        setUploading(false);
      }
    };

    reader.readAsDataURL(file);
  }

  return (
    <div className="mb-6 max-w-md mx-auto p-4 border rounded-lg shadow bg-black">
      <label className="block mb-2 text-sm font-medium">GitHub Token (repo auth, localStorage only)</label>
      <input
        type="password"
        className="mb-4 border px-2 py-1 w-full rounded"
        placeholder="Paste your Token here"
        value={token}
        onChange={handleTokenChange}
        disabled={uploading}
      />

      <label className="block mb-2 text-sm font-medium">Upload sheet</label>
      <input
        type="file"
        accept="image/*"
        className="mb-2"
        onChange={handleUpload}
        disabled={uploading || !token}
      />

      {preview && (
        <img src={preview} alt="preview" className="my-2 rounded shadow w-full max-w-xs mx-auto" />
      )}

      {uploading && <div className="text-blue-500">Uploading...</div>}
      {message && <div className="mt-2 text-sm">{message}</div>}
    </div>
  );
}
