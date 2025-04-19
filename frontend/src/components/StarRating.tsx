import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa";

type StarRatingProps = {
  rating: number; 
  maxStars?: number; 
};

const StarRating = ({ rating, maxStars = 5 }: StarRatingProps) => {
  const stars = [];

  for (let i = 0; i < maxStars; i++) {
    if (rating >= i + 1) {
      stars.push(<FaStar key={i} className="text-yellow-400" />);
    } else if (rating >= i + 0.5) {
      stars.push(<FaStarHalfAlt key={i} className="text-yellow-400" />);
    } else {
      stars.push(<FaRegStar key={i} className="text-gray-300" />);
    }
  }

  return <div className="flex">{stars}</div>;
};

export default StarRating;