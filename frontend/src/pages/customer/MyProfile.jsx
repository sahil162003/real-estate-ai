
import { useEffect, useState } from "react";
import userService from "../../api/services/userService";
import "./MyProfile.css";

export default function MyProfile() {
  const [profile, setProfile] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    address: "",
    role: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await userService.getMyProfile();

        setProfile({
          firstName: data.firstName ?? "",
          lastName: data.lastName ?? "",
          email: data.email ?? "",
          phoneNumber: data.phoneNumber ?? "",
          address: data.address ?? "",
          role: data.role ?? "",
        });
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Unable to load your profile. Please log in again if your session has expired."
        );
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setProfile((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    const phone = profile.phoneNumber.trim();
    const address = profile.address.trim();

    if (!/^[6-9]\d{9}$/.test(phone)) {
      setError("Enter a valid 10-digit Indian mobile number.");
      return;
    }

    if (!address) {
      setError("Address is required.");
      return;
    }

    if (address.length > 255) {
      setError("Address must not exceed 255 characters.");
      return;
    }

    try {
      setSaving(true);

      const updated = await userService.updateMyProfile({
        phoneNumber: phone,
        address,
      });

      setProfile((previous) => ({
        ...previous,
        phoneNumber: updated.phoneNumber ?? phone,
        address: updated.address ?? address,
      }));

      setSuccess("Your profile was updated successfully.");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to update your profile. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p className="profile-message">Loading your profile...</p>;
  }

  return (
    <main className="profile-page">
      <section className="profile-card">
        <h1>My Profile</h1>
        <p className="profile-subtitle">
          View your account details and update your contact information.
        </p>

        {error && (
          <div className="profile-alert profile-error" role="alert">
            {error}
          </div>
        )}

        {success && (
          <div className="profile-alert profile-success" role="status">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="profile-field">
            <label htmlFor="firstName">First name</label>
            <input
              id="firstName"
              value={profile.firstName}
              readOnly
            />
          </div>

          <div className="profile-field">
            <label htmlFor="lastName">Last name</label>
            <input
              id="lastName"
              value={profile.lastName}
              readOnly
            />
          </div>

          <div className="profile-field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={profile.email}
              readOnly
            />
          </div>

          <div className="profile-field">
            <label htmlFor="role">Role</label>
            <input id="role" value={profile.role} readOnly />
          </div>

          <div className="profile-field">
            <label htmlFor="phoneNumber">Phone number</label>
            <input
              id="phoneNumber"
              name="phoneNumber"
              type="tel"
              inputMode="numeric"
              autoComplete="tel"
              maxLength={10}
              placeholder="Enter 10-digit mobile number"
              value={profile.phoneNumber}
              onChange={handleChange}
              required
            />
          </div>

          <div className="profile-field">
            <label htmlFor="address">Address</label>
            <textarea
              id="address"
              name="address"
              rows={3}
              maxLength={255}
              autoComplete="street-address"
              placeholder="Enter your address"
              value={profile.address}
              onChange={handleChange}
              required
            />
          </div>

          <button
            className="profile-save-button"
            type="submit"
            disabled={saving}
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </section>
    </main>
  );
}
