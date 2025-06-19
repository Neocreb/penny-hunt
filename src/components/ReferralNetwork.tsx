
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, DollarSign, TrendingUp, Share2, Copy } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { Tables } from '@/integrations/supabase/types';
import { toast } from 'sonner';

type Referral = Tables<'referrals'>;
type Profile = Tables<'profiles'>;

interface ReferralWithProfile extends Referral {
  referred_profile: Profile;
}

interface NetworkStats {
  directReferrals: number;
  totalCommissions: number;
  activeReferrals: number;
  thisMonthCommissions: number;
}

export function ReferralNetwork() {
  const { user } = useAuth();
  const { profile } = useProfile();
  const [referrals, setReferrals] = useState<ReferralWithProfile[]>([]);
  const [stats, setStats] = useState<NetworkStats>({
    directReferrals: 0,
    totalCommissions: 0,
    activeReferrals: 0,
    thisMonthCommissions: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchReferralData();
    }
  }, [user]);

  const fetchReferralData = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Fetch referrals with profile data
      const { data: referralsData, error: referralsError } = await supabase
        .from('referrals')
        .select(`
          *,
          referred_profile:profiles!referrals_referred_id_fkey(*)
        `)
        .eq('referrer_id', user.id)
        .order('created_at', { ascending: false });

      if (referralsError) throw referralsError;

      // Fetch commission transactions
      const { data: commissionsData, error: commissionsError } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .in('type', ['commission', 'referral_bonus'])
        .order('created_at', { ascending: false });

      if (commissionsError) throw commissionsError;

      setReferrals(referralsData || []);

      // Calculate stats
      const totalCommissions = (commissionsData || []).reduce((sum, t) => sum + Number(t.amount), 0);
      
      const thisMonth = new Date();
      thisMonth.setDate(1);
      thisMonth.setHours(0, 0, 0, 0);
      
      const thisMonthCommissions = (commissionsData || [])
        .filter(t => new Date(t.created_at!) >= thisMonth)
        .reduce((sum, t) => sum + Number(t.amount), 0);

      setStats({
        directReferrals: referralsData?.length || 0,
        totalCommissions,
        activeReferrals: referralsData?.filter(r => r.referred_profile?.is_active)?.length || 0,
        thisMonthCommissions
      });

    } catch (error) {
      console.error('Error fetching referral data:', error);
      toast.error('Failed to load referral data');
    } finally {
      setLoading(false);
    }
  };

  const copyReferralLink = () => {
    if (profile?.referral_code) {
      const referralLink = `${window.location.origin}/auth?ref=${profile.referral_code}`;
      navigator.clipboard.writeText(referralLink);
      toast.success('Referral link copied to clipboard!');
    }
  };

  const shareReferralLink = async () => {
    if (profile?.referral_code) {
      const referralLink = `${window.location.origin}/auth?ref=${profile.referral_code}`;
      const shareText = `Join PennyHunt and start your investment journey! Use my referral code: ${profile.referral_code}`;
      
      if (navigator.share) {
        try {
          await navigator.share({
            title: 'Join PennyHunt',
            text: shareText,
            url: referralLink
          });
        } catch (error) {
          // Fallback to copy
          copyReferralLink();
        }
      } else {
        copyReferralLink();
      }
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
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Direct Referrals</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.directReferrals}</div>
            <p className="text-xs text-muted-foreground">
              {stats.activeReferrals} active members
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Commissions</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalCommissions.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Lifetime earnings
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.thisMonthCommissions.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Monthly commission
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Referral Code</CardTitle>
            <Share2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{profile?.referral_code || 'Loading...'}</div>
            <p className="text-xs text-muted-foreground">
              Your unique code
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Referral Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Share Your Referral Link</CardTitle>
          <CardDescription>
            Invite friends and family to start earning commissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 p-3 bg-gray-50 rounded-md text-sm font-mono">
              {profile?.referral_code ? 
                `${window.location.origin}/auth?ref=${profile.referral_code}` : 
                'Loading...'
              }
            </div>
            <div className="flex gap-2">
              <Button onClick={copyReferralLink} variant="outline" size="sm">
                <Copy className="h-4 w-4 mr-2" />
                Copy
              </Button>
              <Button onClick={shareReferralLink} size="sm">
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
            </div>
          </div>
          
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Referral Benefits:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Earn up to 20% direct referral bonus</li>
              <li>• Get multi-level commissions from your network</li>
              <li>• Receive instant notifications for new referrals</li>
              <li>• Build a passive income stream</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Referral List */}
      <Card>
        <CardHeader>
          <CardTitle>Your Referral Network</CardTitle>
          <CardDescription>
            People who joined using your referral code
          </CardDescription>
        </CardHeader>
        <CardContent>
          {referrals.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No referrals yet</h3>
              <p className="text-gray-500 mb-4">
                Start sharing your referral link to build your network
              </p>
              <Button onClick={shareReferralLink}>
                <Share2 className="h-4 w-4 mr-2" />
                Share Referral Link
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {referrals.map((referral) => (
                <div key={referral.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <Users className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-medium">
                        {referral.referred_profile?.first_name} {referral.referred_profile?.last_name}
                      </h4>
                      <p className="text-sm text-gray-500">
                        Joined: {new Date(referral.created_at!).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge 
                      variant={referral.referred_profile?.is_active ? "default" : "secondary"}
                      className="mb-2"
                    >
                      {referral.referred_profile?.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                    <p className="text-sm text-gray-500">
                      Level {referral.level}
                    </p>
                    {referral.total_commissions && Number(referral.total_commissions) > 0 && (
                      <p className="text-sm font-medium text-green-600">
                        ${Number(referral.total_commissions).toFixed(2)} earned
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Commission Structure */}
      <Card>
        <CardHeader>
          <CardTitle>Commission Structure</CardTitle>
          <CardDescription>
            How you earn from your referral network
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium text-blue-600 mb-2">Level 1 - Direct Referrals</h4>
              <p className="text-2xl font-bold mb-1">10-20%</p>
              <p className="text-sm text-gray-500">
                Commission on their investments
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium text-green-600 mb-2">Level 2-3 - Indirect</h4>
              <p className="text-2xl font-bold mb-1">5-15%</p>
              <p className="text-sm text-gray-500">
                Commission from their referrals
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium text-purple-600 mb-2">Level 4+ - Deep Network</h4>
              <p className="text-2xl font-bold mb-1">3-7%</p>
              <p className="text-sm text-gray-500">
                Extended network earnings
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
