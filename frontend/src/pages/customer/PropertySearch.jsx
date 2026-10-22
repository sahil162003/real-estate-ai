
import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import propertyService from "../../api/services/propertyService";
import favoriteService from "../../api/services/favoriteService";
import aiSearchService from "../../api/services/aiSearchService";
import "./PropertySearch.css";

const initialFilters = {
  location: "",
  bedroom: "",
  minPrice: "",
  maxPrice: "",
  sortBy: "createdAt",
  sortOrder: "desc",
};

const formatPrice = (price) => {
  if (price == null) return "Price unavailable";

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price);
};

const formatLabel = (value) => {
  if (!value) return "Not specified";

  return String(value)
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (character) => character.toUpperCase());
};

const getFavoriteItems = (data) => {
  if (Array.isArray(data)) return data;
  return data?.content ?? data?.favorites ?? [];
};

const getFavoritePropertyId = (item) =>
  item?.property?.id ?? item?.propertyId ?? item?.id;

const getImageUrl = (image) => {
  if (typeof image === "string") return image;
  return image?.imageUrl ?? image?.url ?? "";
};

export default function PropertySearch() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [aiPrompt, setAiPrompt] = useState("");
const [aiSearching, setAiSearching] = useState(false);
const [aiError, setAiError] = useState("");

  const [filters, setFilters] = useState(initialFilters);
  const [properties, setProperties] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [favoriteIds, setFavoriteIds] = useState([]);
  const [favoriteLoadingId, setFavoriteLoadingId] = useState(null);
  const [favoriteError, setFavoriteError] = useState("");

  const handleSignOut = async () => {
    try {
      await logout();
    } finally {
      navigate("/login", { replace: true });
    }
  };

  const fetchProperties = useCallback(
    async (currentFilters, currentPage) => {
      try {
        setLoading(true);
        setError("");

        const result = await propertyService.searchProperties({
          ...currentFilters,
          page: currentPage,
        });

        const propertyList =
          result.content ?? result.properties ?? [];

        const propertiesWithImages = await Promise.all(
          propertyList.map(async (property) => {
            try {
              const images = await propertyService.getPropertyImages(
                property.id
              );

              const imageList = Array.isArray(images) ? images : [];

              return {
                ...property,
                imageUrl:
                  imageList.length > 0
                    ? getImageUrl(imageList[0])
                    : "",
              };
            } catch (imageError) {
              console.error(
                `Unable to load images for property ${property.id}:`,
                imageError
              );

              return { ...property, imageUrl: "" };
            }
          })
        );

        setProperties(propertiesWithImages);
        setPage(result.pageNumber ?? result.page ?? currentPage);
        setTotalPages(result.totalPages ?? 0);
        setTotalElements(result.totalElements ?? 0);
      } catch (err) {
        setProperties([]);
        setTotalPages(0);
        setTotalElements(0);

        setError(
          err.response?.data?.message ||
            (typeof err.response?.data === "string"
              ? err.response.data
              : "") ||
            "Unable to load properties. Please try again."
        );
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchProperties(initialFilters, 0);
  }, [fetchProperties]);

  useEffect(() => {
    let active = true;

    const loadFavorites = async () => {
      try {
        const data = await favoriteService.getFavorites();
        const items = getFavoriteItems(data);

        const ids = items
          .map(getFavoritePropertyId)
          .filter((id) => id != null)
          .map(String);

        if (active) {
          setFavoriteIds(ids);
        }
      } catch (err) {
        if (active) {
          console.error("Unable to load favorites:", err);
        }
      }
    };

    loadFavorites();

    return () => {
      active = false;
    };
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFilters((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSearch = (event) => {
    event.preventDefault();

    const minPrice =
      filters.minPrice === "" ? null : Number(filters.minPrice);

    const maxPrice =
      filters.maxPrice === "" ? null : Number(filters.maxPrice);

    if (
      (minPrice !== null && minPrice < 0) ||
      (maxPrice !== null && maxPrice < 0)
    ) {
      setError("Price cannot be negative.");
      return;
    }

    if (
      minPrice !== null &&
      maxPrice !== null &&
      minPrice > maxPrice
    ) {
      setError("Minimum price cannot exceed maximum price.");
      return;
    }

    if (
      filters.bedroom !== "" &&
      (!Number.isInteger(Number(filters.bedroom)) ||
        Number(filters.bedroom) < 0)
    ) {
      setError("Please enter a valid bedroom count.");
      return;
    }

    setPage(0);
    fetchProperties(filters, 0);
  };
  
const handleAISearch = async (event) => {
  event.preventDefault();

  const prompt = aiPrompt.trim();

  if (!prompt) {
    setAiError("Please describe the property you are looking for.");
    return;
  }

  try {
    setAiSearching(true);
    setAiError("");
    setError("");
    setFavoriteError("");

    const response = await aiSearchService.searchProperties(prompt);
    const result = response.data;

    const propertyList = result.properties ?? result.content ?? [];

    const propertiesWithImages = await Promise.all(
      propertyList.map(async (property) => {
        try {
          const images = await propertyService.getPropertyImages(property.id);
          const imageList = Array.isArray(images) ? images : [];

          return {
            ...property,
            imageUrl: imageList.length > 0
              ? getImageUrl(imageList[0])
              : "",
          };
        } catch (imageError) {
          console.error(
            `Unable to load images for property ${property.id}:`,
            imageError
          );

          return { ...property, imageUrl: "" };
        }
      })
    );

    setProperties(propertiesWithImages);
    setPage(result.page ?? result.pageNumber ?? 0);
    setTotalPages(result.totalPages ?? 0);
    setTotalElements(result.totalElements ?? propertyList.length);
  } catch (err) {
    console.error("AI property search failed:", err);

    setAiError(
      err.response?.data?.message ||
      (typeof err.response?.data === "string"
        ? err.response.data
        : "") ||
      "AI search failed. Please try again."
    );
  } finally {
    setAiSearching(false);
  }
};


  const handleReset = () => {
    setFilters(initialFilters);
    setPage(0);
    fetchProperties(initialFilters, 0);
  };

  const changePage = (nextPage) => {
    if (nextPage < 0 || nextPage >= totalPages || loading) return;

    fetchProperties(filters, nextPage);
  };

  const toggleFavorite = async (event, propertyId) => {
    event.preventDefault();
    event.stopPropagation();

    if (favoriteLoadingId !== null) return;

    const id = String(propertyId);
    const isFavorite = favoriteIds.includes(id);

    try {
      setFavoriteLoadingId(propertyId);
      setFavoriteError("");

      if (isFavorite) {
        await favoriteService.removeFavorite(propertyId);

        setFavoriteIds((previous) =>
          previous.filter((favoriteId) => favoriteId !== id)
        );
      } else {
        await favoriteService.addFavorite(propertyId);

        setFavoriteIds((previous) =>
          previous.includes(id) ? previous : [...previous, id]
        );
      }
    } catch (err) {
      console.error("Unable to update favorite:", err);

      setFavoriteError(
        err.response?.data?.message ||
          "Unable to update favorite. Please try again."
      );
    } finally {
      setFavoriteLoadingId(null);
    }
  };

  return (
    <main className="property-search-page">
      <header className="property-search-header">
        <div>
          <Link className="property-search-brand" to="/customer/search">
            RealEstateAI
          </Link>

          <h1>Find Your Next Home</h1>
          <p>Discover properties that fit your lifestyle and budget.</p>
        </div>

        <nav className="property-search-nav">
          <Link to="/customer/favorites">My Favorites</Link>
          <Link to="/customer/inquiries">My Inquiries</Link>
          <Link to="/customer/become-agent">Become an Agent</Link>
          <Link to="/customer/profile">My Profile</Link>

          <button
            type="button"
            className="property-signout-button"
            onClick={handleSignOut}
          >
            Sign Out
          </button>
        </nav>
      </header>
     
      <section className="property-search-content">
        
<section className="ai-property-search">
  <div className="ai-property-search-heading">
    <h2>✨ AI Property Search</h2>
    <p>
      Describe your ideal home in your own words.
      AI will find matching properties for you.
    </p>
  </div>

  <form onSubmit={handleAISearch} className="ai-property-search-form">
    <input
      type="text"
      value={aiPrompt}
      onChange={(event) => setAiPrompt(event.target.value)}
      placeholder="e.g. Find a 2 BHK apartment in Thane under 80 lakh"
      aria-label="Describe the property you are looking for"
      disabled={aiSearching}
    />

    <button type="submit" disabled={aiSearching || !aiPrompt.trim()}>
      {aiSearching ? "Finding properties..." : "Search with AI"}
    </button>
  </form>

  {aiError && (
    <p className="ai-property-search-error" role="alert">
      {aiError}
    </p>
  )}
</section>

        <form className="property-filter-panel" onSubmit={handleSearch}>
          <div className="property-filter-heading">
            <div>
              <h2>Search Properties</h2>
              <p>Refine your search using the filters below.</p>
            </div>
          </div>

          <div className="property-filter-grid">
            <div className="property-filter-field">
              <label htmlFor="location">Location</label>
              <input
                id="location"
                name="location"
                type="text"
                placeholder="e.g. Mumbai"
                value={filters.location}
                onChange={handleChange}
              />
            </div>

            <div className="property-filter-field">
              <label htmlFor="bedroom">Bedrooms</label>
              <select
                id="bedroom"
                name="bedroom"
                value={filters.bedroom}
                onChange={handleChange}
              >
                <option value="">Any number</option>
                <option value="1">1 bedroom</option>
                <option value="2">2 bedrooms</option>
                <option value="3">3 bedrooms</option>
                <option value="4">4 bedrooms</option>
                <option value="5">5 bedrooms</option>
              </select>
            </div>

            <div className="property-filter-field">
              <label htmlFor="minPrice">Minimum price (₹)</label>
              <input
                id="minPrice"
                name="minPrice"
                type="number"
                min="0"
                placeholder="No minimum"
                value={filters.minPrice}
                onChange={handleChange}
              />
            </div>

            <div className="property-filter-field">
              <label htmlFor="maxPrice">Maximum price (₹)</label>
              <input
                id="maxPrice"
                name="maxPrice"
                type="number"
                min="0"
                placeholder="No maximum"
                value={filters.maxPrice}
                onChange={handleChange}
              />
            </div>

            <div className="property-filter-field">
              <label htmlFor="sortBy">Sort by</label>
              <select
                id="sortBy"
                name="sortBy"
                value={filters.sortBy}
                onChange={handleChange}
              >
                <option value="createdAt">Recently added</option>
                <option value="price">Price</option>
                <option value="bedrooms">Bedrooms</option>
              </select>
            </div>

            <div className="property-filter-field">
              <label htmlFor="sortOrder">Sort order</label>
              <select
                id="sortOrder"
                name="sortOrder"
                value={filters.sortOrder}
                onChange={handleChange}
              >
                <option value="desc">Descending</option>
                <option value="asc">Ascending</option>
              </select>
            </div>
          </div>

          <div className="property-filter-actions">
            <button
              type="button"
              className="property-reset-button"
              onClick={handleReset}
              disabled={loading}
            >
              Reset filters
            </button>

            <button
              type="submit"
              className="property-search-button"
              disabled={loading}
            >
              {loading ? "Searching..." : "Search Properties"}
            </button>
          </div>
        </form>

        <section className="property-results-section">
          <div className="property-results-heading">
            <h2>Available Properties</h2>

            {!loading && !error && (
              <span>{totalElements} properties found</span>
            )}
          </div>

          {favoriteError && (
            <div className="property-search-error" role="alert">
              <p>{favoriteError}</p>
              <button
                type="button"
                onClick={() => setFavoriteError("")}
              >
                Dismiss
              </button>
            </div>
          )}

          {error && (
            <div className="property-search-error" role="alert">
              <p>{error}</p>
              <button
                type="button"
                onClick={() => fetchProperties(filters, page)}
              >
                Try again
              </button>
            </div>
          )}

          {loading && (
            <div className="property-search-message" role="status">
              Loading properties...
            </div>
          )}

          {!loading && !error && properties.length === 0 && (
            <div className="property-search-message">
              <h3>No properties found</h3>
              <p>
                Try changing your filters or searching another location.
              </p>
            </div>
          )}

          {!loading && !error && properties.length > 0 && (
            <>
              <div className="property-results-grid">
                {properties.map((property) => {
                  const isFavorite = favoriteIds.includes(
                    String(property.id)
                  );

                  return (
                    <article
                      className="property-result-card"
                      key={property.id}
                    >
                      <div className="property-card-visual">
                        {property.imageUrl ? (
                          <img
                            className="property-card-image"
                            src={property.imageUrl}
                            alt={
                              property.title ||
                              `Property ${property.id}`
                            }
                            loading="lazy"
                            onError={(event) => {
                              event.currentTarget.style.display = "none";
                            }}
                          />
                        ) : (
                          <span className="property-card-placeholder">
                            Property #{property.id}
                          </span>
                        )}

                        <span className="property-card-type">
                          {formatLabel(property.propertyType)}
                        </span>

                        <span className="property-card-status">
                          {formatLabel(property.status)}
                        </span>

                        <button
                          type="button"
                          className={`property-favorite-button ${
                            isFavorite ? "is-favorite" : ""
                          }`}
                          aria-label={
                            isFavorite
                              ? "Remove from favorites"
                              : "Add to favorites"
                          }
                          aria-pressed={isFavorite}
                          disabled={favoriteLoadingId !== null}
                          onClick={(event) =>
                            toggleFavorite(event, property.id)
                          }
                        >
                          {favoriteLoadingId === property.id
                            ? "..."
                            : isFavorite
                              ? "♥"
                              : "♡"}
                        </button>
                      </div>

                      <Link
                        to={`/customer/properties/${property.id}`}
                        className="property-card-details-link"
                      >
                        <div className="property-card-body">
                          <p className="property-card-price">
                            {formatPrice(property.price)}
                          </p>

                          <h3>
                            {property.title || "Untitled Property"}
                          </h3>

                          <p className="property-card-location">
                            {property.location || "Location unavailable"}
                          </p>

                          {property.description && (
                            <p className="property-card-description">
                              {property.description}
                            </p>
                          )}

                          <div className="property-card-details">
                            <span>
                              {property.bedrooms ?? "—"} bedrooms
                            </span>
                            <span>
                              {property.bathrooms ?? "—"} bathrooms
                            </span>
                            <span>
                              {property.area != null
                                ? `${property.area} area units`
                                : "Area unavailable"}
                            </span>
                          </div>

                          <span className="property-card-view-link">
                            View Property Details →
                          </span>
                        </div>
                      </Link>
                    </article>
                  );
                })}
              </div>

              <div className="property-pagination">
                <button
                  type="button"
                  onClick={() => changePage(page - 1)}
                  disabled={page <= 0 || loading}
                >
                  Previous
                </button>

                <span>
                  Page {page + 1} of {Math.max(totalPages, 1)}
                </span>

                <button
                  type="button"
                  onClick={() => changePage(page + 1)}
                  disabled={page + 1 >= totalPages || loading}
                >
                  Next
                </button>
              </div>
            </>
          )}
        </section>
      </section>
    </main>
  );
}
