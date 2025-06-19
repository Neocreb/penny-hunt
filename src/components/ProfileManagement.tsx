
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Shield, Phone, MapPin, Calendar, Mail, Edit, Save, X } from 'lucide-react';
import { useProfile } from '@/hooks/useProfile';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export function ProfileManagement() {
  const { user } = useAuth();
  const { profile, loading, updateProfile } = useProfile();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    address: '',
    city: '',
    country: '',
    postal_code: '',
    date_of_birth: ''
  });

  React.useEffect(() => {
    if (profile) {
      setFormData({
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        phone: profile.phone || '',
        address: profile.address || '',
        city: profile.city || '',
        country: profile.country || '',
        postal_code: profile.postal_code || '',
        date_of_birth: profile.date_of_birth || ''
      });
    }
  }, [profile]);

  const handleSave = async () => {
    setSaving(true);
    
    try {
      const result = await updateProfile(formData);
      
      if (result?.success) {
        toast.success('Profile updated successfully!');
        setEditing(false);
      } else {
        toast.error('Failed to update profile');
      }
    } catch (error) {
      toast.error('An error occurred while updating profile');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (profile) {
      setFormData({
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        phone: profile.phone || '',
        address: profile.address || '',
        city: profile.city || '',
        country: profile.country || '',
        postal_code: profile.postal_code || '',
        date_of_birth: profile.date_of_birth || ''
      });
    }
    setEditing(false);
  };

  const getKycStatusColor = (status: string) => {
    switch (status) {
      case 'verified':
        return 'default';
      case 'rejected':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-gray-500">Failed to load profile</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={profile.avatar_url || ''} />
                <AvatarFallback className="bg-blue-100 text-blue-600 text-lg font-semibold">
                  {profile.first_name?.[0]}{profile.last_name?.[0]}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-2xl">
                  {profile.first_name} {profile.last_name}
                </CardTitle>
                <CardDescription className="flex items-center mt-1">
                  <Mail className="h-4 w-4 mr-1" />
                  {profile.email}
                </CardDescription>
                <div className="flex items-center space-x-2 mt-2">
                  <Badge variant={getKycStatusColor(profile.kyc_status || 'pending')}>
                    <Shield className="h-3 w-3 mr-1" />
                    KYC {profile.kyc_status || 'Pending'}
                  </Badge>
                  <Badge variant={profile.is_active ? 'default' : 'secondary'}>
                    {profile.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {!editing ? (
                <Button onClick={() => setEditing(true)} variant="outline" size="sm">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              ) : (
                <>
                  <Button 
                    onClick={handleSave} 
                    size="sm" 
                    disabled={saving}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {saving ? 'Saving...' : 'Save'}
                  </Button>
                  <Button 
                    onClick={handleCancel} 
                    variant="outline" 
                    size="sm"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Profile Information */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="h-5 w-5 mr-2" />
              Personal Information
            </CardTitle>
            <CardDescription>
              Your basic profile information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="first_name">First Name</Label>
                {editing ? (
                  <Input
                    id="first_name"
                    value={formData.first_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, first_name: e.target.value }))}
                  />
                ) : (
                  <p className="p-2 bg-gray-50 rounded">{profile.first_name}</p>
                )}
              </div>
              <div>
                <Label htmlFor="last_name">Last Name</Label>
                {editing ? (
                  <Input
                    id="last_name"
                    value={formData.last_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, last_name: e.target.value }))}
                  />
                ) : (
                  <p className="p-2 bg-gray-50 rounded">{profile.last_name}</p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="phone">Phone Number</Label>
              {editing ? (
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="Enter your phone number"
                />
              ) : (
                <p className="p-2 bg-gray-50 rounded flex items-center">
                  <Phone className="h-4 w-4 mr-2" />
                  {profile.phone || 'Not provided'}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="date_of_birth">Date of Birth</Label>
              {editing ? (
                <Input
                  id="date_of_birth"
                  type="date"
                  value={formData.date_of_birth}
                  onChange={(e) => setFormData(prev => ({ ...prev, date_of_birth: e.target.value }))}
                />
              ) : (
                <p className="p-2 bg-gray-50 rounded flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  {profile.date_of_birth ? new Date(profile.date_of_birth).toLocaleDateString() : 'Not provided'}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <MapPin className="h-5 w-5 mr-2" />
              Address Information
            </CardTitle>
            <CardDescription>
              Your location and contact details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="address">Street Address</Label>
              {editing ? (
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="Enter your street address"
                  rows={2}
                />
              ) : (
                <p className="p-2 bg-gray-50 rounded">
                  {profile.address || 'Not provided'}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="city">City</Label>
                {editing ? (
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                    placeholder="Enter your city"
                  />
                ) : (
                  <p className="p-2 bg-gray-50 rounded">{profile.city || 'Not provided'}</p>
                )}
              </div>
              <div>
                <Label htmlFor="postal_code">Postal Code</Label>
                {editing ? (
                  <Input
                    id="postal_code"
                    value={formData.postal_code}
                    onChange={(e) => setFormData(prev => ({ ...prev, postal_code: e.target.value }))}
                    placeholder="Enter postal code"
                  />
                ) : (
                  <p className="p-2 bg-gray-50 rounded">{profile.postal_code || 'Not provided'}</p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="country">Country</Label>
              {editing ? (
                <Input
                  id="country"
                  value={formData.country}
                  onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
                  placeholder="Enter your country"
                />
              ) : (
                <p className="p-2 bg-gray-50 rounded">{profile.country || 'Not provided'}</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Account Details */}
      <Card>
        <CardHeader>
          <CardTitle>Account Details</CardTitle>
          <CardDescription>
            Important account information and settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-sm text-gray-600 mb-1">Referral Code</h4>
              <p className="font-mono text-lg font-bold text-blue-600">
                {profile.referral_code}
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-sm text-gray-600 mb-1">Member Since</h4>
              <p className="text-lg font-semibold">
                {new Date(profile.created_at!).toLocaleDateString()}
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-sm text-gray-600 mb-1">Account Status</h4>
              <Badge variant={profile.is_active ? 'default' : 'secondary'} className="text-sm">
                {profile.is_active ? 'Active' : 'Inactive'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* KYC Information */}
      {profile.kyc_status !== 'verified' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="h-5 w-5 mr-2" />
              KYC Verification
            </CardTitle>
            <CardDescription>
              Complete your identity verification to unlock all features
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
              <div>
                <h4 className="font-medium text-yellow-800">Verification Required</h4>
                <p className="text-sm text-yellow-700 mt-1">
                  Complete KYC verification to access withdrawals and higher investment limits
                </p>
              </div>
              <Button variant="outline" size="sm">
                Start Verification
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
