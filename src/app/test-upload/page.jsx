"use client";
import { useState } from "react";

export default function AdminUpload() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState("");

  const handleUpload = async () => {
    if (!file) {
      alert("Please pick a file first!");
      return;
    }
    setUploading(true);
    setStatus("Requesting upload ticket from S3...");

    try {
      const res = await fetch(`/api/upload-url?file=${encodeURIComponent(file.name)}&type=${file.type}`);
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Failed to get signed URL");

      setStatus("Uploading file directly to AWS S3...");
      const upload = await fetch(data.url, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type },
      });

      if (upload.ok) {
        setStatus("Video uploaded successfully to your S3 bucket!");
      } else {
        setStatus("S3 rejected the upload. Check CORS settings.");
      }
    } catch (err) {
      setStatus(`Error: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex flex-col items-center justify-center pt-32 px-4">
      <div className="bg-neutral-900 border border-neutral-800 p-8 rounded-2xl max-w-md w-full shadow-2xl flex flex-col gap-6 text-center">
        <h1 className="text-xl font-semibold text-amber-400">S3 Video Upload Test</h1>

        <input
          type="file"
          accept="video/*"
          className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-amber-400 file:text-black hover:file:bg-amber-500 cursor-pointer"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />

        <button
          onClick={handleUpload}
          disabled={uploading}
          className="w-full py-3 bg-amber-400 hover:bg-amber-500 text-black font-semibold rounded-lg transition disabled:opacity-50"
        >
          {uploading ? "Uploading..." : "Upload Video"}
        </button>

        {status && (
          <p className="text-sm text-neutral-300 bg-neutral-800/80 p-3 rounded-lg border border-neutral-700">
            {status}
          </p>
        )}
      </div>
    </div>
  );
}
