
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Star, TrendingUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Tables } from '@/integrations/supabase/types';
import { toast } from 'sonner';

type InvestmentPackage = Tables<'investment_packages'>;

export function InvestmentPackages() {
  const { user } = useAuth();
  const [packages, setPackages] = useState<InvestmentPackage[]>([]);
  const [loading, setLoading] = useState(false);
  const [purchaseLoading, setPurchaseLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      const { data, error } = await supabase
        .from('investment_packages')
        .select('*')
        .eq('is_active', true)
        .order('price', { ascending: true });

      if (error) throw error;
      setPackages(data || []);
    } catch (error) {
      console.error('Error fetching packages:', error);
      toast.error('Failed to load investment packages');
    }
  };

  const purchasePackage = async (packageData: InvestmentPackage) => {
    if (!user) {
      toast.error('Please sign in to purchase a package');
      return;
    }

    setPurchaseLoading(packageData.id);

    try {
      // Calculate end date based on duration
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(startDate.getDate() + packageData.duration_days);

      // Calculate daily return
      const dailyReturn = (Number(packageData.price) * Number(packageData.daily_return_rate));

      // Create investment record
      const { error: investmentError } = await supabase
        .from('user_investments')
        .insert({
          user_id: user.id,
          package_id: packageData.id,
          amount: Number(packageData.price),
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString(),
          daily_return: dailyReturn,
          status: 'active'
        });

      if (investmentError) throw investmentError;

      // Create deposit transaction
      const { error: transactionError } = await supabase
        .from('transactions')
        .insert({
          user_id: user.id,
          type: 'deposit',
          amount: Number(packageData.price),
          description: `Investment in ${packageData.name} package`,
          status: 'completed'
        });

      if (transactionError) throw transactionError;

      // Create notification
      await supabase
        .from('notifications')
        .insert({
          user_id: user.id,
          title: 'Investment Purchased!',
          message: `You have successfully purchased the ${packageData.name} package for $${packageData.price}`,
          type: 'success'
        });

      toast.success(`Successfully purchased ${packageData.name} package!`);
      
    } catch (error) {
      console.error('Error purchasing package:', error);
      toast.error('Failed to purchase package. Please try again.');
    } finally {
      setPurchaseLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Investment Packages</h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Choose the perfect investment package for your financial goals. 
          All packages include daily returns and multi-level referral commissions.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {packages.map((pkg, index) => (
          <Card 
            key={pkg.id} 
            className={`relative overflow-hidden ${
              index === 1 ? 'border-blue-500 border-2 shadow-lg' : ''
            }`}
          >
            {index === 1 && (
              <div className="absolute top-0 right-0 bg-blue-500 text-white px-3 py-1 text-xs font-medium">
                Most Popular
              </div>
            )}
            
            <CardHeader className="text-center">
              <div className="flex justify-center mb-2">
                {index === 0 && <TrendingUp className="h-8 w-8 text-blue-500" />}
                {index === 1 && <Star className="h-8 w-8 text-yellow-500" />}
                {index === 2 && <Badge className="h-8 w-8 text-purple-500" />}
                {index === 3 && <Star className="h-8 w-8 text-gold-500" />}
              </div>
              <CardTitle className="text-xl">{pkg.name}</CardTitle>
              <CardDescription>{pkg.description}</CardDescription>
              <div className="mt-4">
                <span className="text-3xl font-bold text-gray-900">
                  ${Number(pkg.price).toFixed(0)}
                </span>
                <div className="text-sm text-gray-500 mt-1">
                  {(Number(pkg.daily_return_rate) * 100).toFixed(1)}% daily returns
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="space-y-2">
                {pkg.features?.map((feature, idx) => (
                  <div key={idx} className="flex items-center text-sm">
                    <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t">
                <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 mb-4">
                  <div>
                    <span className="font-medium">Duration:</span>
                    <br />
                    {pkg.duration_days} days
                  </div>
                  <div>
                    <span className="font-medium">Referral Bonus:</span>
                    <br />
                    {(Number(pkg.referral_bonus_rate) * 100).toFixed(0)}%
                  </div>
                </div>
                
                <Button 
                  className="w-full" 
                  onClick={() => purchasePackage(pkg)}
                  disabled={purchaseLoading === pkg.id}
                  variant={index === 1 ? "default" : "outline"}
                >
                  {purchaseLoading === pkg.id ? 'Processing...' : `Invest $${pkg.price}`}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Investment Calculator */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Investment Calculator</CardTitle>
          <CardDescription>
            Calculate your potential returns with compound interest
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-4">
            {packages.map((pkg) => {
              const dailyReturn = Number(pkg.price) * Number(pkg.daily_return_rate);
              const totalReturn = dailyReturn * pkg.duration_days;
              const totalAmount = Number(pkg.price) + totalReturn;
              const roi = ((totalReturn / Number(pkg.price)) * 100);

              return (
                <div key={pkg.id} className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-sm mb-2">{pkg.name}</h4>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span>Initial:</span>
                      <span className="font-medium">${pkg.price}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Daily:</span>
                      <span className="font-medium text-green-600">${dailyReturn.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Return:</span>
                      <span className="font-medium text-green-600">${totalReturn.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between border-t pt-1">
                      <span>Final Amount:</span>
                      <span className="font-bold">${totalAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>ROI:</span>
                      <span className="font-bold text-green-600">{roi.toFixed(1)}%</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
