
import React, { useState } from "react";

export default function ImageUpload({ onUpload }) {
  const [images, setImages] = useState([]); // arquivos
  const [previews, setPreviews] = useState([]); // urls
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files).slice(0, 3);
    setImages(files);
    setPreviews(files.map(file => URL.createObjectURL(file)));
  };

  const handleUpload = async () => {
    if (images.length === 0) return alert("Selecione até 3 imagens!");
    setUploading(true);
    const urls = [];
    for (const image of images) {
      const formData = new FormData();
      formData.append("file", image);
      formData.append("upload_preset", "ecommerce_preset");
      try {
        const res = await fetch(
          "https://api.cloudinary.com/v1_1/dzng8udvw/image/upload",
          {
            method: "POST",
            body: formData,
          }
        );
        const data = await res.json();
        if (data.secure_url) {
          urls.push(data.secure_url);
        }
      } catch (err) {
        console.error("Erro no upload:", err);
      }
    }
    setUploading(false);
    if (onUpload) {
      onUpload(urls);
    }
  };

  return (
    <div className="p-4 border rounded-lg max-w-sm">
      <input
        type="file"
        multiple
        accept="image/*"
        onChange={handleFileChange}
        disabled={uploading}
      />
      <div className="flex gap-2 mt-2">
        {previews.map((src, idx) => (
          <img
            key={idx}
            src={src}
            alt={`Preview ${idx + 1}`}
            className="w-24 h-24 object-cover rounded"
          />
        ))}
      </div>
      <button
        onClick={handleUpload}
        disabled={uploading || images.length === 0}
        className="mt-3 bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
      >
        {uploading ? "Enviando..." : "Enviar para Cloudinary"}
      </button>
    </div>
  );
}
