import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs } from '../ui/vercel-tabs';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '../../contexts/AuthContext';
import { setStoreStatus, getStoreStatus } from '../../lib/database';
import { ArrowLeft, Store, Bell, MessageSquare, DollarSign, AlertCircle, CheckCircle } from 'lucide-react';
import logo from '../../images/OnFries-Logo.png';
import TextFormatter from '../../lib/textFormatter';
import CouponManagement from './CouponManagement';

interface AdminSettingsProps {
  onNavigate: (page: string) => void;
}

interface StoreSettings {
  storeOpen: boolean;
  promotionalBanner: {
    enabled: boolean;
    title: string;
    message: string;
    backgroundColor: string;
    textColor: string;
  };
  notifications: {
    orderNotifications: boolean;
    lowStockAlerts: boolean;
    newCustomerAlerts: boolean;
  };
  business: {
    openingTime: string;
    closingTime: string;
    estimatedPrepTime: number;
    minimumOrderAmount: number;
  };
  advanced: {
    maintenanceMode: boolean;
    debugMode: boolean;
    analyticsEnabled: boolean;
  };
}

const AdminSettings: React.FC<AdminSettingsProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [settings, setSettings] = useState<StoreSettings>({
    storeOpen: true,
    promotionalBanner: {
      enabled: false,
      title: 'Welcome to OnFries!',
      message: 'USE CODE "STEAKMAN" AT CHECKOUT FOR 5% OFF',
      backgroundColor: '#ff6b35',
      textColor: '#ffffff'
    },
    notifications: {
      orderNotifications: true,
      lowStockAlerts: true,
      newCustomerAlerts: false
    },
    business: {
      openingTime: '09:00',
      closingTime: '22:00',
      estimatedPrepTime: 20,
      minimumOrderAmount: 10.00
    },
    advanced: {
      maintenanceMode: false,
      debugMode: false,
      analyticsEnabled: true
    }
  });
  const [isLoading, setIsLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [selectedTab, setSelectedTab] = useState('store');

  const settingsTabs = [
    { id: "store", label: "Store" },
    { id: "promotions", label: "Promotions" },
    { id: "loyalty", label: "Loyalty" },
    { id: "notifications", label: "Notifications" },
    { id: "business", label: "Business" },
    { id: "advanced", label: "Advanced" }
  ];

  useEffect(() => {
    loadSettings();
  }, []);


  const loadSettings = async () => {
    try {
      setIsLoading(true);
      // Load store status
      const storeOpen = await getStoreStatus();
      setSettings(prev => ({ ...prev, storeOpen }));
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaveStatus('saving');
      
      // Save store status
      if (settings.storeOpen !== undefined) {
        await setStoreStatus(settings.storeOpen);
      }

      // Here you would save other settings to your database/localStorage
      localStorage.setItem('adminSettings', JSON.stringify(settings));
      
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      console.error('Error saving settings:', error);
      setSaveStatus('error');
    }
  };

  const updateStoreSetting = <K extends keyof StoreSettings>(key: K, value: StoreSettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const updateNestedSetting = <T extends keyof StoreSettings>(
    parent: T, 
    child: keyof StoreSettings[T], 
    value: any
  ) => {
    setSettings(prev => ({
      ...prev,
      [parent]: {
        ...(prev[parent] as any),
        [child]: value
      }
    }));
  };

  if (!user?.isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-2">Access Denied</h1>
          <p className="text-muted-foreground">You don't have permission to access admin settings.</p>
          <Button onClick={() => onNavigate('customer')} className="mt-4">
            Go to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="outline"
            onClick={() => onNavigate('admin')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <div className="flex items-center gap-2">
            {saveStatus === 'saved' && (
              <Badge variant="default" className="bg-green-500">
                <CheckCircle className="w-3 h-3 mr-1" />
                Saved
              </Badge>
            )}
            <Button onClick={handleSave} disabled={isLoading || saveStatus === 'saving'}>
              {saveStatus === 'saving' ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>

        <div className="mb-8">
          <div className="flex flex-col md:grid md:grid-cols-3 md:items-center mb-4">
            <img src={logo} alt="OnFries Logo" className="w-auto h-40 md:h-48 mb-4 md:mb-0 md:col-start-1 md:justify-self-start md:mt-4 object-contain" />
            <div className="text-center md:col-start-2 md:justify-self-center">
              <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">Admin Settings</h1>
              <p className="text-sm md:text-base text-muted-foreground">Manage your store settings and preferences</p>
            </div>
          </div>
        </div>

        <div className="mb-8 flex justify-center">
          <div className="w-full max-w-4xl">
            <div className="mb-4">
              <Tabs
                tabs={settingsTabs}
                onTabChange={(tabId) => setSelectedTab(tabId)}
              />
            </div>
          </div>
        </div>

        <div className="space-y-6 mt-6">
          {/* Store Settings */}
          {selectedTab === 'store' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Store className="w-5 h-5" />
                  Store Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-3 items-center">
                  <div></div>
                  <div className="text-center col-start-2">
                    <Label className="text-base font-medium">Store Open</Label>
                    <p className="text-sm text-muted-foreground">
                      Customers can only place orders when the store is open
                    </p>
                  </div>
                  <div className="justify-self-end">
                    <Switch
                      checked={settings.storeOpen}
                      onCheckedChange={(checked) => updateStoreSetting('storeOpen', checked)}
                    />
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="pt-4">
                    <Label htmlFor="openingTime" className="mb-4">Opening Time</Label>
                    <Input
                      id="openingTime"
                      type="time"
                      value={settings.business.openingTime}
                      onChange={(e) => updateNestedSetting('business', 'openingTime', e.target.value)}
                      className="mt-2"
                    />
                  </div>
                  <div className="pt-4">
                    <Label htmlFor="closingTime" className="mb-4">Closing Time</Label>
                    <Input
                      id="closingTime"
                      type="time"
                      value={settings.business.closingTime}
                      onChange={(e) => updateNestedSetting('business', 'closingTime', e.target.value)}
                      className="mt-2"
                    />
                  </div>
                </div>

                <Separator />

                <div className="pt-4">
                  <Label htmlFor="prepTime" className="mb-4">Estimated Preparation Time (minutes)</Label>
                  <Input
                    id="prepTime"
                    type="number"
                    value={settings.business.estimatedPrepTime}
                    onChange={(e) => updateNestedSetting('business', 'estimatedPrepTime', parseInt(e.target.value))}
                    min="5"
                    max="120"
                    className="mt-2"
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Promotions */}
          {selectedTab === 'promotions' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Promotional Banner
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-3 items-center">
                  <div></div>
                  <div className="text-center col-start-2">
                    <Label className="text-base font-medium">Enable Promotional Banner</Label>
                    <p className="text-sm text-muted-foreground">
                      Show a banner on the customer page with promotional content
                    </p>
                  </div>
                  <div className="justify-self-end">
                    <Switch
                      checked={settings.promotionalBanner.enabled}
                      onCheckedChange={(checked) => updateNestedSetting('promotionalBanner', 'enabled', checked)}
                    />
                  </div>
                </div>

                {settings.promotionalBanner.enabled && (
                  <>
                    <Separator />

                    <div className="space-y-4">
                      <div className="pt-4">
                        <Label htmlFor="bannerTitle" className="mb-4">Banner Title</Label>
                        <Input
                          id="bannerTitle"
                          value={settings.promotionalBanner.title}
                          onChange={(e) => updateNestedSetting('promotionalBanner', 'title', e.target.value)}
                          placeholder="Enter banner title"
                        />
                      </div>

                      <div className="pt-4">
                        <Label htmlFor="bannerMessage" className="mb-4">Banner Message</Label>
                        <TextFormatter
                          value={settings.promotionalBanner.message}
                          onChange={(html) => updateNestedSetting('promotionalBanner', 'message', html)}
                          placeholder="Enter banner message with text formatting"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Use the toolbar to format text with bold, italic, size, and colors
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                        <div>
                          <Label htmlFor="bgColor" className="mb-4">Background Color</Label>
                          <div className="flex gap-2">
                            <Input
                              id="bgColor"
                              type="color"
                              value={settings.promotionalBanner.backgroundColor}
                              onChange={(e) => updateNestedSetting('promotionalBanner', 'backgroundColor', e.target.value)}
                              className="w-20"
                            />
                            <Input
                              value={settings.promotionalBanner.backgroundColor}
                              onChange={(e) => updateNestedSetting('promotionalBanner', 'backgroundColor', e.target.value)}
                              placeholder="#ff6b35"
                            />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="textColor" className="mb-4">Text Color</Label>
                          <div className="flex gap-2">
                            <Input
                              id="textColor"
                              type="color"
                              value={settings.promotionalBanner.textColor}
                              onChange={(e) => updateNestedSetting('promotionalBanner', 'textColor', e.target.value)}
                              className="w-20"
                            />
                            <Input
                              value={settings.promotionalBanner.textColor}
                              onChange={(e) => updateNestedSetting('promotionalBanner', 'textColor', e.target.value)}
                              placeholder="#ffffff"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Preview */}
                      <div>
                        <Label className="mb-2">Preview</Label>
                        <div
                          className="py-2 px-4 text-center rounded-lg mt-2"
                          style={{
                            backgroundColor: settings.promotionalBanner.backgroundColor,
                            color: settings.promotionalBanner.textColor
                          }}
                        >
                          <p className="text-sm font-bold" dangerouslySetInnerHTML={{ __html: settings.promotionalBanner.message }} />
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          )}

          {/* Loyalty Management */}
          {selectedTab === 'loyalty' && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold">Loyalty Management</h2>
                <p className="text-muted-foreground">Create and manage loyalty coupons for customers</p>
              </div>
              <CouponManagement />
            </div>
          )}

          {/* Notifications */}
          {selectedTab === 'notifications' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  Notification Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-3 items-center">
                  <div></div>
                  <div className="text-center col-start-2">
                    <Label className="text-base font-medium">Order Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Get notified when new orders are placed
                    </p>
                  </div>
                  <div className="justify-self-end">
                    <Switch
                      checked={settings.notifications.orderNotifications}
                      onCheckedChange={(checked) => updateNestedSetting('notifications', 'orderNotifications', checked)}
                    />
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-3 items-center">
                  <div></div>
                  <div className="text-center col-start-2">
                    <Label className="text-base font-medium">Low Stock Alerts</Label>
                    <p className="text-sm text-muted-foreground">
                      Get notified when items are running low on stock
                    </p>
                  </div>
                  <div className="justify-self-end">
                    <Switch
                      checked={settings.notifications.lowStockAlerts}
                      onCheckedChange={(checked) => updateNestedSetting('notifications', 'lowStockAlerts', checked)}
                    />
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-3 items-center">
                  <div></div>
                  <div className="text-center col-start-2">
                    <Label className="text-base font-medium">New Customer Alerts</Label>
                    <p className="text-sm text-muted-foreground">
                      Get notified when new customers register
                    </p>
                  </div>
                  <div className="justify-self-end">
                    <Switch
                      checked={settings.notifications.newCustomerAlerts}
                      onCheckedChange={(checked) => updateNestedSetting('notifications', 'newCustomerAlerts', checked)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Business Settings */}
          {selectedTab === 'business' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Business Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="pt-4">
                  <Label htmlFor="minOrder" className="mb-4">Minimum Order Amount (£)</Label>
                  <Input
                    id="minOrder"
                    type="number"
                    step="0.01"
                    value={settings.business.minimumOrderAmount}
                    onChange={(e) => updateNestedSetting('business', 'minimumOrderAmount', parseFloat(e.target.value))}
                    min="0"
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Minimum amount required for orders to be accepted
                  </p>
                </div>

                <Separator />

                <div className="pt-4">
                  <Label className="text-base font-medium mb-4">Operating Hours</Label>
                  <p className="text-sm text-muted-foreground mb-4">
                    These hours are displayed to customers and used for automatic status updates
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="openTime" className="mb-4">Opening Time</Label>
                      <Input
                        id="openTime"
                        type="time"
                        value={settings.business.openingTime}
                        onChange={(e) => updateNestedSetting('business', 'openingTime', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="closeTime" className="mb-4">Closing Time</Label>
                      <Input
                        id="closeTime"
                        type="time"
                        value={settings.business.closingTime}
                        onChange={(e) => updateNestedSetting('business', 'closingTime', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Advanced Settings */}
          {selectedTab === 'advanced' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  Advanced Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-3 items-center">
                  <div></div>
                  <div className="text-center col-start-2">
                    <Label className="text-base font-medium">Maintenance Mode</Label>
                    <p className="text-sm text-muted-foreground">
                      Disable the store temporarily for maintenance
                    </p>
                  </div>
                  <div className="justify-self-end">
                    <Switch
                      checked={settings.advanced.maintenanceMode}
                      onCheckedChange={(checked) => updateNestedSetting('advanced', 'maintenanceMode', checked)}
                    />
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-3 items-center">
                  <div></div>
                  <div className="text-center col-start-2">
                    <Label className="text-base font-medium">Debug Mode</Label>
                    <p className="text-sm text-muted-foreground">
                      Enable detailed logging and error reporting
                    </p>
                  </div>
                  <div className="justify-self-end">
                    <Switch
                      checked={settings.advanced.debugMode}
                      onCheckedChange={(checked) => updateNestedSetting('advanced', 'debugMode', checked)}
                    />
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-3 items-center">
                  <div></div>
                  <div className="text-center col-start-2">
                    <Label className="text-base font-medium">Analytics</Label>
                    <p className="text-sm text-muted-foreground">
                      Enable analytics tracking for business insights
                    </p>
                  </div>
                  <div className="justify-self-end">
                    <Switch
                      checked={settings.advanced.analyticsEnabled}
                      onCheckedChange={(checked) => updateNestedSetting('advanced', 'analyticsEnabled', checked)}
                    />
                  </div>
                </div>

                <Separator />

                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                  <h4 className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">⚠️ Warning</h4>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300">
                    Advanced settings can significantly affect your store's functionality.
                    Only modify these if you understand the implications.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;