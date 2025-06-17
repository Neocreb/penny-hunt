
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  Star,
  Users,
  Trophy,
  Gift,
  CheckCircle,
  Crown,
  DollarSign,
  RefreshCw
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";

interface InvestmentPackage {
  id: string;
  name: string;
  price: number;
  dailyReturn: number;
  duration: number;
  totalReturn: number;
  referralBonus: number;
  levelCommissions: number[];
  features: string[];
  badge?: string;
  popular?: boolean;
}

interface UserStats {
  totalInvested: number;
  activePackages: number;
  totalEarnings: number;
  directReferrals: number;
  teamSize: number;
  currentLevel: string;
}

const Packages: React.FC = () => {
  const navigate = useNavigate();
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);

  const packages: InvestmentPackage[] = [
    {
      id: "starter",
      name: "Starter",
      price: 100,
      dailyReturn: 2.5,
      duration: 30,
      totalReturn: 175,
      referralBonus: 10,
      levelCommissions: [10, 5, 3],
      features: [
        "2.5% daily returns",
        "30-day investment period",
        "10% direct referral bonus",
        "3-level commission structure",
        "Basic support"
      ]
    },
    {
      id: "professional",
      name: "Professional",
      price: 500,
      dailyReturn: 3.0,
      duration: 45,
      totalReturn: 1175,
      referralBonus: 12,
      levelCommissions: [12, 7, 5, 3],
      features: [
        "3.0% daily returns",
        "45-day investment period",
        "12% direct referral bonus",
        "4-level commission structure",
        "Priority support",
        "Weekly bonus payments"
      ],
      popular: true
    },
    {
      id: "premium",
      name: "Premium",
      price: 1000,
      dailyReturn: 3.5,
      duration: 60,
      totalReturn: 3100,
      referralBonus: 15,
      levelCommissions: [15, 10, 7, 5, 3],
      features: [
        "3.5% daily returns",
        "60-day investment period",
        "15% direct referral bonus",
        "5-level commission structure",
        "VIP support",
        "Weekly bonus payments",
        "Monthly performance bonus"
      ]
    },
    {
      id: "elite",
      name: "Elite",
      price: 5000,
      dailyReturn: 4.0,
      duration: 90,
      totalReturn: 23000,
      referralBonus: 20,
      levelCommissions: [20, 15, 10, 7, 5, 3],
      features: [
        "4.0% daily returns",
        "90-day investment period",
        "20% direct referral bonus",
        "6-level commission structure",
        "Dedicated account manager",
        "Weekly bonus payments",
        "Monthly performance bonus",
        "Exclusive investment opportunities"
      ],
      badge: "BEST VALUE"
    }
  ];

  const userStats: UserStats = {
    totalInvested: 2500,
    activePackages: 2,
    totalEarnings: 1847.50,
    directReferrals: 12,
    teamSize: 45,
    currentLevel: "Silver"
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const handleInvest = (packageId: string) => {
    const selectedPkg = packages.find(pkg => pkg.id === packageId);
    if (!selectedPkg) return;

    toast({
      title: "Investment Initiated",
      description: `You have selected the ${selectedPkg.name} package for ${formatCurrency(selectedPkg.price)}`,
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
            <div className="flex items-center space-x-4">
              <Button variant="ghost">
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
          <h1 className="text-3xl font-bold text-gray-900">Investment Packages</h1>
          <p className="text-gray-600 mt-2">Choose the perfect investment plan and build your network</p>
        </div>

        {/* User Stats */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 text-center">
              <DollarSign className="h-6 w-6 text-green-500 mx-auto mb-2" />
              <div className="text-lg font-bold">{formatCurrency(userStats.totalInvested)}</div>
              <div className="text-xs text-gray-500">Total Invested</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Star className="h-6 w-6 text-blue-500 mx-auto mb-2" />
              <div className="text-lg font-bold">{userStats.activePackages}</div>
              <div className="text-xs text-gray-500">Active Packages</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <TrendingUp className="h-6 w-6 text-green-500 mx-auto mb-2" />
              <div className="text-lg font-bold">{formatCurrency(userStats.totalEarnings)}</div>
              <div className="text-xs text-gray-500">Total Earnings</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Users className="h-6 w-6 text-purple-500 mx-auto mb-2" />
              <div className="text-lg font-bold">{userStats.directReferrals}</div>
              <div className="text-xs text-gray-500">Direct Referrals</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Trophy className="h-6 w-6 text-orange-500 mx-auto mb-2" />
              <div className="text-lg font-bold">{userStats.teamSize}</div>
              <div className="text-xs text-gray-500">Team Size</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Crown className="h-6 w-6 text-yellow-500 mx-auto mb-2" />
              <div className="text-lg font-bold">{userStats.currentLevel}</div>
              <div className="text-xs text-gray-500">Current Level</div>
            </CardContent>
          </Card>
        </div>

        {/* Investment Packages */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {packages.map((pkg) => (
            <Card 
              key={pkg.id} 
              className={`relative cursor-pointer transition-all hover:shadow-lg ${
                pkg.popular ? 'ring-2 ring-blue-500' : ''
              } ${selectedPackage === pkg.id ? 'ring-2 ring-green-500' : ''}`}
              onClick={() => setSelectedPackage(pkg.id)}
            >
              {pkg.badge && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-orange-500 text-white px-3 py-1">
                    {pkg.badge}
                  </Badge>
                </div>
              )}
              {pkg.popular && (
                <div className="absolute -top-3 right-4">
                  <Badge className="bg-blue-500 text-white px-3 py-1">
                    POPULAR
                  </Badge>
                </div>
              )}
              
              <CardHeader className="text-center pb-2">
                <CardTitle className="text-xl">{pkg.name}</CardTitle>
                <div className="text-3xl font-bold text-blue-600">
                  {formatCurrency(pkg.price)}
                </div>
                <CardDescription>
                  {pkg.dailyReturn}% daily returns for {pkg.duration} days
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-sm text-gray-600">Total Return</div>
                  <div className="text-xl font-bold text-green-600">
                    {formatCurrency(pkg.totalReturn)}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="text-sm font-medium text-gray-900">MLM Benefits:</div>
                  <div className="text-sm text-gray-600">
                    Referral Bonus: {pkg.referralBonus}%
                  </div>
                  <div className="text-sm text-gray-600">
                    Level Commissions: {pkg.levelCommissions.join('%, ')}%
                  </div>
                </div>
                
                <div className="space-y-2">
                  {pkg.features.map((feature, index) => (
                    <div key={index} className="flex items-center text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
                
                <Button 
                  className="w-full mt-4" 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleInvest(pkg.id);
                  }}
                  variant={selectedPackage === pkg.id ? "default" : "outline"}
                >
                  {selectedPackage === pkg.id ? "Selected" : "Choose Plan"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* MLM Level System */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>MLM Commission Structure</CardTitle>
            <CardDescription>
              Earn commissions from your network across multiple levels
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Level System</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span>Bronze (0-10 referrals)</span>
                    <Badge variant="secondary">Entry</Badge>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span>Silver (11-25 referrals)</span>
                    <Badge className="bg-gray-400 text-white">Current</Badge>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span>Gold (26-50 referrals)</span>
                    <Badge className="bg-yellow-500 text-white">Goal</Badge>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span>Platinum (51+ referrals)</span>
                    <Badge className="bg-purple-500 text-white">Elite</Badge>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Commission Rates</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Level 1 (Direct)</span>
                    <span className="font-medium">10-20%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Level 2</span>
                    <span className="font-medium">5-15%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Level 3</span>
                    <span className="font-medium">3-10%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Level 4+</span>
                    <span className="font-medium">3-7%</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Bonus Rewards</h3>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <Gift className="h-4 w-4 text-blue-500 mr-2" />
                    <span className="text-sm">Weekly performance bonus</span>
                  </div>
                  <div className="flex items-center">
                    <Trophy className="h-4 w-4 text-orange-500 mr-2" />
                    <span className="text-sm">Monthly leadership rewards</span>
                  </div>
                  <div className="flex items-center">
                    <Crown className="h-4 w-4 text-yellow-500 mr-2" />
                    <span className="text-sm">Annual top performer bonus</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Packages;
