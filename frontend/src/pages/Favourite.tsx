import WishList from "@/components/WishList";
import { useFavouriteStore } from "@/stores/useFavouriteStore"
import { useEffect } from "react";

const Favourite = () => {
  const { items, fetchFavouriteItems } = useFavouriteStore();
  useEffect(() => {
    fetchFavouriteItems();
  }, [fetchFavouriteItems])
  return (
    <div className="container flex mx-auto">
      <WishList Items={items} />
    </div>
  )
}

export default Favourite