
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  TrendingDown, 
  BarChart3,
  PieChart,
  Bitcoin,
  DollarSign,
  Banknote,
  RefreshCw
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";

interface PortfolioAsset {
  id: string;
  name: string;
  symbol: string;
  type: "crypto" | "fiat";
  balance: number;
  value: number;
  change24h: number;
  allocation: number;
  avgBuyPrice?: number;
  totalReturn?: number;
}

const Portfolio: React.FC = () => {
  const navigate = useNavigate();
  const [timeframe, setTimeframe] = useState<"24h" | "7d" | "30d" | "1y">("24h");

  const portfolioAssets: PortfolioAsset[] = [
    {
      id: "bitcoin",
      name: "Bitcoin",
      symbol: "BTC",
      type: "crypto",
      balance: 0.25,
      value: 11250.50,
      change24h: 3.45,
      allocation: 45.2,
      avgBuyPrice: 42000,
      totalReturn: 15.8
    },
    {
      id: "ethereum",
      name: "Ethereum", 
      symbol: "ETH",
      type: "crypto",
      balance: 2.5,
      value: 5875.75,
      change24h: -1.23,
      allocation: 23.6,
      avgBuyPrice: 2200,
      totalReturn: 8.2
    },
    {
      id: "usd",
      name: "US Dollar",
      symbol: "USD",
      type: "fiat",
      balance: 1500.00,
      value: 1500.00,
      change24h: 0,
      allocation: 6.0
    },
    {
      id: "ngn",
      name: "Nigerian Naira",
      symbol: "NGN",
      type: "fiat",
      balance: 2500000,
      value: 1612.90,
      change24h: 0,
      allocation: 6.5
    },
    {
      id: "eur",
      name: "Euro",
      symbol: "EUR",
      type: "fiat",
      balance: 750.00,
      value: 817.50,
      change24h: 0,
      allocation: 3.3
    }
  ];

  const totalValue = portfolioAssets.reduce((sum, asset) => sum + asset.value, 0);
  const totalReturn = portfolioAssets
    .filter(asset => asset.totalReturn)
    .reduce((sum, asset) => sum + (asset.totalReturn || 0) * (asset.value / totalValue), 0);

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
      title: "Refreshing Portfolio",
      description: "Updating portfolio data and market prices...",
    });
  };

  const isAuthenticated = localStorage.getItem("isAuthenticated");
  if (!isAuthenticated) {
    navigate("/login");
    return null;
  }

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
            <nav className="hidden md:flex space-x-8">
              <Button variant="ghost" onClick={() => navigate("/dashboard")}>
                Dashboard
              </Button>
              <Button variant="ghost" onClick={() => navigate("/trading")}>
                Trading
              </Button>
              <Button variant="ghost" onClick={() => navigate("/wallet")}>
                Wallet
              </Button>
            </nav>
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Portfolio</h1>
          <p className="text-gray-600 mt-2">Detailed view of your investment performance</p>
        </div>

        {/* Portfolio Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Value</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalValue)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Return</CardTitle>
              {totalReturn >= 0 ? (
                <TrendingUp className="h-4 w-4 text-green-500" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-500" />
              )}
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${totalReturn >= 0 ? "text-green-500" : "text-red-500"}`}>
                {totalReturn >= 0 ? "+" : ""}{totalReturn.toFixed(2)}%
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Assets</CardTitle>
              <PieChart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{portfolioAssets.length}</div>
              <p className="text-xs text-muted-foreground">
                {portfolioAssets.filter(a => a.type === "crypto").length} crypto, {portfolioAssets.filter(a => a.type === "fiat").length} fiat
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Best Performer</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">BTC</div>
              <p className="text-xs text-green-500">+15.8% return</p>
            </CardContent>
          </Card>
        </div>

        {/* Timeframe Selector */}
        <div className="mb-6">
          <div className="flex space-x-2">
            {(["24h", "7d", "30d", "1y"] as const).map((period) => (
              <Button
                key={period}
                variant={timeframe === period ? "default" : "outline"}
                size="sm"
                onClick={() => setTimeframe(period)}
              >
                {period}
              </Button>
            ))}
          </div>
        </div>

        {/* Asset Allocation */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Asset Allocation</CardTitle>
            <CardDescription>
              Breakdown of your portfolio by asset type and value
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {portfolioAssets.map((asset) => (
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
                      {formatCurrency(asset.value)} ({asset.allocation}%)
                    </div>
                  </div>
                  
                  <div className="text-right">
                    {asset.type === "crypto" && asset.totalReturn && (
                      <div className={`text-sm font-medium ${asset.totalReturn >= 0 ? "text-green-500" : "text-red-500"}`}>
                        {asset.totalReturn >= 0 ? "+" : ""}{asset.totalReturn.toFixed(2)}%
                      </div>
                    )}
                    {asset.type === "crypto" && asset.change24h !== 0 && (
                      <div className={`flex items-center text-xs ${asset.change24h >= 0 ? "text-green-500" : "text-red-500"}`}>
                        {asset.change24h >= 0 ? (
                          <TrendingUp className="h-3 w-3 mr-1" />
                        ) : (
                          <TrendingDown className="h-3 w-3 mr-1" />
                        )}
                        {asset.change24h >= 0 ? "+" : ""}{asset.change24h.toFixed(2)}%
                      </div>
                    )}
                  </div>
                  
                  <div className="w-20">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${asset.allocation}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Portfolio;
