import  { lazy } from 'react';

// Lazy loading components
export const Home = lazy(() => import('../pages/Home'));
export const Products = lazy(() => import('../pages/Products'));
export const ProductDetails = lazy(() => import('../pages/ProductDetails'));
export const AuthLayout = lazy(() => import('../_auth/AuthLayout'));
export const Login = lazy(() => import('../_auth/forms/Login'));
export const Signup = lazy(() => import('../_auth/forms/Signup'));
export const VerifyEmail = lazy(() => import('../_auth/forms/VerifyEmail'));
export const ForgotPassword = lazy(() => import('../_auth/forms/ForgotPassword'));
export const ResetPassword = lazy(() => import('../_auth/forms/ResetPassword'));
export const Edit = lazy(() => import('../pages/Edit'));
export const Cart = lazy(() => import('../pages/Cart'));
export const Favourite = lazy(() => import('../pages/Favourite'));
export const Dashboard = lazy(() => import('../admin_panel/admin_pages/Dashboard'));
export const AdminAllOrders = lazy(() => import('../admin_panel/admin_pages/AdminAllOrders'));
export const DashboardLayout = lazy(() => import('../admin_panel/DashboardLayout'));
export const Navbar = lazy(() => import('./Navbar'));
export const Footer = lazy(() => import('./Footer'));
export const RootLayout = lazy(() => import('../pages/RootLayout'));
export const PageNotFound = lazy(() => import('../pages/PageNotFound'));
export const ShippingForm = lazy(() => import('../pages/ShippingForm'));
export const SuccessPage = lazy(() => import('../pages/SuccessPage'));