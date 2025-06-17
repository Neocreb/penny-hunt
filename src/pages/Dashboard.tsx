
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  BarChart3, 
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  Bitcoin,
  Banknote
} from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "@/hooks/use-toast";

interface Asset {
  id: string;
  name: string;
  symbol: string;
  type: "crypto" | "fiat";
  balance: number;
  value: number;
  change24h: number;
  price: number;
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [totalBalance, setTotalBalance] = useState(0);
  const [totalChange, setTotalChange] = useState(0);

  useEffect(() => {
    // Check if user is authenticated
    const isAuthenticated = localStorage.getItem("isAuthenticated");
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    // Load mock portfolio data
    loadMockData();
  }, [navigate]);

  const loadMockData = () => {
    const mockAssets: Asset[] = [
      {
        id: "btc",
        name: "Bitcoin",
        symbol: "BTC",
        type: "crypto",
        balance: 0.25,
        value: 11250.50,
        change24h: 3.45,
        price: 45002.00
      },
      {
        id: "eth",
        name: "Ethereum",
        symbol: "ETH",
        type: "crypto",
        balance: 2.5,
        value: 5875.75,
        change24h: -1.23,
        price: 2350.30
      },
      {
        id: "ngn",
        name: "Nigerian Naira",
        symbol: "NGN",
        type: "fiat",
        balance: 2500000,
        value: 2500000,
        change24h: 0,
        price: 1
      },
      {
        id: "usd",
        name: "US Dollar",
        symbol: "USD",
        type: "fiat",
        balance: 1500.00,
        value: 1500.00,
        change24h: 0,
        price: 1
      }
    ];

    setAssets(mockAssets);
    
    const total = mockAssets.reduce((sum, asset) => sum + asset.value, 0);
    setTotalBalance(total);
    
    const weightedChange = mockAssets.reduce((sum, asset) => {
      return sum + (asset.change24h * (asset.value / total));
    }, 0);
    setTotalChange(weightedChange);
  };

  const formatCurrency = (amount: number, currency: string = "USD") => {
    if (currency === "NGN") {
      return new Intl.NumberFormat("en-NG", {
        style: "currency",
        currency: "NGN",
      }).format(amount);
    }
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const getAssetIcon = (type: string, symbol: string) => {
    if (type === "crypto") {
      return symbol === "BTC" ? <Bitcoin className="h-6 w-6 text-orange-500" /> : 
             <div className="h-6 w-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">ETH</div>;
    }
    return symbol === "NGN" ? <Banknote className="h-6 w-6 text-green-600" /> : 
           <DollarSign className="h-6 w-6 text-green-600" />;
  };

  const handleRefresh = () => {
    toast({
      title: "Refreshing Data",
      description: "Updating portfolio balances and market prices...",
    });
    loadMockData();
  };

  const userName = localStorage.getItem("userName") || "Investor";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">InvestPro</span>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={handleRefresh}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button variant="outline" onClick={() => navigate("/")}>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Welcome back, {userName}!</h1>
          <p className="text-gray-600 mt-2">Here's your investment portfolio overview</p>
        </div>

        {/* Portfolio Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Portfolio Value</CardTitle>
              <Wallet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalBalance)}</div>
              <div className="flex items-center text-xs text-muted-foreground">
                {totalChange >= 0 ? (
                  <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
                ) : (
                  <ArrowDownRight className="h-3 w-3 text-red-500 mr-1" />
                )}
                <span className={totalChange >= 0 ? "text-green-500" : "text-red-500"}>
                  {totalChange >= 0 ? "+" : ""}{totalChange.toFixed(2)}% from yesterday
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Assets</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{assets.length}</div>
              <p className="text-xs text-muted-foreground">
                {assets.filter(a => a.type === "crypto").length} crypto, {assets.filter(a => a.type === "fiat").length} fiat
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">24h Performance</CardTitle>
              {totalChange >= 0 ? (
                <TrendingUp className="h-4 w-4 text-green-500" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-500" />
              )}
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${totalChange >= 0 ? "text-green-500" : "text-red-500"}`}>
                {totalChange >= 0 ? "+" : ""}{totalChange.toFixed(2)}%
              </div>
              <p className="text-xs text-muted-foreground">
                Portfolio change
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Assets List */}
        <Card>
          <CardHeader>
            <CardTitle>Your Assets</CardTitle>
            <CardDescription>
              Overview of your cryptocurrency and fiat currency holdings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {assets.map((asset) => (
                <div key={asset.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center space-x-3">
                    {getAssetIcon(asset.type, asset.symbol)}
                    <div>
                      <h3 className="font-medium">{asset.name}</h3>
                      <div className="flex items-center space-x-2">
                        <Badge variant={asset.type === "crypto" ? "default" : "secondary"}>
                          {asset.type}
                        </Badge>
                        <span className="text-sm text-gray-500">{asset.symbol}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="font-medium">
                      {asset.type === "crypto" ? 
                        `${asset.balance} ${asset.symbol}` : 
                        formatCurrency(asset.balance, asset.symbol)
                      }
                    </div>
                    <div className="text-sm text-gray-500">
                      ≈ {formatCurrency(asset.value)}
                    </div>
                  </div>
                  
                  <div className="text-right">
                    {asset.type === "crypto" && (
                      <div className={`flex items-center ${asset.change24h >= 0 ? "text-green-500" : "text-red-500"}`}>
                        {asset.change24h >= 0 ? (
                          <TrendingUp className="h-3 w-3 mr-1" />
                        ) : (
                          <TrendingDown className="h-3 w-3 mr-1" />
                        )}
                        <span className="text-sm font-medium">
                          {asset.change24h >= 0 ? "+" : ""}{asset.change24h.toFixed(2)}%
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
          <Button className="h-16" variant="outline">
            <div className="text-center">
              <ArrowDownRight className="h-5 w-5 mx-auto mb-1" />
              <div className="text-sm">Buy Crypto</div>
            </div>
          </Button>
          <Button className="h-16" variant="outline">
            <div className="text-center">
              <ArrowUpRight className="h-5 w-5 mx-auto mb-1" />
              <div className="text-sm">Sell Crypto</div>
            </div>
          </Button>
          <Button className="h-16" variant="outline">
            <div className="text-center">
              <Wallet className="h-5 w-5 mx-auto mb-1" />
              <div className="text-sm">Deposit Funds</div>
            </div>
          </Button>
          <Button className="h-16" variant="outline">
            <div className="text-center">
              <BarChart3 className="h-5 w-5 mx-auto mb-1" />
              <div className="text-sm">View Analytics</div>
            </div>
          </Button>
        </div>
      </div>

      {/* Footer with Navigation */}
      <footer className="bg-gray-900 text-white mt-24">
        {/* Footer Navigation Bar */}
        <div className="bg-gray-800 border-b border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex flex-wrap justify-center md:justify-between items-center space-y-2 md:space-y-0">
              <div className="flex items-center space-x-6">
                <Link to="/dashboard" className="flex items-center text-gray-300 hover:text-white transition-colors">
                  <TrendingUp className="h-5 w-5 mr-2" />
                  Dashboard
                </Link>
                <Link to="/trading" className="text-gray-300 hover:text-white transition-colors">
                  Trading
                </Link>
                <Link to="/wallet" className="text-gray-300 hover:text-white transition-colors">
                  Wallet
                </Link>
                <Link to="/portfolio" className="text-gray-300 hover:text-white transition-colors">
                  Portfolio
                </Link>
              </div>
              <div className="flex items-center space-x-4">
                <Link to="/login">
                  <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white hover:bg-gray-700">
                    Login
                  </Button>
                </Link>
                <Link to="/register">
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                    Sign Up
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Main Footer Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <TrendingUp className="h-6 w-6 text-blue-400" />
                <span className="ml-2 text-lg font-bold">InvestPro</span>
              </div>
              <p className="text-gray-400">
                Professional cryptocurrency and fiat investment platform.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Platform</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/dashboard" className="hover:text-white">Dashboard</Link></li>
                <li><Link to="/trading" className="hover:text-white">Trading</Link></li>
                <li><Link to="/wallet" className="hover:text-white">Wallet</Link></li>
                <li><Link to="/portfolio" className="hover:text-white">Portfolio</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Help Center</a></li>
                <li><a href="#" className="hover:text-white">Contact Us</a></li>
                <li><a href="#" className="hover:text-white">API Documentation</a></li>
                <li><a href="#" className="hover:text-white">Security</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white">Compliance</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 InvestPro. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;
