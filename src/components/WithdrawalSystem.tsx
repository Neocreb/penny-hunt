
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { DollarSign, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Tables } from '@/integrations/supabase/types';
import { toast } from 'sonner';

type Withdrawal = Tables<'withdrawals'>;

interface WithdrawalFormData {
  amount: string;
  withdrawalMethod: string;
  accountDetails: {
    bankName?: string;
    accountNumber?: string;
    accountName?: string;
    routingNumber?: string;
    walletAddress?: string;
    paypalEmail?: string;
  };
  notes: string;
}

export function WithdrawalSystem() {
  const { user } = useAuth();
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<WithdrawalFormData>({
    amount: '',
    withdrawalMethod: '',
    accountDetails: {},
    notes: ''
  });

  useEffect(() => {
    if (user) {
      fetchWithdrawalsAndBalance();
    }
  }, [user]);

  const fetchWithdrawalsAndBalance = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Fetch withdrawals
      const { data: withdrawalsData, error: withdrawalsError } = await supabase
        .from('withdrawals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (withdrawalsError) throw withdrawalsError;

      // Calculate available balance from transactions
      const { data: transactionsData, error: transactionsError } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id);

      if (transactionsError) throw transactionsError;

      // Calculate balance (earnings - withdrawals)
      const earnings = (transactionsData || [])
        .filter(t => ['commission', 'daily_return', 'referral_bonus'].includes(t.type))
        .reduce((sum, t) => sum + Number(t.amount), 0);

      const withdrawnAmount = (withdrawalsData || [])
        .filter(w => w.status === 'completed')
        .reduce((sum, w) => sum + Number(w.amount), 0);

      setWithdrawals(withdrawalsData || []);
      setBalance(earnings - withdrawnAmount);

    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load withdrawal data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitWithdrawal = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !formData.amount || !formData.withdrawalMethod) {
      toast.error('Please fill in all required fields');
      return;
    }

    const withdrawalAmount = parseFloat(formData.amount);
    
    if (withdrawalAmount <= 0) {
      toast.error('Withdrawal amount must be greater than 0');
      return;
    }

    if (withdrawalAmount > balance) {
      toast.error('Insufficient balance for withdrawal');
      return;
    }

    if (withdrawalAmount < 10) {
      toast.error('Minimum withdrawal amount is $10');
      return;
    }

    setSubmitting(true);

    try {
      const { error } = await supabase
        .from('withdrawals')
        .insert({
          user_id: user.id,
          amount: withdrawalAmount,
          withdrawal_method: formData.withdrawalMethod,
          account_details: formData.accountDetails,
          notes: formData.notes,
          status: 'pending'
        });

      if (error) throw error;

      // Create notification
      await supabase
        .from('notifications')
        .insert({
          user_id: user.id,
          title: 'Withdrawal Request Submitted',
          message: `Your withdrawal request for $${withdrawalAmount} has been submitted and is being processed.`,
          type: 'info'
        });

      toast.success('Withdrawal request submitted successfully!');
      
      // Reset form
      setFormData({
        amount: '',
        withdrawalMethod: '',
        accountDetails: {},
        notes: ''
      });

      // Refresh data
      fetchWithdrawalsAndBalance();

    } catch (error) {
      console.error('Error submitting withdrawal:', error);
      toast.error('Failed to submit withdrawal request');
    } finally {
      setSubmitting(false);
    }
  };

  const renderAccountDetailsForm = () => {
    switch (formData.withdrawalMethod) {
      case 'bank_transfer':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="bankName">Bank Name</Label>
                <Input
                  id="bankName"
                  placeholder="Your bank name"
                  value={formData.accountDetails.bankName || ''}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    accountDetails: { ...prev.accountDetails, bankName: e.target.value }
                  }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="accountNumber">Account Number</Label>
                <Input
                  id="accountNumber"
                  placeholder="Your account number"
                  value={formData.accountDetails.accountNumber || ''}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    accountDetails: { ...prev.accountDetails, accountNumber: e.target.value }
                  }))}
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="accountName">Account Name</Label>
                <Input
                  id="accountName"
                  placeholder="Account holder name"
                  value={formData.accountDetails.accountName || ''}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    accountDetails: { ...prev.accountDetails, accountName: e.target.value }
                  }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="routingNumber">Routing Number</Label>
                <Input
                  id="routingNumber"
                  placeholder="Bank routing number"
                  value={formData.accountDetails.routingNumber || ''}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    accountDetails: { ...prev.accountDetails, routingNumber: e.target.value }
                  }))}
                />
              </div>
            </div>
          </div>
        );

      case 'crypto':
        return (
          <div>
            <Label htmlFor="walletAddress">Wallet Address</Label>
            <Input
              id="walletAddress"
              placeholder="Your crypto wallet address"
              value={formData.accountDetails.walletAddress || ''}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                accountDetails: { ...prev.accountDetails, walletAddress: e.target.value }
              }))}
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Supports Bitcoin, Ethereum, USDT, and other major cryptocurrencies
            </p>
          </div>
        );

      case 'paypal':
        return (
          <div>
            <Label htmlFor="paypalEmail">PayPal Email</Label>
            <Input
              id="paypalEmail"
              type="email"
              placeholder="Your PayPal email address"
              value={formData.accountDetails.paypalEmail || ''}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                accountDetails: { ...prev.accountDetails, paypalEmail: e.target.value }
              }))}
              required
            />
          </div>
        );

      default:
        return null;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'processing':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'cancelled':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Balance Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <DollarSign className="h-5 w-5 mr-2" />
            Available Balance
          </CardTitle>
          <CardDescription>
            Your current withdrawable balance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-green-600">
            ${balance.toFixed(2)}
          </div>
          <p className="text-sm text-gray-500 mt-2">
            Minimum withdrawal: $10.00
          </p>
        </CardContent>
      </Card>

      {/* Withdrawal Form */}
      <Card>
        <CardHeader>
          <CardTitle>Request Withdrawal</CardTitle>
          <CardDescription>
            Submit a new withdrawal request
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmitWithdrawal} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="amount">Withdrawal Amount ($)</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="10"
                  max={balance}
                  placeholder="Enter amount"
                  value={formData.amount}
                  onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="withdrawalMethod">Withdrawal Method</Label>
                <Select 
                  value={formData.withdrawalMethod} 
                  onValueChange={(value) => setFormData(prev => ({ 
                    ...prev, 
                    withdrawalMethod: value,
                    accountDetails: {} // Reset account details when method changes
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                    <SelectItem value="crypto">Cryptocurrency</SelectItem>
                    <SelectItem value="paypal">PayPal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {formData.withdrawalMethod && (
              <div className="space-y-4">
                <h4 className="font-medium">Account Details</h4>
                {renderAccountDetailsForm()}
              </div>
            )}

            <div>
              <Label htmlFor="notes">Additional Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Any additional information or special instructions"
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                rows={3}
              />
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={submitting || balance < 10}
            >
              {submitting ? 'Submitting...' : `Request Withdrawal of $${formData.amount || '0.00'}`}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Withdrawal History */}
      <Card>
        <CardHeader>
          <CardTitle>Withdrawal History</CardTitle>
          <CardDescription>
            Your previous withdrawal requests and their status
          </CardDescription>
        </CardHeader>
        <CardContent>
          {withdrawals.length === 0 ? (
            <div className="text-center py-8">
              <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No withdrawals yet</h3>
              <p className="text-gray-500">
                Your withdrawal history will appear here once you make your first request
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {withdrawals.map((withdrawal) => (
                <div key={withdrawal.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    {getStatusIcon(withdrawal.status || 'pending')}
                    <div>
                      <h4 className="font-medium">
                        ${Number(withdrawal.amount).toFixed(2)}
                      </h4>
                      <p className="text-sm text-gray-500">
                        {withdrawal.withdrawal_method.replace('_', ' ').toUpperCase()}
                      </p>
                      <p className="text-xs text-gray-400">
                        Requested: {new Date(withdrawal.created_at!).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge 
                      variant={
                        withdrawal.status === 'completed' ? 'default' :
                        withdrawal.status === 'processing' ? 'secondary' :
                        withdrawal.status === 'cancelled' ? 'destructive' : 'outline'
                      }
                    >
                      {withdrawal.status || 'pending'}
                    </Badge>
                    {withdrawal.processed_at && (
                      <p className="text-xs text-gray-500 mt-1">
                        Processed: {new Date(withdrawal.processed_at).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
