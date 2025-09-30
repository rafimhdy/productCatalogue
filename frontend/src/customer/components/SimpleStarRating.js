import React from 'react';
import './css/SimpleStarRating.css';

const SimpleStarRating = ({ rating = 0, onClick = null, onRatingChange = null, size = 20, readonly = false }) => {
  // Support both onClick and onRatingChange props for backward compatibility
  const handleRatingChange = onRatingChange || onClick;
  const isInteractive = !readonly && handleRatingChange !== null;

  const handleStarClick = (starValue) => {
    if (isInteractive) {
      handleRatingChange(starValue);
    }
  };

  const renderStar = (starValue) => {
    const isFilled = starValue <= rating;
    return (
      <span
        key={starValue}
        className={`star ${isFilled ? 'filled' : ''} ${isInteractive ? 'interactive' : ''}`}
        onClick={() => handleStarClick(starValue)}
        style={{ fontSize: `${size}px`, cursor: isInteractive ? 'pointer' : 'default' }}
      >
        ★
      </span>
    );
  };

  return (
    <div className="simple-star-rating">
      {[1, 2, 3, 4, 5].map(renderStar)}
    </div>
  );
};

export default SimpleStarRating;
