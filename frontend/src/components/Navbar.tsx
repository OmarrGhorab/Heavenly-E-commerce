import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Heart,
  ShoppingBag,
  User,
  Menu,
  X,
  ChevronDown,
  LogOut,
  PencilOff,
  BookA,
  LayoutDashboard,
} from "lucide-react";
import { useUserStore } from "../stores/useUserStore";
import { useCartStore } from "@/stores/useCartStore";
import { useFavouriteStore } from "@/stores/useFavouriteStore";
import NotificationBadge from "./Notification";
import { AnimatePresence, motion } from "framer-motion";

const Navbar: React.FC = () => {
  const { user, logout } = useUserStore();
  const [showProducts, setShowProducts] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { items } = useCartStore();
  const { items: favouriteItems } = useFavouriteStore();

  const toggleProducts = () => setShowProducts(!showProducts);
  const toggleMenu = () => setShowMenu(!showMenu);
  const toggleProfile = () => setShowProfile(!showProfile);
  const handleLogout = () => logout();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setShowMenu(false);
        setShowProfile(false);
      }
    };
  
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);
  

  const NavLink = ({ to, children }: { to: string; children: string }) => (
    <Link
      to={to}
      className="text-gray-500 hover:text-cyan-400 transition-colors duration-200"
    >
      {children}
    </Link>
  );

  return (
    <nav
      className={`backdrop-blur-xl py-3 px-6 font-marcellus w-full z-[999] shadow-2xl shadow-indigo-900/10 fixed ${
        isScrolled ? "bg-gray-900/95" : "bg-transparent"
      }`}
    >
      {/* Desktop Navigation */}
      <div className="hidden md:flex justify-between items-center max-w-7xl mx-auto">
        <div className="flex space-x-8 ">
          <NavLink to="/products">All</NavLink>
          <NavLink to="/products?categories=women">Women</NavLink>
          <NavLink to="/products?categories=men">Men</NavLink>
          <NavLink to="/products?categories=kids">Kids</NavLink>
        </div>

        <Link to="/" className="text-3xl font-bold">
          <span className="bg-gradient-to-r from-cyan-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
            HEAVENLY
          </span>
        </Link>

        <div className="flex items-center space-x-6">
          {user && <NotificationBadge aria-label="Notifications" />}

          <div className="relative">
            <Link to="/wishlist">
              <Heart
                aria-label="Wishlist"
                className="text-gray-500 hover:text-cyan-400 transition-colors duration-200"
                size={24}
              />
              {favouriteItems.length > 0 && (
                <span className="absolute -top-3 -right-3 bg-cyan-500 text-gray-900 text-xs font-bold px-2 py-1 rounded-full">
                  {favouriteItems.length}
                </span>
              )}
            </Link>
          </div>

          <div className="relative">
            <Link to="/cart">
              <ShoppingBag
                aria-label="Cart"
                className="text-gray-500 hover:text-indigo-400 transition-colors duration-200"
                size={24}
              />
              {items.length > 0 && (
                <span className="absolute -top-3 -right-3 bg-indigo-500 text-gray-900 text-xs font-bold px-2 py-1 rounded-full">
                  {items.length}
                </span>
              )}
            </Link>
          </div>

          <div className="relative">
            {!user ? (
              <Link to="/login">
                <User
                  className="text-gray-700 hover:text-cyan-400 transition-colors duration-200"
                  size={24}
                />
              </Link>
            ) : (
              <div className="relative cursor-pointer" onClick={toggleProfile}>
                <button
                  onClick={toggleProfile}
                  className="relative cursor-pointer focus:outline-none"
                  aria-expanded={showProfile}
                  aria-label="Open Profile Menu"
                >
                  <img
                    src={user.photo}
                    alt="Profile"
                    className="w-9 h-9 rounded-full border-2 object-cover border-gray-700 hover:border-cyan-400 transition-all duration-200"
                    aria-label="Profile image"
                  />
                </button>
                {showProfile && (
                  <div className="absolute right-0 mt-3 bg-gray-800 border border-gray-700 rounded-xl shadow-lg w-52 overflow-hidden">
                    {user?.role === "admin" && (
                      <Link
                        to="/dashboard"
                        className="flex items-center px-4 py-3 hover:bg-gray-700/50"
                        aria-label="dashboard"
                      >
                        <LayoutDashboard className="mr-3" size={18} />
                        Dashboard
                      </Link>
                    )}
                    <Link
                      to="/edit"
                      className="flex items-center px-4 py-3 hover:bg-gray-700/50"
                      aria-label="edit"
                    >
                      <PencilOff className="mr-3" size={18} />
                      Edit Profile
                    </Link>
                    <Link
                      to="/all-orders"
                      className="flex items-center px-4 py-3 hover:bg-gray-700/50"
                      aria-label="orders"
                    >
                      <BookA className="mr-3" size={18} />
                      Orders
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center px-4 py-3 hover:bg-gray-700/50"
                      aria-label="logout"
                    >
                      <LogOut className="mr-3" size={18} />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold">
          <span className="bg-gradient-to-r from-cyan-400 to-indigo-400 bg-clip-text text-transparent">
            HEAVENLY
          </span>
        </Link>

        <div className="flex items-center space-x-4">
          <div className="relative">
            <Link to="/cart">
              <ShoppingBag className="text-gray-500" size={22} aria-label="Cart" />
              {items.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-indigo-500 text-gray-900 text-xs font-bold px-2 py-1 rounded-full">
                  {items.length}
                </span>
              )}
            </Link>
          </div>
          {user && <NotificationBadge aria-label="Notifications"/>}
          <button
              onClick={toggleMenu}
              className="p-2"
              aria-expanded={showMenu}
              aria-label={showMenu ? "Close Menu" : "Open Menu"}
            >
              {showMenu ? <X size={24} /> : <Menu size={24} />}
            </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {showMenu && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            aria-label="Menu"
            className="md:hidden absolute top-full left-0 right-0 bg-gray-800/95 backdrop-blur-2xl border-t border-gray-700"
          >
            <div className="px-4 py-2">
              <button
                onClick={toggleProducts}
                className="w-full flex justify-between items-center py-3 text-gray-300"
              >
                <span>Shop Categories</span>
                <ChevronDown
                  className={`transition-transform ${showProducts ? "rotate-180" : ""}`}
                  size={18}
                />
              </button>

              {/* Animated Dropdown for Categories */}
              <AnimatePresence>
                {showProducts && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="pl-4 overflow-hidden"
                  >
                    <Link
                      to="/products"
                      aria-label="products"
                      className="block py-2 text-gray-400 hover:text-cyan-400"
                    >
                      All Products
                    </Link>
                    <Link
                      to="/products?categories=women"
                      aria-label="women"
                      className="block py-2 text-gray-400 hover:text-cyan-400"
                    >
                      Women's Collection
                    </Link>
                    <Link
                      to="/products?categories=men"
                      aria-label="men"
                      className="block py-2 text-gray-400 hover:text-cyan-400"
                    >
                      Men's Collection
                    </Link>
                    <Link
                      to="/products?categories=women"
                      aria-label="kids"
                      className="block py-2 text-gray-400 hover:text-cyan-400"
                    >
                      Kids' Collection
                    </Link>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <div className="border-t border-gray-700">
              {user ? (
                <>
                  <div className="px-4 py-3 flex items-center space-x-3">
                    <img
                      src={user.photo}
                      alt="Profile"
                      aria-label="Profile image"
                      className="w-10 h-10 rounded-full border-2 border-gray-600 object-cover"
                    />
                    <div>
                      <p className="font-medium text-gray-100">{user.username}</p>
                      <p className="text-sm text-gray-400">{user.email}</p>
                    </div>
                  </div>

                  <div className="px-4 pb-2">
                    {user?.role === "admin" && (
                      <Link
                        to="/dashboard"
                        aria-label="dashboard"
                        className="flex items-center py-2 px-2 hover:bg-gray-700/50 rounded-lg"
                      >
                        <LayoutDashboard className="mr-3" size={18} />
                        Dashboard
                      </Link>
                    )}
                    <Link
                      to="/edit"
                      aria-label="edit"
                      className="flex items-center py-2 px-2 hover:bg-gray-700/50 rounded-lg"
                    >
                      <PencilOff className="mr-3" size={18} />
                      Edit Profile
                    </Link>
                    <Link
                      to="/all-orders"
                      aria-label="orders"
                      className="flex items-center py-2 px-2 hover:bg-gray-700/50 rounded-lg"
                    >
                      <BookA className="mr-3" size={18} />
                      Orders
                    </Link>
                    <button
                      onClick={handleLogout}
                      aria-label="logout"
                      className="w-full flex items-center py-2 px-2 hover:bg-gray-700/50 rounded-lg"
                    >
                      <LogOut className="mr-3" size={18} />
                      Logout
                    </button>
                  </div>
                </>
              ) : (
                <Link
                  to="/login"
                  className="flex items-center px-4 py-3 hover:bg-gray-700/50"
                >
                  <User className="mr-3" size={18} />
                  Sign In / Register
                </Link>
              )}
            </div>
            <div className="border-t border-gray-700 px-4 py-3">
              <Link
                to="/wishlist"
                className="flex items-center text-gray-300 hover:text-cyan-400"
                aria-label="Wishlist"
              >
                <Heart className="mr-3" size={18} />
                Wishlist
                {favouriteItems.length > 0 && (
                  <span className="ml-auto bg-cyan-500/20 text-cyan-400 text-xs px-2 py-1 rounded-full">
                    {favouriteItems.length}
                  </span>
                )}
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
