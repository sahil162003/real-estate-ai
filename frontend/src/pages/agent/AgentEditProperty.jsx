
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import propertyService from "../../api/services/propertyService";
import api from "../../api/client";
import "./AgentEditProperty.css";

const initialForm = {
  title: "",
  location: "",
  price: "",
  bedrooms: "",
  description: "",
  bathrooms: "",
  area: "",
  propertyType: "",
};

const propertyTypes = [
  "APARTMENT",
  "HOUSE",
  "VILLA",
  "PLOT",
  "COMMERCIAL",
];

export default function AgentEditProperty() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deletingImageId, setDeletingImageId] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [images, setImages] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);

  useEffect(() => {
    let active = true;

    const loadProperty = async () => {
      try {
        setLoading(true);
        setError("");

        const property = await propertyService.getPropertyById(id);

        if (!active) return;

        setForm({
          title: property.title ?? "",
          location: property.location ?? "",
          price: property.price ?? "",
          bedrooms: property.bedrooms ?? "",
          description: property.description ?? "",
          bathrooms: property.bathrooms ?? "",
          area: property.area ?? "",
          propertyType: property.propertyType ?? "",
        });

        const propertyImages = await propertyService.getPropertyImages(id);

        if (active) {
          setImages(
            Array.isArray(propertyImages) ? propertyImages : []
          );
        }
      } catch (err) {
        console.error("Failed to load property:", err);

        if (active) {
          setError(
            err.response?.data?.message ||
              "Unable to load property details or images."
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadProperty();

    return () => {
      active = false;
    };
  }, [id]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleFileChange = (event) => {
    const files = Array.from(event.target.files || []);

    setSelectedFiles(files);
    setError("");
    setSuccess("");
  };

  const handleUploadImages = async () => {
    if (selectedFiles.length === 0) {
      setError("Please select at least one image to upload.");
      return;
    }

    try {
      setUploading(true);
      setError("");
      setSuccess("");

      for (const file of selectedFiles) {
        if (!file.type.startsWith("image/")) {
          throw new Error(`${file.name} is not an image file.`);
        }

        await propertyService.uploadPropertyImage(id, file);
      }

      const updatedImages = await propertyService.getPropertyImages(id);

      setImages(Array.isArray(updatedImages) ? updatedImages : []);
      setSelectedFiles([]);
      setSuccess("Property images uploaded successfully.");

      const fileInput = document.getElementById("propertyImages");

      if (fileInput) {
        fileInput.value = "";
      }
    } catch (err) {
      console.error("Failed to upload property images:", err);

      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to upload property images. Please try again."
      );
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteImage = async (image) => {
    if (!image?.id) {
      setError(
        "Image ID is missing. Refresh the page and try again."
      );
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to delete this property image?"
    );

    if (!confirmed) return;

    try {
      setDeletingImageId(image.id);
      setError("");
      setSuccess("");

      await api.delete(`/api/properties/images/${image.id}`);

      setImages((previous) =>
        previous.filter((item) => item.id !== image.id)
      );

      setSuccess("Property image deleted successfully.");
    } catch (err) {
      console.error("Failed to delete property image:", err);

      setError(
        err.response?.data?.message ||
          "Unable to delete this image. Please try again."
      );
    } finally {
      setDeletingImageId(null);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    const price = Number(form.price);
    const bedrooms = Number(form.bedrooms);
    const bathrooms = Number(form.bathrooms);
    const area = Number(form.area);

    if (
      !form.title.trim() ||
      !form.location.trim() ||
      !form.description.trim() ||
      !form.propertyType
    ) {
      setError("Please complete all required fields.");
      return;
    }

    if (!Number.isFinite(price) || price <= 0) {
      setError("Price must be greater than zero.");
      return;
    }

    if (!Number.isInteger(bedrooms) || bedrooms < 0) {
      setError(
        "Bedrooms must be a whole number greater than or equal to zero."
      );
      return;
    }

    if (!Number.isInteger(bathrooms) || bathrooms < 0) {
      setError(
        "Bathrooms must be a whole number greater than or equal to zero."
      );
      return;
    }

    if (!Number.isFinite(area) || area <= 0) {
      setError("Area must be greater than zero.");
      return;
    }

    const propertyData = {
      title: form.title.trim(),
      location: form.location.trim(),
      price,
      bedrooms,
      description: form.description.trim(),
      bathrooms,
      area,
      propertyType: form.propertyType,
    };

    try {
      setSaving(true);

      await api.put(
        `/api/properties/updateProperties/${id}`,
        propertyData
      );

      setSuccess("Property updated successfully.");

      setTimeout(() => {
        navigate("/agent/properties");
      }, 800);
    } catch (err) {
      console.error("Failed to update property:", err);

      const responseData = err.response?.data;

      if (responseData?.errors) {
        setError(Object.values(responseData.errors).join(" "));
      } else {
        setError(
          responseData?.message ||
            "Unable to update property. Please try again."
        );
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main className="agent-edit-property-page">
        <p className="agent-edit-property-message">
          Loading property details...
        </p>
      </main>
    );
  }

  if (error && !form.title && !form.location) {
    return (
      <main className="agent-edit-property-page">
        <p className="agent-edit-property-error" role="alert">
          {error}
        </p>

        <Link
          to="/agent/properties"
          className="agent-edit-property-back"
        >
          Back to My Properties
        </Link>
      </main>
    );
  }

  return (
    <main className="agent-edit-property-page">
      <header className="agent-edit-property-header">
        <div>
          <h1>Edit Property</h1>
          <p>Update the details and photos of your property listing.</p>
        </div>

        <Link
          to="/agent/properties"
          className="agent-edit-property-back"
        >
          ← Back to My Properties
        </Link>
      </header>

      <section className="agent-edit-property-card">
        <form onSubmit={handleSubmit}>
          <div className="agent-edit-property-grid">
            <div className="agent-edit-property-field">
              <label htmlFor="title">Property Title *</label>
              <input
                id="title"
                name="title"
                value={form.title}
                onChange={handleChange}
                maxLength={150}
                required
                disabled={saving || uploading || deletingImageId !== null}
              />
            </div>

            <div className="agent-edit-property-field">
              <label htmlFor="location">Location *</label>
              <input
                id="location"
                name="location"
                value={form.location}
                onChange={handleChange}
                required
                disabled={saving || uploading || deletingImageId !== null}
              />
            </div>

            <div className="agent-edit-property-field">
              <label htmlFor="price">Price (₹) *</label>
              <input
                id="price"
                name="price"
                type="number"
                min="0.01"
                step="any"
                value={form.price}
                onChange={handleChange}
                required
                disabled={saving || uploading || deletingImageId !== null}
              />
            </div>

            <div className="agent-edit-property-field">
              <label htmlFor="propertyType">Property Type *</label>
              <select
                id="propertyType"
                name="propertyType"
                value={form.propertyType}
                onChange={handleChange}
                required
                disabled={saving || uploading || deletingImageId !== null}
              >
                <option value="">Select property type</option>
                {propertyTypes.map((type) => (
                  <option key={type} value={type}>
                    {type.replaceAll("_", " ")}
                  </option>
                ))}
              </select>
            </div>

            <div className="agent-edit-property-field">
              <label htmlFor="bedrooms">Bedrooms *</label>
              <input
                id="bedrooms"
                name="bedrooms"
                type="number"
                min="0"
                step="1"
                value={form.bedrooms}
                onChange={handleChange}
                required
                disabled={saving || uploading || deletingImageId !== null}
              />
            </div>

            <div className="agent-edit-property-field">
              <label htmlFor="bathrooms">Bathrooms *</label>
              <input
                id="bathrooms"
                name="bathrooms"
                type="number"
                min="0"
                step="1"
                value={form.bathrooms}
                onChange={handleChange}
                required
                disabled={saving || uploading || deletingImageId !== null}
              />
            </div>

            <div className="agent-edit-property-field agent-edit-property-full">
              <label htmlFor="area">Area (sq. ft.) *</label>
              <input
                id="area"
                name="area"
                type="number"
                min="0.01"
                step="any"
                value={form.area}
                onChange={handleChange}
                required
                disabled={saving || uploading || deletingImageId !== null}
              />
            </div>

            <div className="agent-edit-property-field agent-edit-property-full">
              <label htmlFor="description">Description *</label>
              <textarea
                id="description"
                name="description"
                rows={5}
                value={form.description}
                onChange={handleChange}
                required
                disabled={saving || uploading || deletingImageId !== null}
              />
            </div>
          </div>

          <section className="agent-edit-property-images">
            <h2>Property Images</h2>
            <p>Select one or more image files to upload to this property.</p>

            <div className="agent-edit-property-field">
              <label htmlFor="propertyImages">Choose Images</label>
              <input
                id="propertyImages"
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileChange}
                disabled={uploading || saving || deletingImageId !== null}
              />
            </div>

            {selectedFiles.length > 0 && (
              <p>{selectedFiles.length} image(s) selected</p>
            )}

            <button
              type="button"
              onClick={handleUploadImages}
              disabled={
                uploading ||
                saving ||
                deletingImageId !== null ||
                selectedFiles.length === 0
              }
            >
              {uploading ? "Uploading Images..." : "Upload Images"}
            </button>

            {images.length > 0 ? (
              <div className="agent-edit-property-image-grid">
                {images.map((image, index) => (
                  <div
                    className="agent-edit-property-image-item"
                    key={image.id}
                  >
                    <img
                      src={image.imageUrl}
                      alt={`Property ${index + 1}`}
                      loading="lazy"
                    />

                    <button
                      type="button"
                      className="agent-edit-property-image-delete"
                      onClick={() => handleDeleteImage(image)}
                      disabled={
                        saving ||
                        uploading ||
                        deletingImageId !== null
                      }
                    >
                      {deletingImageId === image.id
                        ? "Deleting..."
                        : "Delete Image"}
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p>No images uploaded for this property yet.</p>
            )}
          </section>

          {error && (
            <p className="agent-edit-property-error" role="alert">
              {error}
            </p>
          )}

          {success && (
            <p className="agent-edit-property-success" role="status">
              {success}
            </p>
          )}

          <div className="agent-edit-property-actions">
            <Link
              to="/agent/properties"
              className="agent-edit-property-cancel"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={saving || uploading || deletingImageId !== null}
            >
              {saving ? "Saving Changes..." : "Save Changes"}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
