import { Link } from 'react-router-dom';

const ProductNotFound = () => {

  return (
    <div className="flex items-center justify-center bg-white">
      <div className="max-w-[600px] mx-auto text-center animate-fade-in">
        <div>
          <svg 
            viewBox="0 0 512 512" 
            className="w-64 h-64 mx-auto text-gray-100"
          >
            <circle cx="256" cy="256" r="256" fill="currentColor" />
            <path
              d="M368 192H144c-8.8 0-16 7.2-16 16v192c0 8.8 7.2 16 16 16h224c8.8 0 16-7.2 16-16V208c0-8.8-7.2-16-16-16z"
              className="text-gray-200"
              fill="currentColor"
            />
            <path
              d="M368 160H144c-17.7 0-32 14.3-32 32v16h288v-16c0-17.7-14.3-32-32-32z"
              className="text-gray-300"
              fill="currentColor"
            />
            <path
              d="M256 328c-33.1 0-60-26.9-60-60s26.9-60 60-60 60 26.9 60 60-26.9 60-60 60z"
              className="text-white"
              fill="currentColor"
            />
            <path
              d="M316 268h-40v-40c0-11-9-20-20-20s-20 9-20 20v40h-40c-11 0-20 9-20 20s9 20 20 20h40v40c0 11 9 20 20 20s20-9 20-20v-40h40c11 0 20-9 20-20s-9-20-20-20z"
              className="text-rose-500"
              fill="currentColor"
            />
          </svg>
        </div>
        
        <h1 className="text-4xl font-bold text-gray-800 mb-6 md:text-5xl">
          Product Not Found
        </h1>
        
        <p className="text-gray-600 text-lg mb-8 max-w-[500px] mx-auto leading-relaxed">
          Oops! The product you're looking for doesn't exist or may have been removed.
        </p>
        
        <Link
          to="/"
          className="inline-block bg-rose-500 hover:bg-rose-600 text-white font-semibold px-8 py-3 rounded-lg transition-colors duration-300 shadow-lg hover:shadow-md"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
};

export default ProductNotFound;