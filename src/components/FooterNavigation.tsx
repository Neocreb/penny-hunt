
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  TrendingUp, 
  BarChart3, 
  Wallet, 
  PieChart,
  Home,
  Package
} from "lucide-react";

const FooterNavigation: React.FC = () => {
  const location = useLocation();
  
  const navItems = [
    { path: "/dashboard", icon: Home, label: "Home" },
    { path: "/trading", icon: BarChart3, label: "Trading" },
    { path: "/wallet", icon: Wallet, label: "Wallet" },
    { path: "/portfolio", icon: PieChart, label: "Portfolio" },
    { path: "/packages", icon: Package, label: "Packages" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
      <div className="flex justify-around items-center py-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center py-2 px-3 rounded-lg transition-colors ${
                isActive 
                  ? "text-blue-600 bg-blue-50" 
                  : "text-gray-600 hover:text-blue-600 hover:bg-gray-50"
              }`}
            >
              <Icon className="h-5 w-5 mb-1" />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default FooterNavigation;
