// src/components/Card.js
import PropTypes from "prop-types"; // Import PropTypes for props validation

const Card = ({ title, description, onClick, image }) => {
  return (
    <div
      className="card basis-72 max-w-[300px] m-4 bg-[var(--container-bg-color)] cursor-pointer hover:scale-[1.01] rounded-lg shadow-md"
      onClick={onClick}
    >
      {image && (
        <img
          src={image}
          alt={`${title} logo`}
          className="card-logo w-full aspect-square rounded"
        />
      )}
      <h2 className="px-1">{title}</h2>
      <p className="px-1">{description}</p>
    </div>
  );
};

// Define prop types for validation
Card.propTypes = {
  title: PropTypes.string.isRequired, // title must be a string and is required
  description: PropTypes.string.isRequired, // description must be a string and is required
  onClick: PropTypes.func.isRequired, // onClick must be a function and is required
  image: PropTypes.string, // image is optional, but if passed, it must be a string (URL)
};

export default Card;
