import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, Clock, MapPin, Phone, Navigation, Loader2, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { useMenuItems } from '../../hooks/useMenuItems';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { getOrderingStatus } from '../../lib/utils';
import { Component as FloatingAuthModal } from '../ui/sign-in-flo';

// Menu Item Card Component
const MenuItemCard: React.FC<{ item: any; orderingStatus: any; onAddToCart: (item: any) => void }> = ({ item, orderingStatus, onAddToCart }) => {
  return (
    <Card className="hover:shadow-lg transition-all duration-200 hover:border-yellow-400 group border-yellow-200">
      <CardContent className="p-6">
        <div className="flex flex-col h-full">
          <div className="mb-3">
            <h3 className="text-lg font-semibold text-foreground group-hover:text-yellow-600 transition-colors">
              {item.name}
            </h3>
            <span className="text-xl font-bold text-yellow-600 px-2 py-1 inline-block mt-2">
              £{item.price.toFixed(2)}
            </span>
          </div>
          
          <p className="text-sm text-muted-foreground leading-relaxed mb-4 flex-grow">
            {item.description}
          </p>
          
          <div className="flex items-center justify-between mt-auto">
            <div className="flex items-center text-xs text-muted-foreground">
              <Clock className="w-3 h-3 mr-1" />
              <span>{item.preparationTime} min</span>
            </div>
            
            <Button
              size="sm"
              onClick={() => onAddToCart(item)}
              disabled={!item.isAvailable || !orderingStatus.allowed}
              variant={!orderingStatus.allowed ? 'secondary' : 'default'}
              className="bg-yellow-500 hover:bg-yellow-600 text-black font-medium px-4"
            >
              {!orderingStatus.allowed ? (
                <>
                  <Clock className="w-4 h-4 mr-1" />
                  Closed
                </>
              ) : orderingStatus.isPreOrder ? (
                <>
                  <Plus className="w-4 h-4 mr-1" />
                  Pre-Order
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-1" />
                  Add
                </>
              )}
            </Button>
          </div>
          
          {!item.isAvailable && (
            <div className="mt-2">
              <Badge variant="destructive" className="text-xs">
                Currently Unavailable
              </Badge>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

const MenuPage: React.FC = () => {
  const { addItem } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();
  const { menuItems, loading, error, refreshMenu } = useMenuItems();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Steak');
  const [showAddOns, setShowAddOns] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [showFAQ, setShowFAQ] = useState(false);
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);
  const [showCustomizeDialog, setShowCustomizeDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [selectedAddOns, setSelectedAddOns] = useState<{[key: string]: {item: any, quantity: number}}>({});
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [orderingStatus, setOrderingStatus] = useState({ allowed: true, isPreOrder: false });
  const [selectedSauce, setSelectedSauce] = useState<string>('');

  useEffect(() => {
    const fetchOrderingStatus = async () => {
      try {
        const status = await getOrderingStatus();
        console.log('Fetched ordering status:', status);
        setOrderingStatus(status);
      } catch (error) {
        console.error('Error fetching ordering status:', error);
      }
    };

    // Fetch immediately
    fetchOrderingStatus();

    // Poll every 5 seconds to check for admin status changes (reduced for testing)
    const interval = setInterval(fetchOrderingStatus, 5000);

    return () => clearInterval(interval);
  }, []);

  const filteredItems = menuItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.description.toLowerCase().includes(searchTerm.toLowerCase());

    let matchesCategory = true;
    if (selectedCategory === 'Steak') {
      matchesCategory = item.category === 'Main Courses' && item.name !== 'Fries Only';
    } else if (selectedCategory === 'Fries') {
      // For fries filter, show fries items
      matchesCategory = item.name === 'Fries Only';
    } else if (selectedCategory === 'Kids') {
      matchesCategory = item.category === 'Kids';
    } else if (selectedCategory === 'Drinks') {
      matchesCategory = item.category === 'Drinks';
    } else if (selectedCategory === 'All') {
      matchesCategory = true;
    } else {
      matchesCategory = item.category === selectedCategory;
    }

    return matchesSearch && matchesCategory && item.isAvailable && item.name !== 'Custom Item';
  });

  const handleAddToCart = (item: any) => {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }

    if (!orderingStatus.allowed) {
      toast({
        title: 'Ordering not available',
        description: 'The food truck is currently closed. Please check our hours.',
        variant: 'destructive',
      });
      return;
    }

    // Handle different item types
    if (item.category === 'Main Courses') {
      // For main courses, show customization dialog
      setSelectedItem(item);
      setShowCustomizeDialog(true);
    } else if (item.category === 'Kids') {
      if (item.name === 'Kids Meal') {
        // For Kids Meal, show sauce selection dialog
        setSelectedItem(item);
        setShowCustomizeDialog(true);
      } else {
        // For Kids Fries and £1 Steak Cone, add directly to cart
        addItem(item);
        toast({
          title: orderingStatus.isPreOrder ? 'Pre-order added to cart' : 'Added to cart',
          description: `${item.name} has been added to your cart.`,
        });
      }
    } else {
      // For drinks and other items, add directly to cart
      addItem(item);
      toast({
        title: orderingStatus.isPreOrder ? 'Pre-order added to cart' : 'Added to cart',
        description: `${item.name} has been added to your cart.`,
      });
    }
  };

  const handleConfirmCustomize = () => {
    let addOnsWithQuantities = [];
    let itemName = selectedItem.name;
    
    // Handle Kids Meal sauce selection
    if (selectedItem.category === 'Kids' && selectedItem.name === 'Kids Meal') {
      if (selectedSauce) {
        const selectedSauceItem = menuItems.find(item => item.id === selectedSauce);
        if (selectedSauceItem) {
          addOnsWithQuantities = [{
            ...selectedSauceItem,
            quantity: 1
          }];
          itemName = `${selectedItem.name} + ${selectedSauceItem.name}`;
        }
      }
    } else {
      // Handle regular add-ons for main courses
      addOnsWithQuantities = Object.values(selectedAddOns).map(({ item, quantity }) => ({
        ...item,
        quantity
      }));
      
      if (addOnsWithQuantities.length > 0) {
        itemName = selectedItem.name + ' + Add-ons';
      }
    }
    
    // Calculate total price with add-ons quantities
    const totalPrice = selectedItem.price + addOnsWithQuantities.reduce((sum, addOn) => sum + (addOn.price * addOn.quantity), 0);
    
    // Create customized item
    const customizedItem = {
      ...selectedItem,
      price: totalPrice,
      addOns: addOnsWithQuantities,
      name: itemName
    };

    addItem(customizedItem);
    toast({
      title: orderingStatus.isPreOrder ? 'Custom order added to cart' : 'Order added to cart',
      description: `${customizedItem.name} has been added to your cart.`,
    });

    // Reset state
    setShowCustomizeDialog(false);
    setSelectedItem(null);
    setSelectedAddOns({});
    setSelectedSauce('');
  };

  const updateAddOnQuantity = (addOn: any, newQuantity: number) => {
    setSelectedAddOns(prev => {
      const newSelected = { ...prev };
      if (newQuantity === 0) {
        delete newSelected[addOn.id];
      } else {
        newSelected[addOn.id] = {
          item: addOn,
          quantity: newQuantity
        };
      }
      return newSelected;
    });
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshMenu();
    setIsRefreshing(false);
  };

  const noItemsFound = (() => {
    let hasItems = false;
    if (selectedCategory === 'Steak') {
      hasItems = filteredItems.some(item => item.category === 'Main Courses');
    } else if (selectedCategory === 'Fries') {
      hasItems = filteredItems.length > 0;
    } else if (selectedCategory === 'Kids') {
      hasItems = filteredItems.length > 0;
    } else if (selectedCategory === 'Drinks') {
      hasItems = filteredItems.length > 0;
    } else if (selectedCategory === 'All') {
      hasItems = filteredItems.length > 0;
    }
    
    return !hasItems && (
      <div className="text-center py-12">
        <p className="text-xl text-muted-foreground">No items found matching your criteria.</p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => {
            setSearchTerm('');
            setSelectedCategory('Steak');
          }}
        >
          Clear Filters
        </Button>
      </div>
    );
  })();

  return (
    <div className="min-h-screen bg-background py-4">
      <div className="container mx-auto px-4">
        <div className="text-center mb-4">
          <h1 className="text-4xl font-bold text-foreground mb-2">Our Menu</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Fresh steak and fries with premium add-ons
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="w-full md:w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Search menu items..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-2 justify-center md:justify-end">
              {['All', 'Steak', 'Fries', 'Kids', 'Drinks'].map((filter) => (
                <Button
                  key={filter}
                  variant={selectedCategory === filter ? 'default' : 'outline'}
                  onClick={() => setSelectedCategory(filter)}
                  className="text-sm"
                >
                  {filter}
                </Button>
              ))}
              
              <Button
                variant="outline"
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="text-sm ml-2"
              >
                {isRefreshing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                    Refreshing...
                  </>
                ) : (
                  <>
                    Refresh Menu
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-yellow-600" />
            <p className="text-xl text-muted-foreground">Loading menu items...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-12">
            <p className="text-xl text-destructive mb-4">Error loading menu items</p>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={() => window.location.reload()} variant="outline">
              Retry
            </Button>
          </div>
        )}

        {/* Menu Items */}
        {!loading && !error && (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column - Menu Items */}
            <div className="lg:col-span-2">
              {/* Menu Items Section */}
              {selectedCategory === 'All' && (
                <div className="space-y-12">
                  {/* Main Menu Section */}
                  <div>
                    <h2 className="text-3xl font-bold text-center mb-8 text-yellow-600 border-b-2 border-yellow-200 pb-2">
                      Main Menu
                    </h2>
                    <div className="grid gap-6 md:grid-cols-1 max-w-md mx-auto">
                      {filteredItems.filter(item => item.category === 'Main Courses').map((item) => (
                        <MenuItemCard key={item.id} item={item} orderingStatus={orderingStatus} onAddToCart={handleAddToCart} />
                      ))}
                    </div>
                  </div>

                  {/* Kids Menu Section */}
                  <div>
                    <h2 className="text-3xl font-bold text-center mb-8 text-yellow-600 border-b-2 border-yellow-200 pb-2">
                      Kids Menu
                    </h2>
                    <div className="grid gap-6 md:grid-cols-1 max-w-md mx-auto">
                      {filteredItems.filter(item => item.category === 'Kids').map((item) => (
                        <MenuItemCard key={item.id} item={item} orderingStatus={orderingStatus} onAddToCart={handleAddToCart} />
                      ))}
                    </div>
                  </div>

                  {/* Drinks Section */}
                  <div>
                    <h2 className="text-3xl font-bold text-center mb-8 text-yellow-600 border-b-2 border-yellow-200 pb-2">
                      Drinks
                    </h2>
                    <div className="grid gap-6 md:grid-cols-1 max-w-md mx-auto">
                      {filteredItems.filter(item => item.category === 'Drinks').map((item) => (
                        <MenuItemCard key={item.id} item={item} orderingStatus={orderingStatus} onAddToCart={handleAddToCart} />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {selectedCategory === 'Steak' && (
                <div className="mb-12">
                  <h2 className="text-3xl font-bold text-center mb-8 text-yellow-600 border-b-2 border-yellow-200 pb-2">
                    Main Menu
                  </h2>
                  <div className="grid gap-6 md:grid-cols-1 max-w-md mx-auto">
                    {filteredItems.filter(item => item.category === 'Main Courses').map((item) => (
                      <MenuItemCard key={item.id} item={item} orderingStatus={orderingStatus} onAddToCart={handleAddToCart} />
                    ))}
                  </div>
                </div>
              )}

              {selectedCategory === 'Fries' && (
                <div className="mb-12">
                  <h2 className="text-3xl font-bold text-center mb-8 text-yellow-600 border-b-2 border-yellow-200 pb-2">
                    Fries Only
                  </h2>
                  <div className="grid gap-6 md:grid-cols-1 max-w-md mx-auto">
                    {filteredItems.map((item) => (
                      <MenuItemCard key={item.id} item={item} orderingStatus={orderingStatus} onAddToCart={handleAddToCart} />
                    ))}
                  </div>
                </div>
              )}

              {selectedCategory === 'Kids' && (
                <div className="mb-12">
                  <h2 className="text-3xl font-bold text-center mb-8 text-yellow-600 border-b-2 border-yellow-200 pb-2">
                    Kids Menu
                  </h2>
                  <div className="grid gap-6 md:grid-cols-1 max-w-md mx-auto">
                    {filteredItems.map((item) => (
                      <MenuItemCard key={item.id} item={item} orderingStatus={orderingStatus} onAddToCart={handleAddToCart} />
                    ))}
                  </div>
                </div>
              )}

              {selectedCategory === 'Drinks' && (
                <div className="mb-12">
                  <h2 className="text-3xl font-bold text-center mb-8 text-yellow-600 border-b-2 border-yellow-200 pb-2">
                    Drinks
                  </h2>
                  <div className="grid gap-6 md:grid-cols-1 max-w-md mx-auto">
                    {filteredItems.map((item) => (
                      <MenuItemCard key={item.id} item={item} orderingStatus={orderingStatus} onAddToCart={handleAddToCart} />
                    ))}
                  </div>
                </div>
              )}

              {/* Remove add-ons section from main menu display */}
              {showAddOns && (
                <div className="text-center mt-6">
                  <Button
                    variant="outline"
                    onClick={() => setShowAddOns(false)}
                    className="mr-4"
                  >
                    Skip Add-ons
                  </Button>
                  <Button
                    onClick={() => setShowAddOns(false)}
                    className="bg-yellow-500 hover:bg-yellow-600 text-black"
                  >
                    Continue to Cart
                  </Button>
                </div>
              )}

              {noItemsFound}
            </div>

            {/* Right Column - Location & Hours */}
            <div className="space-y-6">
              <Card className="mt-10">
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-4 flex items-center">
                    <Clock className="w-5 h-5 mr-2 text-yellow-600" />
                    Operating Hours
                  </h3>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="font-medium">Monday</span>
                      <span className="text-muted-foreground">24/7</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Tuesday</span>
                      <span className="text-muted-foreground">24/7</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Wednesday</span>
                      <span className="text-muted-foreground">24/7</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Thursday</span>
                      <span className="text-muted-foreground">24/7</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Friday</span>
                      <span className="text-muted-foreground">24/7</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Saturday</span>
                      <span className="text-muted-foreground">24/7</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Sunday</span>
                      <span className="text-muted-foreground">24/7</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold flex items-center">
                      <HelpCircle className="w-5 h-5 mr-2 text-yellow-600" />
                      FAQ
                    </h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowFAQ(!showFAQ)}
                      className="text-yellow-600 hover:text-yellow-700"
                    >
                      {showFAQ ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </Button>
                  </div>

                  {showFAQ && (
                    <div className="space-y-4">
                      <div className="border-b border-border pb-4">
                        <button
                          className="w-full text-left flex items-center justify-between py-2 hover:text-yellow-600 transition-colors"
                          onClick={() => setExpandedFAQ(expandedFAQ === 1 ? null : 1)}
                        >
                          <span className="font-medium">What type of steak do you serve?</span>
                          {expandedFAQ === 1 ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                        {expandedFAQ === 1 && (
                          <p className="text-sm text-muted-foreground mt-2">
                            We serve premium quality beef steaks, including ribeye, sirloin, and tenderloin cuts.
                            All our steaks are sourced from local suppliers and cooked to your preferred doneness.
                          </p>
                        )}
                      </div>

                      <div className="border-b border-border pb-4">
                        <button
                          className="w-full text-left flex items-center justify-between py-2 hover:text-yellow-600 transition-colors"
                          onClick={() => setExpandedFAQ(expandedFAQ === 2 ? null : 2)}
                        >
                          <span className="font-medium">How does the ordering process work?</span>
                          {expandedFAQ === 2 ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                        {expandedFAQ === 2 && (
                          <p className="text-sm text-muted-foreground mt-2">
                            Simply browse our menu, add items to your cart, and proceed to checkout.
                            You'll need to create an account or sign in to place an order. Orders can be placed
                            for immediate pickup or scheduled for later collection.
                          </p>
                        )}
                      </div>

                      <div>
                        <button
                          className="w-full text-left flex items-center justify-between py-2 hover:text-yellow-600 transition-colors"
                          onClick={() => setExpandedFAQ(expandedFAQ === 3 ? null : 3)}
                        >
                          <span className="font-medium">Do you accommodate dietary restrictions?</span>
                          {expandedFAQ === 3 ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                        {expandedFAQ === 3 && (
                          <p className="text-sm text-muted-foreground mt-2">
                            We can accommodate most dietary needs. Please contact us directly for allergies,
                            gluten-free options, or other special requirements. Our team will work with you
                            to ensure a safe and enjoyable dining experience.
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-4 flex items-center">
                    <MapPin className="w-5 h-5 mr-2 text-yellow-600" />
                    Find Us
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <p className="font-medium">Clock Tower, Kings Shade Walk</p>
                      <p className="text-muted-foreground">Epsom, England KT19 8EB</p>
                    </div>

                    <div className="flex items-center text-muted-foreground">
                      <Phone className="w-4 h-4 mr-2" />
                      <span>01234 567892</span>
                    </div>

                    <Button className="w-full" variant="outline">
                      <Navigation className="w-4 h-4 mr-2" />
                      Get Directions
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Customize Order Dialog */}
        {showCustomizeDialog && selectedItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
            <div className="relative w-full max-w-4xl mx-4 bg-background rounded-lg shadow-lg">
              <button
                onClick={() => setShowCustomizeDialog(false)}
                className="absolute -top-4 -right-4 z-[60] w-8 h-8 bg-background border border-border rounded-full flex items-center justify-center hover:bg-accent text-xl"
              >
                ×
              </button>
              
              <div className="p-8">
                <div className="mb-8">
                  <h2 className="text-3xl font-bold text-foreground mb-3">{selectedItem.name}</h2>
                  <p className="text-muted-foreground text-lg">{selectedItem.description}</p>
                  <p className="text-xl font-semibold text-yellow-600 mt-3">Base price: £{selectedItem.price.toFixed(2)}</p>
                </div>

                <div className="max-h-[500px] overflow-y-auto custom-scrollbar">
                  {selectedItem.category === 'Kids' && selectedItem.name === 'Kids Meal' ? (
                    /* Kids Meal Sauce Selection */
                    <div className="mb-8">
                      <h3 className="text-2xl font-semibold mb-6 text-foreground">Choose Your Sauce</h3>
                      <p className="text-muted-foreground mb-6">
                        Your Kids Meal includes a drink and one free sauce. Please choose your preferred sauce:
                      </p>
                      <div className="space-y-4">
                        {/* Check both Sauces and Add-ons categories for sauce items */}
                        {menuItems.filter(item =>
                          (item.category === 'Sauces' || item.category === 'Add-ons') &&
                          item.name.includes('Sauce')
                        ).map((sauce) => {
                          const isSelected = selectedSauce === sauce.id;
                          const isOtherSelected = selectedSauce !== '' && selectedSauce !== sauce.id;
                          return (
                            <div
                              key={sauce.id}
                              className={`p-6 border-2 rounded-xl cursor-pointer transition-all ${
                                isSelected
                                  ? 'border-yellow-500 bg-yellow-50'
                                  : isOtherSelected
                                    ? 'border-gray-300 bg-gray-50 opacity-50 cursor-not-allowed'
                                    : 'border-gray-300 hover:border-yellow-400 hover:bg-accent'
                              }`}
                              onClick={() => {
                                if (!isOtherSelected) {
                                  setSelectedSauce(sauce.id);
                                }
                              }}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                                    isSelected
                                      ? 'border-yellow-500 bg-yellow-500'
                                      : 'border-gray-400'
                                  }`}>
                                    {isSelected && (
                                      <div className="w-3 h-3 rounded-full bg-white"></div>
                                    )}
                                  </div>
                                  <div>
                                    <h5 className="font-semibold text-foreground text-lg">{sauce.name}</h5>
                                    <p className="text-muted-foreground mt-1">{sauce.description}</p>
                                  </div>
                                </div>
                                <span className="font-bold text-yellow-600 text-lg">FREE</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      {menuItems.filter(item =>
                        (item.category === 'Sauces' || item.category === 'Add-ons') &&
                        item.name.includes('Sauce')
                      ).length === 0 && (
                        <p className="text-muted-foreground">
                          No sauce options available
                        </p>
                      )}
                      {!selectedSauce && menuItems.filter(item =>
                        (item.category === 'Sauces' || item.category === 'Add-ons') &&
                        item.name.includes('Sauce')
                      ).length > 0 && (
                        <p className="text-red-500 mt-4 font-medium">
                          Please select a sauce to continue
                        </p>
                      )}
                    </div>
                  ) : (
                    /* Main Course Add-ons */
                    <>
                      <h3 className="text-2xl font-semibold mb-6 text-foreground">Add Extras</h3>
                      
                      {/* Meat Add-ons */}
                      <div className="mb-8 ml-[50px]">
                        <div className="grid gap-4">
                          {menuItems.filter(item =>
                            item.category === 'Add-ons' &&
                            (item.name.includes('Steak') || item.name.includes('Lamb') || item.name.includes('Ribs'))
                          ).map((addOn) => {
                            const quantity = selectedAddOns[addOn.id]?.quantity || 0;
                            return (
                              <div key={addOn.id} className="flex items-center p-4 border-2 rounded-xl hover:bg-accent">
                                <h5 className="font-semibold text-foreground text-lg text-center flex-1">{addOn.name}</h5>
                                <div className="flex items-center gap-4 ml-4">
                                  <span className="font-bold text-yellow-600 text-lg">£{addOn.price.toFixed(2)}</span>
                                  <div className="flex items-center gap-2">
                                    {quantity > 0 && (
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => updateAddOnQuantity(addOn, quantity - 1)}
                                        className="w-10 h-10 p-0"
                                      >
                                        -
                                      </Button>
                                    )}
                                    {quantity > 0 && (
                                      <span className="w-10 text-center font-medium text-lg">{quantity}</span>
                                    )}
                                    <Button
                                      size="sm"
                                      variant={quantity > 0 ? 'default' : 'outline'}
                                      onClick={() => updateAddOnQuantity(addOn, quantity + 1)}
                                      className="w-10 h-10 p-0"
                                    >
                                      +
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Sauces */}
                      <div className="mb-8">
                        <h4 className="text-xl font-semibold mb-4 text-foreground">Sauces</h4>
                        <div className="grid gap-4">
                          {menuItems.filter(item => item.category === 'Add-ons' && item.name.includes('Sauce')).map((addOn) => {
                            const quantity = selectedAddOns[addOn.id]?.quantity || 0;
                            return (
                              <div key={addOn.id} className="flex items-center p-4 border-2 rounded-xl hover:bg-accent">
                                <h5 className="font-semibold text-foreground text-lg text-center flex-1">{addOn.name}</h5>
                                <div className="flex items-center gap-4 ml-4">
                                  <span className="font-bold text-yellow-600 text-lg">£{addOn.price.toFixed(2)}</span>
                                  <div className="flex items-center gap-2">
                                    {quantity > 0 && (
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => updateAddOnQuantity(addOn, quantity - 1)}
                                        className="w-10 h-10 p-0"
                                      >
                                        -
                                      </Button>
                                    )}
                                    {quantity > 0 && (
                                      <span className="w-10 text-center font-medium text-lg">{quantity}</span>
                                    )}
                                    <Button
                                      size="sm"
                                      variant={quantity > 0 ? 'default' : 'outline'}
                                      onClick={() => updateAddOnQuantity(addOn, quantity + 1)}
                                      className="w-10 h-10 p-0"
                                    >
                                      +
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Drinks */}
                      <div className="mb-8">
                        <h4 className="text-xl font-semibold mb-4 text-foreground">Drinks</h4>
                        <div className="grid gap-4">
                          {menuItems.filter(item => item.category === 'Drinks').map((addOn) => {
                            const quantity = selectedAddOns[addOn.id]?.quantity || 0;
                            return (
                              <div key={addOn.id} className="flex items-center p-4 border-2 rounded-xl hover:bg-accent">
                                <h5 className="font-semibold text-foreground text-lg text-center flex-1">{addOn.name}</h5>
                                <div className="flex items-center gap-4 ml-4">
                                  <span className="font-bold text-yellow-600 text-lg">£{addOn.price.toFixed(2)}</span>
                                  <div className="flex items-center gap-2">
                                    {quantity > 0 && (
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => updateAddOnQuantity(addOn, quantity - 1)}
                                        className="w-10 h-10 p-0"
                                      >
                                        -
                                      </Button>
                                    )}
                                    {quantity > 0 && (
                                      <span className="w-10 text-center font-medium text-lg">{quantity}</span>
                                    )}
                                    <Button
                                      size="sm"
                                      variant={quantity > 0 ? 'default' : 'outline'}
                                      onClick={() => updateAddOnQuantity(addOn, quantity + 1)}
                                      className="w-10 h-10 p-0"
                                    >
                                      +
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </>
                  )}
                </div>

                <div className="border-t pt-6 mt-6">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-lg font-semibold text-foreground">Total:</span>
                    <span className="text-xl font-bold text-yellow-600">
                      {(() => {
                        // For Kids Meal, show the fixed price as it includes drink and sauce
                        if (selectedItem.category === 'Kids' && selectedItem.name === 'Kids Meal') {
                          return `£${selectedItem.price.toFixed(2)} (includes drink & sauce)`;
                        }
                        // For other items, calculate based on add-ons
                        return `£${(selectedItem.price + Object.values(selectedAddOns).reduce((sum, { item, quantity }) => sum + (item.price * quantity), 0)).toFixed(2)}`;
                      })()}
                    </span>
                  </div>
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowCustomizeDialog(false);
                        setSelectedAddOns({});
                      }}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleConfirmCustomize}
                      className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-black"
                      disabled={selectedItem.category === 'Kids' && selectedItem.name === 'Kids Meal' && !selectedSauce}
                    >
                      {selectedItem.category === 'Kids' && selectedItem.name === 'Kids Meal' ? 'Add Kids Meal' : 'Add to Cart'}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Floating Auth Modal */}
        {isAuthModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
            <div className="relative w-full max-w-md mx-4">
              <button
                onClick={() => setIsAuthModalOpen(false)}
                className="absolute -top-4 -right-4 z-[60] w-8 h-8 bg-background border border-border rounded-full flex items-center justify-center hover:bg-accent text-xl"
              >
                ×
              </button>
              <div className="max-h-[90vh] overflow-y-auto">
                <FloatingAuthModal onClose={() => setIsAuthModalOpen(false)} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MenuPage;