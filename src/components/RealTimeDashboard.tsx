
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  Users, 
  DollarSign, 
  Award, 
  Bell,
  RefreshCw,
  Copy,
  CheckCircle
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';
import { toast } from 'sonner';

type Investment = Tables<'user_investments'>;
type Transaction = Tables<'transactions'>;
type Notification = Tables<'notifications'>;

interface DashboardStats {
  totalBalance: number;
  activeInvestments: number;
  totalEarnings: number;
  referralCount: number;
  currentLevel: string;
}

export function RealTimeDashboard() {
  const { user } = useAuth();
  const { profile } = useProfile();
  const [stats, setStats] = useState<DashboardStats>({
    totalBalance: 0,
    activeInvestments: 0,
    totalEarnings: 0,
    referralCount: 0,
    currentLevel: 'Bronze'
  });
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
      setupRealtimeSubscription();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Fetch investments
      const { data: investmentsData } = await supabase
        .from('user_investments')
        .select(`
          *,
          investment_packages (*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      // Fetch transactions
      const { data: transactionsData } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      // Fetch notifications
      const { data: notificationsData } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      // Fetch referral stats
      const { data: referralsData } = await supabase
        .from('referrals')
        .select('*')
        .eq('referrer_id', user.id);

      // Fetch user level
      const { data: levelData } = await supabase
        .from('user_levels')
        .select('*')
        .eq('user_id', user.id)
        .single();

      setInvestments(investmentsData || []);
      setTransactions(transactionsData || []);
      setNotifications(notificationsData || []);

      // Calculate stats
      const activeInvs = (investmentsData || []).filter(inv => inv.status === 'active');
      const totalEarnings = (transactionsData || [])
        .filter(t => ['commission', 'daily_return', 'referral_bonus'].includes(t.type))
        .reduce((sum, t) => sum + Number(t.amount), 0);

      setStats({
        totalBalance: totalEarnings,
        activeInvestments: activeInvs.length,
        totalEarnings,
        referralCount: referralsData?.length || 0,
        currentLevel: levelData?.level_name || 'Bronze'
      });

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel('dashboard-updates')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${user?.id}`
      }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setNotifications(prev => [payload.new as Notification, ...prev.slice(0, 4)]);
          toast.success(payload.new.title);
        }
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'transactions',
        filter: `user_id=eq.${user?.id}`
      }, () => {
        fetchDashboardData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const copyReferralLink = () => {
    if (profile?.referral_code) {
      const referralLink = `${window.location.origin}/auth?ref=${profile.referral_code}`;
      navigator.clipboard.writeText(referralLink);
      setCopied(true);
      toast.success('Referral link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const markNotificationAsRead = async (notificationId: string) => {
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId);
      
    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
    );
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
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalBalance.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Your current balance
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Investments</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeInvestments}</div>
            <p className="text-xs text-muted-foreground">
              Currently earning returns
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Team Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.referralCount}</div>
            <p className="text-xs text-muted-foreground">
              Direct referrals
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Level</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.currentLevel}</div>
            <p className="text-xs text-muted-foreground">
              Your rank level
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Referral Section */}
      <Card>
        <CardHeader>
          <CardTitle>Your Referral Link</CardTitle>
          <CardDescription>
            Share this link to earn referral bonuses
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <div className="flex-1 p-3 bg-gray-50 rounded-md text-sm">
              {profile?.referral_code ? 
                `${window.location.origin}/auth?ref=${profile.referral_code}` : 
                'Loading...'
              }
            </div>
            <Button onClick={copyReferralLink} size="sm">
              {copied ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
          <div className="mt-2 text-sm text-gray-600">
            Your referral code: <strong>{profile?.referral_code}</strong>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>Your latest financial activities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {transactions.length === 0 ? (
                <p className="text-sm text-gray-500">No transactions yet</p>
              ) : (
                transactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">
                        {transaction.type.replace('_', ' ').toUpperCase()}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(transaction.created_at!).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-medium ${
                        ['commission', 'daily_return', 'referral_bonus'].includes(transaction.type) 
                          ? 'text-green-600' 
                          : 'text-red-600'
                      }`}>
                        {['commission', 'daily_return', 'referral_bonus'].includes(transaction.type) ? '+' : '-'}
                        ${Number(transaction.amount).toFixed(2)}
                      </p>
                      <Badge variant="outline" className="text-xs">
                        {transaction.currency}
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Bell className="h-5 w-5 mr-2" />
              Notifications
            </CardTitle>
            <CardDescription>Recent updates and alerts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {notifications.length === 0 ? (
                <p className="text-sm text-gray-500">No notifications</p>
              ) : (
                notifications.map((notification) => (
                  <div 
                    key={notification.id} 
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      notification.is_read ? 'bg-gray-50' : 'bg-blue-50 border-l-4 border-blue-500'
                    }`}
                    onClick={() => !notification.is_read && markNotificationAsRead(notification.id)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-medium">{notification.title}</p>
                        <p className="text-xs text-gray-500 mt-1">{notification.message}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(notification.created_at!).toLocaleDateString()}
                        </p>
                      </div>
                      {!notification.is_read && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Investments */}
      {investments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Active Investments</CardTitle>
            <CardDescription>Your current investment portfolio</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {investments.filter(inv => inv.status === 'active').map((investment) => (
                <div key={investment.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-medium">Investment #{investment.id.slice(0, 8)}</h4>
                      <p className="text-sm text-gray-500">
                        Started: {new Date(investment.start_date!).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge variant="outline" className="bg-green-50 text-green-700">
                      {investment.status}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Amount</p>
                      <p className="font-medium">${Number(investment.amount).toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Daily Return</p>
                      <p className="font-medium text-green-600">
                        ${Number(investment.daily_return || 0).toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Total Returns</p>
                      <p className="font-medium text-green-600">
                        ${Number(investment.total_returns || 0).toFixed(2)}
                      </p>
                    </div>
                  </div>
                  {investment.end_date && (
                    <div className="mt-3">
                      <p className="text-xs text-gray-500 mb-1">
                        Ends: {new Date(investment.end_date).toLocaleDateString()}
                      </p>
                      <Progress 
                        value={
                          ((new Date().getTime() - new Date(investment.start_date!).getTime()) / 
                          (new Date(investment.end_date).getTime() - new Date(investment.start_date!).getTime())) * 100
                        } 
                        className="h-2"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
