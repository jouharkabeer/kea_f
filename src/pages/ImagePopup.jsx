import React from "react";
import "./ImagePopup.css";

const ImagePopup = ({ show, handleClose, image }) => {
  if (!show) return null;

  return (
    <div className="image-popup-overlay" onClick={handleClose}>
      <div className="image-popup-content" onClick={(e) => e.stopPropagation()}>
        <img src={image} alt="Full View" className="popup-image" />
        <button className="close-btn" onClick={handleClose}>
          Close
        </button>
      </div>
    </div>
  );
};

export default ImagePopup;
