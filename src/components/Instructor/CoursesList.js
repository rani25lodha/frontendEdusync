import React, { useEffect, useState } from "react";
import api from "../../services/api";
import { API_CONFIG } from '../../config/api.config';

const toPascalCase = (str) =>
  str
    ?.replace(
      /\w\S*/g,
      (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    )
    .replace(/\s+/g, " ")
    .trim();

const InstructorCourseList = () => {
  const [courses, setCourses] = useState([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    mediaUrl: "",
  });
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaOption, setMediaOption] = useState("url"); // "url" or "file"
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [errors, setErrors] = useState({});
  const [uploadProgress, setUploadProgress] = useState(0);

  const fetchCourses = async () => {
    try {
      const instructorId = localStorage.getItem("userId");
      const res = await api.get(`${API_CONFIG.ENDPOINTS.COURSES.INSTRUCTOR}/${instructorId}`);
      setCourses(res.data);
    } catch (err) {
      console.error("Error fetching courses:", err);
      alert("Failed to fetch courses. Please refresh the page.");
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleDelete = async (courseId) => {
    if (window.confirm("Are you sure you want to delete this course?")) {
      try {
        await api.delete(`${API_CONFIG.ENDPOINTS.COURSES.BASE}/${courseId}`);
        setCourses((prev) =>
          prev.filter((course) => course.courseId !== courseId)
        );
        alert("Course deleted successfully!");
      } catch (err) {
        console.error("Failed to delete course", err);
        alert("Failed to delete course. Please try again.");
      }
    }
  };

  const handleEdit = (course) => {
    setEditingCourse(course);
    setFormData({
      title: course.title || "",
      description: course.description || "",
      mediaUrl: course.mediaUrl || "",
    });
    // Reset media options
    setMediaFile(null);
    setMediaOption(course.mediaUrl ? "url" : "file");
    setErrors({});
    setUploadProgress(0);
    setIsEditModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsEditModalOpen(false);
    setEditingCourse(null);
    setFormData({ title: "", description: "", mediaUrl: "" });
    setMediaFile(null);
    setMediaOption("url");
    setErrors({});
    setUploadProgress(0);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setMediaFile(file);

    // Clear media-related errors when file is selected
    if (errors.media) {
      setErrors((prev) => ({
        ...prev,
        media: "",
      }));
    }
  };

  const handleMediaOptionChange = (option) => {
    setMediaOption(option);
    // Clear previous media data when switching options
    if (option === "url") {
      setMediaFile(null);
      setUploadProgress(0);
    } else {
      setFormData((prev) => ({
        ...prev,
        mediaUrl: "",
      }));
    }
    // Clear media-related errors
    if (errors.media || errors.mediaUrl) {
      setErrors((prev) => ({
        ...prev,
        media: "",
        mediaUrl: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }

    // Validate media based on selected option
    if (mediaOption === "url") {
      if (formData.mediaUrl && !isValidUrl(formData.mediaUrl)) {
        newErrors.mediaUrl = "Please enter a valid URL";
      }
    } else if (mediaOption === "file") {
      if (!mediaFile && !editingCourse?.mediaUrl) {
        // Only require file if there's no existing media URL
        newErrors.media = "Please select a media file";
      } else if (mediaFile) {
        // Validate file size (50MB limit as per your controller)
        const maxSize = 50 * 1024 * 1024; // 50MB
        if (mediaFile.size > maxSize) {
          newErrors.media = "File size must be less than 50MB";
        }

        // Validate file type
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

        if (!allowedTypes.includes(mediaFile.type.toLowerCase())) {
          newErrors.media =
            "Invalid file type. Allowed: JPEG, PNG, GIF, MP4, AVI, MOV, PDF";
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const uploadMediaFile = async (file) => {
    const uploadFormData = new FormData();
    uploadFormData.append("file", file); // Changed from "media" to "file" to match your controller

    try {
      setIsUploading(true);
      setUploadProgress(0);

      // Use the correct endpoint from your controller
      const response = await api.post(API_CONFIG.ENDPOINTS.COURSES.UPLOAD, uploadFormData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(percentCompleted);
        },
      });

      // Your controller returns { success: true, url: fileUrl, ... }
      return response.data.url;
    } catch (error) {
      console.error("Media upload failed:", error);

      // Handle specific errors from your controller
      if (error.response?.status === 400) {
        const errorMsg =
          error.response.data?.error || "Invalid file or request";
        throw new Error(errorMsg);
      } else if (error.response?.status === 413) {
        throw new Error("File too large. Maximum size is 50MB.");
      } else if (error.response?.status === 500) {
        const errorMsg = error.response.data?.error || "Server error occurred";
        throw new Error(`Upload failed: ${errorMsg}`);
      } else {
        throw new Error("Failed to upload media file. Please try again.");
      }
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleSaveChanges = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      let mediaUrl = formData.mediaUrl || "";

      // Handle file upload if file option is selected and a file is provided
      if (mediaOption === "file" && mediaFile) {
        try {
          mediaUrl = await uploadMediaFile(mediaFile);
        } catch (uploadError) {
          alert(uploadError.message);
          return;
        }
      } else if (mediaOption === "url") {
        mediaUrl = formData.mediaUrl ? formData.mediaUrl.trim() : "";
      } else if (mediaOption === "file" && !mediaFile) {
        // Keep existing mediaUrl if no new file is selected
        mediaUrl = editingCourse?.mediaUrl || "";
      }

      const updateData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        mediaUrl: mediaUrl,
      };

      await api.put(`${API_CONFIG.ENDPOINTS.COURSES.BASE}/${editingCourse.courseId}`, updateData);

      // Update the course in the local state
      setCourses((prev) =>
        prev.map((course) =>
          course.courseId === editingCourse.courseId
            ? { ...course, ...updateData }
            : course
        )
      );

      alert("Course updated successfully!");
      handleCloseModal();
    } catch (err) {
      console.error("Failed to update course", err);

      // Handle specific error messages from the server
      if (err.response?.data?.message) {
        alert(`Failed to update course: ${err.response.data.message}`);
      } else if (err.response?.status === 404) {
        alert("Course not found. It may have been deleted.");
        fetchCourses(); // Refresh the list
      } else if (err.response?.status === 403) {
        alert("You don't have permission to edit this course.");
      } else {
        alert("Failed to update course. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getFileTypeIcon = (mediaUrl) => {
    if (!mediaUrl) return "📁";

    const url = mediaUrl.toLowerCase();
    if (
      url.includes(".mp4") ||
      url.includes(".avi") ||
      url.includes(".mov") ||
      url.includes("video")
    ) {
      return "🎥";
    } else if (
      url.includes(".jpg") ||
      url.includes(".jpeg") ||
      url.includes(".png") ||
      url.includes(".gif") ||
      url.includes("image")
    ) {
      return "🖼️";
    } else if (url.includes(".pdf")) {
      return "📄";
    } else {
      return "📺";
    }
  };

  return (
    <div className="container mt-4">
      <h2 className="mb-4 text-primary fw-bold">My Uploaded Courses</h2>
      <div className="row">
        {courses.length === 0 ? (
          <div className="col-12">
            <p className="text-muted">You haven't uploaded any courses yet.</p>
          </div>
        ) : (
          courses.map((course) => (
            <div className="col-md-6 col-lg-4 mb-4" key={course.courseId}>
              <div className="card h-100 shadow-lg border-0">
                <div className="card-body d-flex flex-column justify-content-between">
                  <div>
                    <h5 className="card-title text-dark fw-semibold">
                      {toPascalCase(course.title)}
                    </h5>
                    <p className="card-text text-muted">
                      {toPascalCase(course.description)}
                    </p>
                  </div>

                  <div className="mt-3 d-flex justify-content-between flex-wrap gap-2">
                    {course.mediaUrl && (
                      <a
                        href={course.mediaUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-outline-primary btn-sm"
                      >
                        {getFileTypeIcon(course.mediaUrl)} View Media
                      </a>
                    )}
                    <button
                      className="btn btn-outline-warning btn-sm"
                      onClick={() => handleEdit(course)}
                    >
                      ✏️ Edit
                    </button>
                    <button
                      className="btn btn-outline-danger btn-sm"
                      onClick={() => handleDelete(course.courseId)}
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Edit Modal */}
      {isEditModalOpen && (
        <div
          className="modal fade show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Edit Course</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={handleCloseModal}
                  disabled={isLoading || isUploading}
                ></button>
              </div>
              <div className="modal-body">
                <form>
                  <div className="mb-3">
                    <label htmlFor="title" className="form-label">
                      Course Title <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className={`form-control ${
                        errors.title ? "is-invalid" : ""
                      }`}
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      disabled={isLoading || isUploading}
                    />
                    {errors.title && (
                      <div className="invalid-feedback">{errors.title}</div>
                    )}
                  </div>

                  <div className="mb-3">
                    <label htmlFor="description" className="form-label">
                      Description <span className="text-danger">*</span>
                    </label>
                    <textarea
                      className={`form-control ${
                        errors.description ? "is-invalid" : ""
                      }`}
                      id="description"
                      name="description"
                      rows="4"
                      value={formData.description}
                      onChange={handleInputChange}
                      disabled={isLoading || isUploading}
                    ></textarea>
                    {errors.description && (
                      <div className="invalid-feedback">
                        {errors.description}
                      </div>
                    )}
                  </div>

                  {/* Media Options */}
                  <div className="mb-3">
                    <label className="form-label">Media Options</label>
                    <div className="d-flex gap-3 mb-3">
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="radio"
                          name="mediaOption"
                          id="urlOption"
                          checked={mediaOption === "url"}
                          onChange={() => handleMediaOptionChange("url")}
                          disabled={isLoading || isUploading}
                        />
                        <label className="form-check-label" htmlFor="urlOption">
                          Media URL
                        </label>
                      </div>
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="radio"
                          name="mediaOption"
                          id="fileOption"
                          checked={mediaOption === "file"}
                          onChange={() => handleMediaOptionChange("file")}
                          disabled={isLoading || isUploading}
                        />
                        <label
                          className="form-check-label"
                          htmlFor="fileOption"
                        >
                          Upload File
                          <small className="text-success d-block">
                            (Images, Videos, PDFs - Max 50MB)
                          </small>
                        </label>
                      </div>
                    </div>

                    {mediaOption === "url" ? (
                      <div>
                        <input
                          type="url"
                          className={`form-control ${
                            errors.mediaUrl ? "is-invalid" : ""
                          }`}
                          id="mediaUrl"
                          name="mediaUrl"
                          value={formData.mediaUrl}
                          onChange={handleInputChange}
                          placeholder="https://example.com/media-file"
                          disabled={isLoading || isUploading}
                        />
                        {errors.mediaUrl && (
                          <div className="invalid-feedback">
                            {errors.mediaUrl}
                          </div>
                        )}
                        <div className="form-text">
                          Enter a direct link to your course media
                        </div>
                      </div>
                    ) : (
                      <div>
                        <input
                          type="file"
                          className={`form-control ${
                            errors.media ? "is-invalid" : ""
                          }`}
                          id="mediaFile"
                          accept=".jpg,.jpeg,.png,.gif,.mp4,.avi,.mov,.pdf"
                          onChange={handleFileChange}
                          disabled={isLoading || isUploading}
                        />
                        {errors.media && (
                          <div className="invalid-feedback">{errors.media}</div>
                        )}

                        {/* Upload Progress */}
                        {isUploading && uploadProgress > 0 && (
                          <div className="mt-2">
                            <div className="progress">
                              <div
                                className="progress-bar progress-bar-striped progress-bar-animated"
                                role="progressbar"
                                style={{ width: `${uploadProgress}%` }}
                              >
                                {uploadProgress}%
                              </div>
                            </div>
                          </div>
                        )}

                        <div className="form-text">
                          {editingCourse?.mediaUrl && !mediaFile && (
                            <span className="text-success">
                              <strong>Current:</strong> Media file already
                              uploaded.
                              {getFileTypeIcon(editingCourse.mediaUrl)}
                              <a
                                href={editingCourse.mediaUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="ms-1"
                              >
                                View current media
                              </a>
                              <br />
                              Select a new file to replace it.
                            </span>
                          )}
                          {!editingCourse?.mediaUrl && (
                            <span>
                              Supported formats: JPEG, PNG, GIF, MP4, AVI, MOV,
                              PDF
                            </span>
                          )}
                          <br />
                          <small className="text-muted">
                            Maximum file size: 50MB
                          </small>
                        </div>

                        {mediaFile && (
                          <div className="mt-2">
                            <div className="alert alert-info py-2">
                              <strong>Selected:</strong> {mediaFile.name}
                              <br />
                              <small>
                                Size:{" "}
                                {(mediaFile.size / 1024 / 1024).toFixed(2)} MB |
                                Type: {mediaFile.type}
                              </small>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </form>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleCloseModal}
                  disabled={isLoading || isUploading}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleSaveChanges}
                  disabled={isLoading || isUploading}
                >
                  {isUploading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Uploading... {uploadProgress}%
                    </>
                  ) : isLoading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InstructorCourseList;
