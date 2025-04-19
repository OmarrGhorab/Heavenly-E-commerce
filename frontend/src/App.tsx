import { Routes, Route, Navigate } from "react-router-dom";
import { Suspense, useEffect } from "react";
import LoadingSpinner from "./components/LoadingSpinner";
import { 
  Home, 
  Products, 
  ProductDetails, 
  Login, 
  Signup, 
  VerifyEmail, 
  ForgotPassword, 
  ResetPassword, 
  Edit, 
  Cart, 
  Favourite, 
  Dashboard, 
  AdminAllOrders, 
  AuthLayout, 
  DashboardLayout, 
  RootLayout,
  PageNotFound,
  ShippingForm,
  SuccessPage
} from "./components/LazyComponents";
import { Toaster } from "react-hot-toast";
import { useUserStore } from "./stores/useUserStore";
import { useFavouriteStore } from "./stores/useFavouriteStore";
import { useCartStore } from "./stores/useCartStore";
import ScrollToTop from "./components/ScrollToTop";

function App() {
  const { user, checkAuth, checkingAuth } = useUserStore();
  const { fetchFavouriteItems } = useFavouriteStore();
  const { getCartItems } = useCartStore();
  const isAdmin = user?.role === "admin";
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);
  

  useEffect(() => {
    if(user) {
      fetchFavouriteItems();
      getCartItems();
    }
  }, [fetchFavouriteItems, user, getCartItems]); 
  
  
  if (checkingAuth) return <LoadingSpinner />;  
  
  return (
    <div className="min-h-screen flex flex-col">
      <Suspense fallback={<LoadingSpinner />}>
      <ScrollToTop />
        <Routes>
          {/* Public Routes */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={ <Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forget-password" element={ <ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            <Route path="/verify-email/:token" element={ <VerifyEmail /> } />
          </Route>

          {/* Private Routes */}
          <Route element={<RootLayout />}>
            <Route index element={<Home />} />
            <Route path="/products" element={<Products />} />
            <Route path="/products/:id" element={<ProductDetails />} />
            <Route path="/edit" element={<Edit />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<ShippingForm />} />
            <Route path="/wishlist" element={<Favourite />} />
            <Route path="/order-success" element={<SuccessPage />} />
            <Route path="/all-orders" element={<AdminAllOrders />} />
            {/* Admin Routes */}
              <Route
              path="/dashboard"
              element={isAdmin ? <DashboardLayout /> : <Navigate to="/login" />} // Redirects to login if not admin
            >
              <Route index element={<Dashboard />} /> {/* Default route within dashboard */}
            </Route>
          </Route>


          {/* Other Routes */}
          <Route path="*" element={<PageNotFound />} />
        </Routes>
      </Suspense>

      <Toaster />
    </div>
  );
}

export default App;
