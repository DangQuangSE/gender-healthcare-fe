import "./Logo.css";
import { Link } from "react-router-dom";

const Logo = () => {
  const handleScrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <div className="logo">
      <Link to="/" className="logo-link" onClick={handleScrollToTop}>
        <img
          src="/logostc.png"
          alt="Gender Healthcare Logo"
          className="logo-img"
          style={{ height: 60 }}
        />
      </Link>
    </div>
  );
};

export default Logo;
