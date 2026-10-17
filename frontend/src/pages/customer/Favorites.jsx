
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import favoriteService from "../../api/services/favoriteService";
import "./Favorites.css";

const formatPrice = (price) => {
  if (price == null) return "Price unavailable";

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price);
};

export default function Favorites() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [removingId, setRemovingId] = useState(null);

  const fetchFavorites = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const data = await favoriteService.getFavorites();

      const items = Array.isArray(data)
        ? data
        : data?.content ?? data?.favorites ?? [];

      setFavorites(items);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load your favorite properties."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  const handleRemove = async (propertyId) => {
    try {
      setRemovingId(propertyId);
      setError("");

      await favoriteService.removeFavorite(propertyId);

      setFavorites((previous) =>
        previous.filter(
          (item) => (item.propertyId ?? item.id) !== propertyId
        )
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to remove this favorite. Please try again."
      );
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <main className="favorites-page">
      <header className="favorites-header">
        <div>
          <Link to="/customer/search" className="favorites-brand">
            RealEstateAI
          </Link>

          <h1>My Favorite Properties</h1>
          <p>Keep track of the properties you love.</p>
        </div>

        <nav className="favorites-nav">
          <Link to="/customer/search">Search Properties</Link>
          <Link to="/customer/profile">My Profile</Link>
        </nav>
      </header>

      <section className="favorites-content">
        <div className="favorites-section-heading">
          <h2>Saved Properties</h2>
          {!loading && !error && (
            <span>{favorites.length} saved</span>
          )}
        </div>

        {loading && (
          <p className="favorites-message" role="status">
            Loading your favorites...
          </p>
        )}

        {error && (
          <div className="favorites-error" role="alert">
            <p>{error}</p>
            <button type="button" onClick={fetchFavorites}>
              Try Again
            </button>
          </div>
        )}

        {!loading && !error && favorites.length === 0 && (
          <div className="favorites-empty">
            <div className="favorites-empty-icon" aria-hidden="true">
              ♡
            </div>
            <h3>No favorite properties yet</h3>
            <p>
              Browse properties and save the ones you would like to revisit.
            </p>
            <Link to="/customer/search" className="favorites-browse-button">
              Explore Properties
            </Link>
          </div>
        )}

        {!loading && !error && favorites.length > 0 && (
          <div className="favorites-grid">
            {favorites.map((item) => {
              const property = item.property ?? item;
              const propertyId = property.id ?? item.propertyId;

              if (propertyId == null) return null;

              return (
                <article
                  className="favorite-card"
                  key={propertyId}
                >
                  <div className="favorite-card-visual">
                    <span>
                      {property.propertyType
                        ? String(property.propertyType).replaceAll("_", " ")
                        : "Property"}
                    </span>
                    <span className="favorite-heart" aria-hidden="true">
                      ♥
                    </span>
                  </div>

                  <div className="favorite-card-body">
                    <p className="favorite-price">
                      {formatPrice(property.price)}
                    </p>

                    <h3>{property.title || "Untitled Property"}</h3>

                    <p className="favorite-location">
                      {property.location || "Location unavailable"}
                    </p>

                    <div className="favorite-details">
                      <span>{property.bedrooms ?? "—"} bedrooms</span>
                      <span>{property.bathrooms ?? "—"} bathrooms</span>
                    </div>

                    <div className="favorite-card-actions">
                      <Link
                        to={`/customer/properties/${propertyId}`}
                        className="favorite-view-button"
                      >
                        View Details
                      </Link>

                      <button
                        type="button"
                        className="favorite-remove-button"
                        onClick={() => handleRemove(propertyId)}
                        disabled={removingId === propertyId}
                      >
                        {removingId === propertyId
                          ? "Removing..."
                          : "Remove"}
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
