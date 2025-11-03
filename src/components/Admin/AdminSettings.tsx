import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '../../contexts/AuthContext';
import { setStoreStatus, getStoreStatus } from '../../lib/database';
import { ArrowLeft, Store, Bell, MessageSquare, DollarSign, AlertCircle, CheckCircle } from 'lucide-react';

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
      message: 'Check out our amazing steak and fries!',
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
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => onNavigate('admin')}
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Admin Settings</h1>
              <p className="text-muted-foreground">Manage your store settings and preferences</p>
            </div>
          </div>
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

        <Tabs defaultValue="store" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="store">Store</TabsTrigger>
            <TabsTrigger value="promotions">Promotions</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="business">Business</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
          </TabsList>

          {/* Store Settings */}
          <TabsContent value="store">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Store className="w-5 h-5" />
                  Store Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">Store Open</Label>
                    <p className="text-sm text-muted-foreground">
                      Customers can only place orders when the store is open
                    </p>
                  </div>
                  <Switch
                    checked={settings.storeOpen}
                    onCheckedChange={(checked) => updateStoreSetting('storeOpen', checked)}
                  />
                </div>
                
                <Separator />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="openingTime">Opening Time</Label>
                    <Input
                      id="openingTime"
                      type="time"
                      value={settings.business.openingTime}
                      onChange={(e) => updateNestedSetting('business', 'openingTime', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="closingTime">Closing Time</Label>
                    <Input
                      id="closingTime"
                      type="time"
                      value={settings.business.closingTime}
                      onChange={(e) => updateNestedSetting('business', 'closingTime', e.target.value)}
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="prepTime">Estimated Preparation Time (minutes)</Label>
                  <Input
                    id="prepTime"
                    type="number"
                    value={settings.business.estimatedPrepTime}
                    onChange={(e) => updateNestedSetting('business', 'estimatedPrepTime', parseInt(e.target.value))}
                    min="5"
                    max="120"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Promotions */}
          <TabsContent value="promotions">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Promotional Banner
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">Enable Promotional Banner</Label>
                    <p className="text-sm text-muted-foreground">
                      Show a banner on the customer page with promotional content
                    </p>
                  </div>
                  <Switch
                    checked={settings.promotionalBanner.enabled}
                    onCheckedChange={(checked) => updateNestedSetting('promotionalBanner', 'enabled', checked)}
                  />
                </div>
                
                {settings.promotionalBanner.enabled && (
                  <>
                    <Separator />
                    
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="bannerTitle">Banner Title</Label>
                        <Input
                          id="bannerTitle"
                          value={settings.promotionalBanner.title}
                          onChange={(e) => updateNestedSetting('promotionalBanner', 'title', e.target.value)}
                          placeholder="Enter banner title"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="bannerMessage">Banner Message</Label>
                        <Textarea
                          id="bannerMessage"
                          value={settings.promotionalBanner.message}
                          onChange={(e) => updateNestedSetting('promotionalBanner', 'message', e.target.value)}
                          placeholder="Enter banner message"
                          rows={3}
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="bgColor">Background Color</Label>
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
                          <Label htmlFor="textColor">Text Color</Label>
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
                        <Label>Preview</Label>
                        <div 
                          className="p-4 rounded-lg mt-2"
                          style={{ 
                            backgroundColor: settings.promotionalBanner.backgroundColor,
                            color: settings.promotionalBanner.textColor
                          }}
                        >
                          <h3 className="font-bold text-lg">{settings.promotionalBanner.title}</h3>
                          <p>{settings.promotionalBanner.message}</p>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications */}
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  Notification Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">Order Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Get notified when new orders are placed
                    </p>
                  </div>
                  <Switch
                    checked={settings.notifications.orderNotifications}
                    onCheckedChange={(checked) => updateNestedSetting('notifications', 'orderNotifications', checked)}
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">Low Stock Alerts</Label>
                    <p className="text-sm text-muted-foreground">
                      Get notified when items are running low on stock
                    </p>
                  </div>
                  <Switch
                    checked={settings.notifications.lowStockAlerts}
                    onCheckedChange={(checked) => updateNestedSetting('notifications', 'lowStockAlerts', checked)}
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">New Customer Alerts</Label>
                    <p className="text-sm text-muted-foreground">
                      Get notified when new customers register
                    </p>
                  </div>
                  <Switch
                    checked={settings.notifications.newCustomerAlerts}
                    onCheckedChange={(checked) => updateNestedSetting('notifications', 'newCustomerAlerts', checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Business Settings */}
          <TabsContent value="business">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Business Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="minOrder">Minimum Order Amount (£)</Label>
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
                
                <div>
                  <Label className="text-base font-medium">Operating Hours</Label>
                  <p className="text-sm text-muted-foreground mb-4">
                    These hours are displayed to customers and used for automatic status updates
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="openTime">Opening Time</Label>
                      <Input
                        id="openTime"
                        type="time"
                        value={settings.business.openingTime}
                        onChange={(e) => updateNestedSetting('business', 'openingTime', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="closeTime">Closing Time</Label>
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
          </TabsContent>

          {/* Advanced Settings */}
          <TabsContent value="advanced">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  Advanced Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">Maintenance Mode</Label>
                    <p className="text-sm text-muted-foreground">
                      Disable the store temporarily for maintenance
                    </p>
                  </div>
                  <Switch
                    checked={settings.advanced.maintenanceMode}
                    onCheckedChange={(checked) => updateNestedSetting('advanced', 'maintenanceMode', checked)}
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">Debug Mode</Label>
                    <p className="text-sm text-muted-foreground">
                      Enable detailed logging and error reporting
                    </p>
                  </div>
                  <Switch
                    checked={settings.advanced.debugMode}
                    onCheckedChange={(checked) => updateNestedSetting('advanced', 'debugMode', checked)}
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">Analytics</Label>
                    <p className="text-sm text-muted-foreground">
                      Enable analytics tracking for business insights
                    </p>
                  </div>
                  <Switch
                    checked={settings.advanced.analyticsEnabled}
                    onCheckedChange={(checked) => updateNestedSetting('advanced', 'analyticsEnabled', checked)}
                  />
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
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminSettings;