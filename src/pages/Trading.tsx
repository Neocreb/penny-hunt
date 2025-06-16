
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  TrendingUp, 
  TrendingDown, 
  Search,
  Bitcoin,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";

interface MarketAsset {
  id: string;
  name: string;
  symbol: string;
  price: number;
  change24h: number;
  volume: number;
  marketCap: number;
}

const Trading: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAsset, setSelectedAsset] = useState<MarketAsset | null>(null);
  const [tradeAmount, setTradeAmount] = useState("");
  const [tradeType, setTradeType] = useState<"buy" | "sell">("buy");

  const marketData: MarketAsset[] = [
    {
      id: "bitcoin",
      name: "Bitcoin",
      symbol: "BTC",
      price: 45002.00,
      change24h: 3.45,
      volume: 28500000000,
      marketCap: 882000000000
    },
    {
      id: "ethereum",
      name: "Ethereum",
      symbol: "ETH",
      price: 2350.30,
      change24h: -1.23,
      volume: 15200000000,
      marketCap: 282000000000
    },
    {
      id: "cardano",
      name: "Cardano",
      symbol: "ADA",
      price: 0.52,
      change24h: 5.67,
      volume: 890000000,
      marketCap: 17500000000
    },
    {
      id: "solana",
      name: "Solana",
      symbol: "SOL",
      price: 98.45,
      change24h: -2.11,
      volume: 2100000000,
      marketCap: 42800000000
    }
  ];

  const filteredAssets = marketData.filter(asset =>
    asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    asset.symbol.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatVolume = (volume: number) => {
    if (volume >= 1e9) return `$${(volume / 1e9).toFixed(2)}B`;
    if (volume >= 1e6) return `$${(volume / 1e6).toFixed(2)}M`;
    return `$${(volume / 1e3).toFixed(2)}K`;
  };

  const handleTrade = () => {
    if (!selectedAsset || !tradeAmount) {
      toast({
        title: "Invalid Trade",
        description: "Please select an asset and enter an amount.",
        variant: "destructive",
      });
      return;
    }

    const amount = parseFloat(tradeAmount);
    const totalValue = amount * selectedAsset.price;

    toast({
      title: `${tradeType === "buy" ? "Buy" : "Sell"} Order Placed`,
      description: `${tradeType === "buy" ? "Bought" : "Sold"} ${amount} ${selectedAsset.symbol} for ${formatCurrency(totalValue)}`,
    });

    setTradeAmount("");
    setSelectedAsset(null);
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
              <Button variant="ghost" onClick={() => navigate("/portfolio")}>
                Portfolio
              </Button>
              <Button variant="ghost" onClick={() => navigate("/wallet")}>
                Wallet
              </Button>
            </nav>
            <Button variant="outline" onClick={() => navigate("/")}>
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Trading</h1>
          <p className="text-gray-600 mt-2">Buy and sell cryptocurrencies</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Market Data */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Market Overview</CardTitle>
                <CardDescription>
                  Current cryptocurrency prices and market data
                </CardDescription>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search cryptocurrencies..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredAssets.map((asset) => (
                    <div
                      key={asset.id}
                      className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-colors ${
                        selectedAsset?.id === asset.id ? "bg-blue-50 border-blue-200" : "hover:bg-gray-50"
                      }`}
                      onClick={() => setSelectedAsset(asset)}
                    >
                      <div className="flex items-center space-x-3">
                        {asset.symbol === "BTC" ? (
                          <Bitcoin className="h-8 w-8 text-orange-500" />
                        ) : (
                          <div className="h-8 w-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                            {asset.symbol.slice(0, 2)}
                          </div>
                        )}
                        <div>
                          <h3 className="font-medium">{asset.name}</h3>
                          <span className="text-sm text-gray-500">{asset.symbol}</span>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="font-medium">{formatCurrency(asset.price)}</div>
                        <div className={`flex items-center text-sm ${asset.change24h >= 0 ? "text-green-500" : "text-red-500"}`}>
                          {asset.change24h >= 0 ? (
                            <TrendingUp className="h-3 w-3 mr-1" />
                          ) : (
                            <TrendingDown className="h-3 w-3 mr-1" />
                          )}
                          {asset.change24h >= 0 ? "+" : ""}{asset.change24h.toFixed(2)}%
                        </div>
                      </div>
                      
                      <div className="text-right text-sm text-gray-500">
                        <div>Vol: {formatVolume(asset.volume)}</div>
                        <div>MCap: {formatVolume(asset.marketCap)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Trading Panel */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Trade</CardTitle>
                <CardDescription>
                  {selectedAsset ? `Trading ${selectedAsset.name}` : "Select an asset to trade"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {selectedAsset ? (
                  <div className="space-y-6">
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold">{formatCurrency(selectedAsset.price)}</div>
                      <div className="text-sm text-gray-500">{selectedAsset.symbol} Price</div>
                    </div>

                    <Tabs value={tradeType} onValueChange={(value) => setTradeType(value as "buy" | "sell")}>
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="buy" className="text-green-600">Buy</TabsTrigger>
                        <TabsTrigger value="sell" className="text-red-600">Sell</TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="buy" className="space-y-4">
                        <div>
                          <Label htmlFor="buy-amount">Amount ({selectedAsset.symbol})</Label>
                          <Input
                            id="buy-amount"
                            type="number"
                            placeholder="0.00"
                            value={tradeAmount}
                            onChange={(e) => setTradeAmount(e.target.value)}
                          />
                        </div>
                        {tradeAmount && (
                          <div className="text-sm text-gray-600">
                            Total: {formatCurrency(parseFloat(tradeAmount) * selectedAsset.price)}
                          </div>
                        )}
                        <Button onClick={handleTrade} className="w-full bg-green-600 hover:bg-green-700">
                          <ArrowDownRight className="h-4 w-4 mr-2" />
                          Buy {selectedAsset.symbol}
                        </Button>
                      </TabsContent>
                      
                      <TabsContent value="sell" className="space-y-4">
                        <div>
                          <Label htmlFor="sell-amount">Amount ({selectedAsset.symbol})</Label>
                          <Input
                            id="sell-amount"
                            type="number"
                            placeholder="0.00"
                            value={tradeAmount}
                            onChange={(e) => setTradeAmount(e.target.value)}
                          />
                        </div>
                        {tradeAmount && (
                          <div className="text-sm text-gray-600">
                            Total: {formatCurrency(parseFloat(tradeAmount) * selectedAsset.price)}
                          </div>
                        )}
                        <Button onClick={handleTrade} className="w-full bg-red-600 hover:bg-red-700">
                          <ArrowUpRight className="h-4 w-4 mr-2" />
                          Sell {selectedAsset.symbol}
                        </Button>
                      </TabsContent>
                    </Tabs>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    Select a cryptocurrency from the market list to start trading
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Trading;
