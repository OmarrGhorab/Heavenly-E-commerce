import { BarChart, PlusCircle, ShoppingBasket, ArrowRight } from "lucide-react";
import { useState } from "react";
import CreateProductForm from "../../components/CreateProductForm";
import ProductList from "../../components/ProductList";
import AnalyticsTab from "../../components/AnalyticsTab";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

type ActiveTab = {
  id: string;
  label: string;
  icon: JSX.Element;
  color: string;
};

const tabs: ActiveTab[] = [
  { 
    id: "create", 
    label: "Create Product", 
    icon: <PlusCircle className="w-5 h-5" />,
    color: "from-violet-600 to-indigo-500"
  },
  { 
    id: "products", 
    label: "Product Inventory", 
    icon: <ShoppingBasket className="w-5 h-5" />,
    color: "from-emerald-600 to-teal-500"
  },
  { 
    id: "analytics", 
    label: "Business Analytics", 
    icon: <BarChart className="w-5 h-5" />,
    color: "from-amber-600 to-orange-500"
  },
];


const Dashboard = () => {
  const [activeTab, setActiveTab] = useState<string>("create");
  const navigate = useNavigate();
  const handleClick = () => {
    navigate('/', { replace: true })
  }
  return (
    <div className="min-h-screen relative w-full bg-gradient-to-br from-gray-50 to-gray-100/50 container">
      <div className="relative py-8 w-[100%] px-4 sm:px-6 lg:px-8">
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <div className="max-w-7xl mx-auto">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
                <div>
                  <motion.h1
                    className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-800 to-gray-600"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.4 }}
                  >
                    Dashboard Overview
                  </motion.h1>
                  <p className="mt-2 text-lg text-gray-600">Welcome back, Administrator! Here's your daily summary</p>
                </div>
                <button onClick={handleClick} className="mt-4 md:mt-0 flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-300">
                  <span className="text-gray-700 font-medium">Quick Actions</span>
                  <ArrowRight className="w-4 h-4 text-gray-500" />
                </button>
              </div>

              {/* Tab Navigation */}
              <div className="flex flex-col justify-center space-y-4 md:flex-row md:space-y-0 md:space-x-4 mb-8">
                {tabs.map((tab) => (
                  <motion.button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      "flex items-center gap-3 px-6 py-4 rounded-xl transition-all duration-300 relative overflow-hidden",
                      activeTab === tab.id 
                        ? "bg-gradient-to-r text-white shadow-lg"
                        : "bg-white hover:bg-gray-50 text-gray-600 shadow-sm hover:shadow-md"
                    , tab.color)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <motion.div
                      animate={{ rotate: activeTab === tab.id ? [0, 20, -20, 0] : 0 }}
                      transition={{ duration: 0.6 }}
                    >
                      {tab.icon}
                    </motion.div>
                    <span className="font-medium">{tab.label}</span>
                    {activeTab === tab.id && (
                      <motion.div
                        className="absolute inset-0 bg-white/10"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                      />
                    )}
                  </motion.button>
                ))}
              </div>

              {/* Tab Content */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white rounded-2xl shadow-xl p-6 sm:p-8"
                >
                  {activeTab === "create" && <CreateProductForm />}
                  {activeTab === "products" && <ProductList />}
                  {activeTab === "analytics" && <AnalyticsTab />}
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Dashboard;