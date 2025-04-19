import AddCommentForm from "@/components/AddCommentForm";
import CommentsList from "@/components/CommentsList";
import LoadingSpinner from "@/components/LoadingSpinner";
import PeopleAlsoBought from "@/components/PeopleAlsoBought";
import ProductInfo from "@/components/ProductInfo";
import ProductNotFound from "@/components/ProductNotFound";
import { useProductStore } from "@/stores/useProductStore";
import { useEffect } from "react";
import { useParams } from "react-router-dom";

const ProductDetails: React.FC = () => {
  // Type the URL parameter so id is a string.
  const { id } = useParams<{ id: string }>();
  const { selectedProduct, fetchProductById, loading, recommendedProducts, fetchRecommendedProducts } = useProductStore();

  useEffect(() => {
    if (id) {
      fetchProductById(id);
      fetchRecommendedProducts();
    }
  }, [id, fetchProductById]);

  if (loading) return <LoadingSpinner />
  
  // If no product is loaded or if the selected product does not match the id, display a not found message.
  if (!selectedProduct || selectedProduct._id !== id) return <ProductNotFound />;

  return (
    <div className="container mx-auto flex flex-col">
      <ProductInfo product={selectedProduct} />
      <PeopleAlsoBought recommended={recommendedProducts} />
      <div className="max-w-2xl p-4 pt-10">
        <h1 className="text-2xl font-bold mb-8">Reviews</h1>
        <AddCommentForm productId={selectedProduct._id} />
        <CommentsList productId={selectedProduct._id} />
      </div>
    </div>
  );
};

export default ProductDetails;
