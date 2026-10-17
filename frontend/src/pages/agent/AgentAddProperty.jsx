
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../api/client";
import "./AgentAddProperty.css";

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

export default function AgentAddProperty() {
  const navigate = useNavigate();

  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
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
      setError("Price must be greater than 0.");
      return;
    }

    if (!Number.isInteger(bedrooms) || bedrooms < 0) {
      setError("Bedrooms must be a whole number greater than or equal to 0.");
      return;
    }

    if (!Number.isInteger(bathrooms) || bathrooms < 0) {
      setError("Bathrooms must be a whole number greater than or equal to 0.");
      return;
    }

    if (!Number.isFinite(area) || area <= 0) {
      setError("Area must be greater than 0.");
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
      setLoading(true);

      await api.post("/api/properties/createProperties", propertyData);

      setSuccess("Property added successfully.");

      setTimeout(() => {
        navigate("/agent/properties");
      }, 1000);
    } catch (err) {
      console.error("Failed to add property:", err);

      const responseData = err.response?.data;

      if (responseData?.errors) {
        const validationErrors = Object.values(responseData.errors);
        setError(validationErrors.join(" "));
      } else if (responseData?.message) {
        setError(responseData.message);
      } else {
        setError(
          "Unable to add property. Please check your connection and try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="agent-add-property-page">
      <header className="agent-add-property-header">
        <div>
          <h1>Add Property</h1>
          <p>Enter the details to create a new property listing.</p>
        </div>

        <Link
          to="/agent/properties"
          className="agent-add-property-back"
        >
          ← Back to My Properties
        </Link>
      </header>

      <section className="agent-add-property-card">
        <form onSubmit={handleSubmit}>
          <div className="agent-add-property-grid">
            <div className="agent-add-property-field">
              <label htmlFor="title">Property Title *</label>
              <input
                id="title"
                name="title"
                type="text"
                value={form.title}
                onChange={handleChange}
                placeholder="e.g. Spacious 2 BHK Apartment"
                maxLength={150}
                required
                disabled={loading}
              />
            </div>

            <div className="agent-add-property-field">
              <label htmlFor="location">Location *</label>
              <input
                id="location"
                name="location"
                type="text"
                value={form.location}
                onChange={handleChange}
                placeholder="e.g. Thane, Maharashtra"
                required
                disabled={loading}
              />
            </div>

            <div className="agent-add-property-field">
              <label htmlFor="price">Price (₹) *</label>
              <input
                id="price"
                name="price"
                type="number"
                min="0.01"
                step="any"
                value={form.price}
                onChange={handleChange}
                placeholder="Enter property price"
                required
                disabled={loading}
              />
            </div>

            <div className="agent-add-property-field">
              <label htmlFor="propertyType">Property Type *</label>
              <select
                id="propertyType"
                name="propertyType"
                value={form.propertyType}
                onChange={handleChange}
                required
                disabled={loading}
              >
                <option value="">Select property type</option>
                {propertyTypes.map((type) => (
                  <option key={type} value={type}>
                    {type.replaceAll("_", " ")}
                  </option>
                ))}
              </select>
            </div>

            <div className="agent-add-property-field">
              <label htmlFor="bedrooms">Bedrooms *</label>
              <input
                id="bedrooms"
                name="bedrooms"
                type="number"
                min="0"
                step="1"
                value={form.bedrooms}
                onChange={handleChange}
                placeholder="Number of bedrooms"
                required
                disabled={loading}
              />
            </div>

            <div className="agent-add-property-field">
              <label htmlFor="bathrooms">Bathrooms *</label>
              <input
                id="bathrooms"
                name="bathrooms"
                type="number"
                min="0"
                step="1"
                value={form.bathrooms}
                onChange={handleChange}
                placeholder="Number of bathrooms"
                required
                disabled={loading}
              />
            </div>

            <div className="agent-add-property-field">
              <label htmlFor="area">Area (sq. ft.) *</label>
              <input
                id="area"
                name="area"
                type="number"
                min="0.01"
                step="any"
                value={form.area}
                onChange={handleChange}
                placeholder="Enter property area"
                required
                disabled={loading}
              />
            </div>

            <div className="agent-add-property-field agent-add-property-full">
              <label htmlFor="description">Description *</label>
              <textarea
                id="description"
                name="description"
                rows="5"
                value={form.description}
                onChange={handleChange}
                placeholder="Describe the property, amenities, and other important details."
                required
                disabled={loading}
              />
            </div>
          </div>

          {error && (
            <p className="agent-add-property-error" role="alert">
              {error}
            </p>
          )}

          {success && (
            <p className="agent-add-property-success" role="status">
              {success}
            </p>
          )}

          <div className="agent-add-property-form-actions">
            <Link
              to="/agent/properties"
              className="agent-add-property-cancel"
            >
              Cancel
            </Link>

            <button type="submit" disabled={loading}>
              {loading ? "Adding Property..." : "Add Property"}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
