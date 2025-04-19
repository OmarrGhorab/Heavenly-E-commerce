import { Link } from "react-router-dom";

interface Category {
  href: string;
  imageUrl: string;
  name: string;
  alt: string;
}

interface CategoryItemProps {
  category: Category;
}

const CategoryItem: React.FC<CategoryItemProps> = ({ category }) => {
  return (
    <div 
      className="relative overflow-hidden rounded-2xl group" 
      tabIndex={0} 
      aria-label={`Explore ${category.name} category`}
    >
      <Link to={category.href} aria-labelledby={`category-title-${category.name}`}>
        <div className="w-full h-full cursor-pointer relative">
          {/* Dark Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black opacity-60 transition-opacity duration-300 group-hover:opacity-80 pointer-events-none z-10" />
          
          {/* Category Image */}
          <img
            src={category.imageUrl}
            alt={category.alt}  
            className="w-full h-full object-cover object-center transition-transform duration-500 ease-out group-hover:scale-110"
            loading="lazy"
          />

          {/* Text Content */}
          <figure className="absolute bottom-6 left-6 z-20" aria-labelledby={`category-title-${category.name}`}>
            <figcaption>
              <h2 id={`category-title-${category.name}`} className="text-white text-3xl font-bold drop-shadow-lg">
                {category.name}
              </h2>
              <p className="text-gray-200 text-sm drop-shadow-lg">Explore {category.name}</p>
            </figcaption>
          </figure>
        </div>
      </Link>
    </div>
  );
};

export default CategoryItem;
