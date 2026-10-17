import "./CustomerDashboard.css";
import { Link } from "react-router-dom";

export default function CustomerDashboard() {
  return (
    <main className="customer-dashboard">
      <header className="dashboard-header">
        <div>
          <h1>RealEstateAI</h1>
          <p>Customer Dashboard</p>
        </div>

        <nav className="dashboard-nav">
          <Link to="/customer/search">Search Properties</Link>
          <Link to="/customer/profile">My Profile</Link>
        </nav>
      </header>

      <section className="dashboard-content">
        <h2>Welcome to RealEstateAI</h2>
        <p>
          Find properties and manage your account from one place.
        </p>

        <div className="dashboard-cards">
          <Link
            to="/customer/search"
            className="dashboard-card"
          >
            <h3>Search Properties</h3>
            <p>Explore properties that match your needs.</p>
          </Link>

          <Link
            to="/customer/profile"
            className="dashboard-card"
          >
            <h3>My Profile</h3>
            <p>View and update your phone number and address.</p>
          </Link>
        </div>
      </section>
    </main>
  );
}
