import React, { useEffect } from "react";
import "./SponserModal.css";

const SponsorModal = ({ show, handleClose, sponsor }) => {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        handleClose();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [show, handleClose]);

  if (!show || !sponsor) return null;

  return (
    <div className="sponsor-modal-overlay" onClick={handleClose}>
      <div
        className="sponsor-modal-card"
        onClick={(e) => e.stopPropagation()} // prevent closing on card click
      >
        <h3 className="sponsor-name">{sponsor.brand}</h3>

        <img
          src={sponsor.image || "https://via.placeholder.com/120"}
          alt={sponsor.name}
          className="sponsor-image"
        />
        <p className="sponsor-company">{sponsor.company}</p>
        <p className="sponsor-description">{sponsor.description}</p>
        <button className="close-btn-sponser" onClick={handleClose}>
          Close
        </button>
      </div>
    </div>
  );
};

export default SponsorModal;
