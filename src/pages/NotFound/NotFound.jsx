import { Link } from 'react-router-dom';
import logo from '../../assets/KEAcolor.png';
import './NotFound.css';

const NotFound = () => {
  return (
    <main className="not-found-page">
      <div className="not-found-card">
        <img src={logo} alt="KEA Bengaluru" className="not-found-logo" />
        <p className="not-found-code">404</p>
        <h1 className="not-found-title">Page not found</h1>
        <p className="not-found-message">
          The page you are looking for does not exist or may have been moved.
        </p>
        <div className="not-found-actions">
          <Link to="/" className="not-found-btn not-found-btn--primary">
            Back to Home
          </Link>
          <Link to="/about" className="not-found-btn not-found-btn--secondary">
            About KEA
          </Link>
        </div>
      </div>
    </main>
  );
};

export default NotFound;
