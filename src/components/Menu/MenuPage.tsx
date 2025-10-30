import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, Clock, Star } from 'lucide-react';
import { menuItems, menuCategories } from '../../data/menuData';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const MenuPage: React.FC = () => {
  const { addItem } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredItems = menuItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    return matchesSearch && matchesCategory && item.isAvailable;
  });

  const handleAddToCart = (item: any) => {
    if (!user) {
      toast({
        title: 'Please login',
        description: 'You need to login to add items to your cart.',
        variant: 'destructive',
      });
      return;
    }

    addItem(item);
    toast({
      title: 'Added to cart',
      description: `${item.name} has been added to your cart.`,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Our Menu</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover our delicious selection of freshly prepared dishes
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              type="text"
              placeholder="Search menu items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap justify-center gap-2">
            {menuCategories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? 'default' : 'outline'}
                onClick={() => setSelectedCategory(category)}
                className="text-sm"
              >
                {category}
              </Button>
            ))}
          </div>
        </div>

        {/* Menu Items Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <Card key={item.id} className="overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="aspect-video overflow-hidden relative">
                <img 
                  src={item.image} 
                  alt={item.name}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
                <Badge 
                  className="absolute top-3 left-3 bg-orange-600 text-white"
                >
                  {item.category}
                </Badge>
              </div>
              
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-xl font-semibold text-gray-900">{item.name}</h3>
                  <span className="text-xl font-bold text-orange-600">${item.price.toFixed(2)}</span>
                </div>
                
                <p className="text-gray-600 mb-4 line-clamp-2">{item.description}</p>
                
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center text-sm text-gray-500">
                    <Clock className="w-4 h-4 mr-1" />
                    {item.preparationTime} min
                  </div>
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className="w-4 h-4 text-yellow-400 fill-current" 
                      />
                    ))}
                    <span className="ml-1 text-sm text-gray-500">(4.9)</span>
                  </div>
                </div>
                
                <Button 
                  className="w-full"
                  onClick={() => handleAddToCart(item)}
                  disabled={!item.isAvailable}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add to Cart
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredItems.length === 0 && (
          <div className="text-center py-12">
            <p className="text-xl text-gray-600">No items found matching your criteria.</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('All');
              }}
            >
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MenuPage;