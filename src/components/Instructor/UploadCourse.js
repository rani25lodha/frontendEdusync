import React, { useState } from "react";
import api from "../../services/api";
import { API_CONFIG } from '../../config/api.config';

const UploadCourse = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaLink, setMediaLink] = useState("");
  const [mediaMode, setMediaMode] = useState(null); // "file" or "url"
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewUrl, setPreviewUrl] = useState("");
  const instructorId = localStorage.getItem("userId");

  // Handle file selection and preview
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    setMediaFile(file);

    if (file) {
      // Create preview for images
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (e) => setPreviewUrl(e.target.result);
        reader.readAsDataURL(file);
      } else {
        setPreviewUrl("");
      }
    }
  };

  // Validate file before upload
  const validateFile = (file) => {
    const maxSize = 50 * 1024 * 1024; // 50MB
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "video/mp4",
      "video/avi",
      "video/mov",
      "video/quicktime",
      "application/pdf",
    ];

    if (file.size > maxSize) {
      throw new Error("File size exceeds 50MB limit");
    }

    if (!allowedTypes.includes(file.type.toLowerCase())) {
      throw new Error(
        "Invalid file type. Only images, videos, and PDFs are allowed."
      );
    }
  };

  // Validate URL format
  const validateUrl = (url) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!title.trim() || !description.trim()) {
      alert("Please fill in all required fields");
      return;
    }

    if (!mediaMode) {
      alert("Please select a media option");
      return;
    }

    if (mediaMode === "file" && !mediaFile) {
      alert("Please select a file to upload");
      return;
    }

    if (mediaMode === "url" && !mediaLink.trim()) {
      alert("Please provide a media URL");
      return;
    }

    if (mediaMode === "url" && !validateUrl(mediaLink.trim())) {
      alert("Please provide a valid URL");
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      let mediaUrl = "";
      let uploadResponse = null;

      if (mediaMode === "file" && mediaFile) {
        // Validate file before upload
        validateFile(mediaFile);

        const formData = new FormData();
        formData.append("file", mediaFile);

        setUploadProgress(25);

        // Upload file to Azure Blob Storage
        uploadResponse = await api.post(API_CONFIG.ENDPOINTS.FILE.UPLOAD, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          onUploadProgress: (progressEvent) => {
            const progress = Math.round(
              (progressEvent.loaded * 50) / progressEvent.total + 25
            );
            setUploadProgress(progress);
          },
        });

        if (uploadResponse.data.success) {
          mediaUrl = uploadResponse.data.url;
          setUploadProgress(75);
        } else {
          throw new Error("Failed to upload media file");
        }
      } else if (mediaMode === "url" && mediaLink.trim()) {
        setUploadProgress(25);

        // Upload URL as a reference file to Azure Blob Storage
        const urlData = {
          url: mediaLink.trim(),
          title: title.trim(),
        };

        uploadResponse = await api.post(API_CONFIG.ENDPOINTS.FILE.UPLOAD_URL, urlData, {
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (uploadResponse.data.success) {
          // Store the blob URL that contains the original URL reference
          mediaUrl = uploadResponse.data.url;
          setUploadProgress(75);
        } else {
          throw new Error("Failed to store media URL");
        }
      }

      // Create course with media URL (either direct file URL or blob URL containing URL reference)
      const courseData = {
        title: title.trim(),
        description: description.trim(),
        instructorId,
        mediaUrl,
        mediaType: uploadResponse?.data?.type || mediaMode, // Store whether it's a file or URL
      };

      await api.post(API_CONFIG.ENDPOINTS.COURSES.BASE, courseData);
      setUploadProgress(100);

      alert("Course uploaded successfully!");

      // Reset form
      setTitle("");
      setDescription("");
      setMediaFile(null);
      setMediaLink("");
      setMediaMode(null);
      setPreviewUrl("");
      setUploadProgress(0);
    } catch (error) {
      console.error("Upload error:", error);

      let errorMessage = "Failed to upload course";
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }

      alert(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  // Reset media selection
  const resetMediaSelection = () => {
    setMediaMode(null);
    setMediaFile(null);
    setMediaLink("");
    setPreviewUrl("");
  };

  return (
    <div className="d-flex justify-content-center align-items-center mt-5 mb-5">
      <div
        className="card p-4 shadow-lg"
        style={{ maxWidth: "700px", width: "100%" }}
      >
        <h3 className="text-center text-primary mb-4">Upload Course</h3>

        {/* Progress bar */}
        {isUploading && (
          <div className="mb-3">
            <div className="progress">
              <div
                className="progress-bar progress-bar-striped progress-bar-animated"
                role="progressbar"
                style={{ width: `${uploadProgress}%` }}
                aria-valuenow={uploadProgress}
                aria-valuemin="0"
                aria-valuemax="100"
              >
                {uploadProgress}%
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleUpload}>
          <div className="mb-3">
            <label className="form-label">Course Title *</label>
            <input
              type="text"
              className="form-control"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="Enter course title"
              disabled={isUploading}
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Description *</label>
            <textarea
              className="form-control"
              value={description}
              rows="4"
              onChange={(e) => setDescription(e.target.value)}
              required
              placeholder="Enter course description"
              disabled={isUploading}
            />
          </div>

          <div className="mb-3">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <label className="form-label mb-0">Course Media *</label>
              {mediaMode && (
                <button
                  type="button"
                  className="btn btn-sm btn-outline-secondary"
                  onClick={resetMediaSelection}
                  disabled={isUploading}
                >
                  Reset
                </button>
              )}
            </div>

            <div className="d-flex gap-2 mb-3">
              <button
                type="button"
                className={`btn ${
                  mediaMode === "file" ? "btn-primary" : "btn-outline-primary"
                } flex-fill`}
                onClick={() => setMediaMode("file")}
                disabled={isUploading}
              >
                📁 Upload File
              </button>
              <button
                type="button"
                className={`btn ${
                  mediaMode === "url" ? "btn-primary" : "btn-outline-primary"
                } flex-fill`}
                onClick={() => setMediaMode("url")}
                disabled={isUploading}
              >
                🔗 Paste URL
              </button>
            </div>

            {mediaMode === "file" && (
              <div>
                <input
                  type="file"
                  className="form-control mb-2"
                  onChange={handleFileSelect}
                  accept="image/*,video/*,.pdf"
                  disabled={isUploading}
                />
                <small className="text-muted">
                  Supported: Images (JPEG, PNG, GIF), Videos (MP4, AVI, MOV),
                  PDF. Max size: 50MB
                </small>

                {/* File preview */}
                {previewUrl && (
                  <div className="mt-2">
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="img-thumbnail"
                      style={{ maxHeight: "200px", maxWidth: "100%" }}
                    />
                  </div>
                )}

                {mediaFile && !previewUrl && (
                  <div className="mt-2 p-2 bg-light rounded">
                    <strong>Selected file:</strong> {mediaFile.name}
                    <br />
                    <small>
                      Size: {(mediaFile.size / (1024 * 1024)).toFixed(2)} MB
                    </small>
                  </div>
                )}
              </div>
            )}

            {mediaMode === "url" && (
              <div>
                <input
                  type="url"
                  className="form-control"
                  placeholder="https://example.com/video.mp4"
                  value={mediaLink}
                  onChange={(e) => setMediaLink(e.target.value)}
                  disabled={isUploading}
                />
                <small className="text-muted">
                  Enter a direct URL to your course media (video, image, or
                  document). This URL will be stored securely in Azure Blob
                  Storage.
                </small>

                {/* URL preview */}
                {mediaLink && validateUrl(mediaLink) && (
                  <div className="mt-2 p-2 bg-light rounded">
                    <strong>URL Preview:</strong> {mediaLink}
                    <br />
                    <small className="text-success">✓ Valid URL format</small>
                  </div>
                )}

                {mediaLink && !validateUrl(mediaLink) && (
                  <div className="mt-2 p-2 bg-warning rounded">
                    <small className="text-danger">⚠ Invalid URL format</small>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="d-grid">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isUploading}
            >
              {isUploading ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
                    aria-hidden="true"
                  ></span>
                  {mediaMode === "file"
                    ? "Uploading File..."
                    : "Storing URL..."}
                </>
              ) : (
                "Upload Course"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UploadCourse;