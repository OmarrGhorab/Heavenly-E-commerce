import { useProductStore } from "@/stores/useProductStore";
import { useEffect } from "react";
import Women from "../../public/woman.webp";
import Men from "../../public/man.webp";
import Kids from "../../public/kids.webp";
import CategoryItem from "@/components/CategoryItem";
import FeaturedProducts from "@/components/FeaturedProducts";
import TopRatings from "@/components/TopRatings";

interface Categories {
  href: string;
  name: string;
  imageUrl: string;
  alt: string;
}

const categories: Categories[] = [
  { href: `/products?categories=women`, name: "Women", imageUrl: Women, alt: "Fashion collection for women" },
  { href: `/products?categories=men`, name: "Men", imageUrl: Men, alt: "Fashion collection for men" },
  { href: `/products?categories=kids`, name: "Kids", imageUrl: Kids, alt: "Fashion collection for kids" },
];


const Home = () => {
  const { fetchFeaturedProducts, loading, featuredProducts, topProducts, topRatingProducts } = useProductStore();

  useEffect(() => {
    fetchFeaturedProducts();
    topRatingProducts();
  }, [fetchFeaturedProducts, topRatingProducts]);

  return (
    <div className="flex flex-col flex-1 min-h-screen mx-auto py-16 px-4">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto w-full mb-24" aria-labelledby="hero-title">
        <h1 className='text-center text-5xl sm:text-6xl md:text-7xl font-bold text-primary font-marcellus mb-6 tracking-tighter'>
          Explore Our Collections
        </h1>
        <p className='text-center text-2xl text-gray-600 mb-12 font-light font-sans leading-relaxed'>
          Discover Sustainable Fashion That Cares for Tomorrow
        </p>
        
        {/* Categories Grid */}
        <div className='grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-6xl mx-auto'>
          {categories.map((category) => (
            <CategoryItem category={category} key={category.name} />
          ))}
        </div>
      </section>

      {/* Featured Products */}
      {!loading && featuredProducts.length > 0 && (
        <section className="bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <FeaturedProducts featuredProducts={featuredProducts} />
          </div>
        </section>
      )}

      {/* Top Ratings */}
      {topProducts.length > 0 && (
        <section className="bg-gradient-to-b from-indigo-50 to-white">
          <div className="max-w-7xl mx-auto">
            <TopRatings topProducts={topProducts} />
          </div>
        </section>
      )}
    </div>
  )
}

export default Home;
