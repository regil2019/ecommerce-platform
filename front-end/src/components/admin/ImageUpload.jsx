import React, { useState, useRef } from "react";
import { Upload, X, ImagePlus, Loader2 } from "lucide-react";
import api from "../../services/api";
import { useI18n } from "../../i18n";

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_FILES = 3;

export default function ImageUpload({ onUpload }) {
  const { t } = useI18n();
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [errors, setErrors] = useState([]);
  const inputRef = useRef(null);

  const validateFile = (file) => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      return t("common.invalidFileType");
    }
    if (file.size > MAX_FILE_SIZE) {
      return t("common.maxFileSize", { size: 5 });
    }
    return null;
  };

  const addFiles = (fileList) => {
    const newFiles = Array.from(fileList).slice(0, MAX_FILES - images.length);
    const validFiles = [];
    const newErrors = [];

    newFiles.forEach((file) => {
      const error = validateFile(file);
      if (error) {
        newErrors.push(`${file.name}: ${error}`);
      } else {
        validFiles.push(file);
      }
    });

    setErrors(newErrors);
    if (validFiles.length > 0) {
      const updated = [...images, ...validFiles].slice(0, MAX_FILES);
      setImages(updated);
      setPreviews(updated.map((f) => URL.createObjectURL(f)));
    }
  };

  const handleFileChange = (e) => {
    addFiles(e.target.files);
    e.target.value = "";
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === "dragenter" || e.type === "dragover");
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.length) {
      addFiles(e.dataTransfer.files);
    }
  };

  const removeImage = (index) => {
    URL.revokeObjectURL(previews[index]);
    setImages((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (images.length === 0) return;
    setUploading(true);
    setErrors([]);
    const urls = [];

    for (const image of images) {
      const formData = new FormData();
      formData.append("image", image);
      try {
        const { data } = await api.post("/upload/image", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        if (data.url) {
          urls.push(data.url);
        }
      } catch (err) {
        console.error("Upload error:", err);
        setErrors((prev) => [...prev, `${image.name}: ${t("common.uploadError")}`]);
      }
    }

    setUploading(false);
    if (urls.length > 0 && onUpload) {
      onUpload(urls);
      setImages([]);
      setPreviews([]);
    }
  };

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`relative flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 transition-colors
          ${dragActive
            ? "border-primary bg-primary/5"
            : "border-border bg-card hover:border-primary/50 hover:bg-accent/50"
          }`}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileChange}
          className="hidden"
          disabled={uploading || images.length >= MAX_FILES}
        />
        <ImagePlus className="mb-2 h-8 w-8 text-muted-foreground" />
        <p className="text-sm font-medium text-foreground">
          {t("common.dragDrop")}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          {t("common.maxFiles", { count: MAX_FILES })} · JPG, PNG, WebP · {t("common.maxFileSize", { size: 5 })}
        </p>
      </div>

      {/* Previews */}
      {previews.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {previews.map((src, idx) => (
            <div key={idx} className="group relative">
              <img
                src={src}
                alt={`Preview ${idx + 1}`}
                className="h-24 w-24 rounded-lg border border-border object-cover shadow-sm"
              />
              <button
                onClick={(e) => { e.stopPropagation(); removeImage(idx); }}
                className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-destructive-foreground opacity-0 transition-opacity group-hover:opacity-100"
                type="button"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Errors */}
      {errors.length > 0 && (
        <div className="space-y-1">
          {errors.map((err, i) => (
            <p key={i} className="text-xs text-destructive">{err}</p>
          ))}
        </div>
      )}

      {/* Upload button */}
      <button
        onClick={handleUpload}
        disabled={uploading || images.length === 0}
        className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
        type="button"
      >
        {uploading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            {t("common.uploading")}
          </>
        ) : (
          <>
            <Upload className="h-4 w-4" />
            {t("common.upload")}
          </>
        )}
      </button>
    </div>
  );
}
