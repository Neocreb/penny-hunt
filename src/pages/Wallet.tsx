import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  TrendingUp, 
  Wallet as WalletIcon, 
  Plus,
  Minus,
  DollarSign,
  Bitcoin,
  Banknote
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";

interface WalletBalance {
  currency: string;
  symbol: string;
  balance: number;
  usdValue: number;
  type: "crypto" | "fiat";
}

const Wallet: React.FC = () => {
  const navigate = useNavigate();
  const [depositAmount, setDepositAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [selectedCurrency, setSelectedCurrency] = useState("USD");

  const walletBalances: WalletBalance[] = [
    {
      currency: "Bitcoin",
      symbol: "BTC",
      balance: 0.25,
      usdValue: 11250.50,
      type: "crypto"
    },
    {
      currency: "Ethereum",
      symbol: "ETH",
      balance: 2.5,
      usdValue: 5875.75,
      type: "crypto"
    },
    {
      currency: "US Dollar",
      symbol: "USD",
      balance: 1500.00,
      usdValue: 1500.00,
      type: "fiat"
    },
    {
      currency: "Nigerian Naira",
      symbol: "NGN",
      balance: 2500000,
      usdValue: 1612.90,
      type: "fiat"
    },
    {
      currency: "Euro",
      symbol: "EUR",
      balance: 750.00,
      usdValue: 817.50,
      type: "fiat"
    }
  ];

  const totalUsdValue = walletBalances.reduce((sum, balance) => sum + balance.usdValue, 0);

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

  const getCurrencyIcon = (type: string, symbol: string) => {
    if (type === "crypto") {
      return symbol === "BTC" ? <Bitcoin className="h-6 w-6 text-orange-500" /> : 
             <div className="h-6 w-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">ETH</div>;
    }
    return symbol === "NGN" ? <Banknote className="h-6 w-6 text-green-600" /> : 
           <DollarSign className="h-6 w-6 text-green-600" />;
  };

  const handleDeposit = () => {
    if (!depositAmount) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a deposit amount.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Deposit Initiated",
      description: `Deposit of ${depositAmount} ${selectedCurrency} has been initiated.`,
    });
    setDepositAmount("");
  };

  const handleWithdraw = () => {
    if (!withdrawAmount) {
      toast({
        title: "Invalid Amount", 
        description: "Please enter a withdrawal amount.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Withdrawal Initiated",
      description: `Withdrawal of ${withdrawAmount} ${selectedCurrency} has been initiated.`,
    });
    setWithdrawAmount("");
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
            <Button variant="outline" onClick={() => navigate("/")}>
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Wallet</h1>
          <p className="text-gray-600 mt-2">Manage your crypto and fiat currency balances</p>
        </div>

        {/* Total Balance */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <WalletIcon className="h-6 w-6 mr-2" />
              Total Wallet Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">
              {formatCurrency(totalUsdValue)}
            </div>
            <p className="text-gray-600 mt-1">Across all currencies</p>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Balances */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Your Balances</CardTitle>
                <CardDescription>
                  Current balances across all supported currencies
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {walletBalances.map((balance) => (
                    <div key={balance.symbol} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-center space-x-3">
                        {getCurrencyIcon(balance.type, balance.symbol)}
                        <div>
                          <h3 className="font-medium">{balance.currency}</h3>
                          <div className="flex items-center space-x-2">
                            <Badge variant={balance.type === "crypto" ? "default" : "secondary"}>
                              {balance.type}
                            </Badge>
                            <span className="text-sm text-gray-500">{balance.symbol}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="font-medium">
                          {balance.type === "crypto" ? 
                            `${balance.balance} ${balance.symbol}` : 
                            formatCurrency(balance.balance, balance.symbol)
                          }
                        </div>
                        <div className="text-sm text-gray-500">
                          ≈ {formatCurrency(balance.usdValue)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Deposit/Withdraw */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Fund Management</CardTitle>
                <CardDescription>
                  Deposit or withdraw funds from your wallet
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="deposit">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="deposit">Deposit</TabsTrigger>
                    <TabsTrigger value="withdraw">Withdraw</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="deposit" className="space-y-4">
                    <div>
                      <Label htmlFor="deposit-currency">Currency</Label>
                      <select
                        id="deposit-currency"
                        value={selectedCurrency}
                        onChange={(e) => setSelectedCurrency(e.target.value)}
                        className="w-full mt-1 p-2 border rounded-md"
                      >
                        <option value="USD">US Dollar (USD)</option>
                        <option value="NGN">Nigerian Naira (NGN)</option>
                        <option value="EUR">Euro (EUR)</option>
                        <option value="GBP">British Pound (GBP)</option>
                      </select>
                    </div>
                    
                    <div>
                      <Label htmlFor="deposit-amount">Amount</Label>
                      <Input
                        id="deposit-amount"
                        type="number"
                        placeholder="0.00"
                        value={depositAmount}
                        onChange={(e) => setDepositAmount(e.target.value)}
                      />
                    </div>
                    
                    <Button onClick={handleDeposit} className="w-full bg-green-600 hover:bg-green-700">
                      <Plus className="h-4 w-4 mr-2" />
                      Deposit Funds
                    </Button>
                  </TabsContent>
                  
                  <TabsContent value="withdraw" className="space-y-4">
                    <div>
                      <Label htmlFor="withdraw-currency">Currency</Label>
                      <select
                        id="withdraw-currency"
                        value={selectedCurrency}
                        onChange={(e) => setSelectedCurrency(e.target.value)}
                        className="w-full mt-1 p-2 border rounded-md"
                      >
                        <option value="USD">US Dollar (USD)</option>
                        <option value="NGN">Nigerian Naira (NGN)</option>
                        <option value="EUR">Euro (EUR)</option>
                        <option value="GBP">British Pound (GBP)</option>
                      </select>
                    </div>
                    
                    <div>
                      <Label htmlFor="withdraw-amount">Amount</Label>
                      <Input
                        id="withdraw-amount"
                        type="number"
                        placeholder="0.00"
                        value={withdrawAmount}
                        onChange={(e) => setWithdrawAmount(e.target.value)}
                      />
                    </div>
                    
                    <Button onClick={handleWithdraw} className="w-full bg-red-600 hover:bg-red-700">
                      <Minus className="h-4 w-4 mr-2" />
                      Withdraw Funds
                    </Button>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
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

export default Wallet;
