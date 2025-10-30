import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Star, Clock, Users, Award } from 'lucide-react';
import { menuItems } from '../../data/menuData';

interface LandingPageProps {
  onNavigate: (page: string) => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  const featuredItems = menuItems.slice(0, 6);

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Delicious Food
            <span className="text-orange-600"> Delivered</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Experience the finest culinary delights from our kitchen to your doorstep. 
            Fresh ingredients, authentic flavors, and exceptional service.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="text-lg px-8 py-3"
              onClick={() => onNavigate('menu')}
            >
              Order Now
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="text-lg px-8 py-3"
            >
              View Menu
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-2">10K+</h3>
              <p className="text-gray-600">Happy Customers</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-2">30min</h3>
              <p className="text-gray-600">Average Delivery</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-2">4.9</h3>
              <p className="text-gray-600">Average Rating</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-2">50+</h3>
              <p className="text-gray-600">Menu Items</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Items */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Featured Dishes</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Discover our most popular dishes, crafted with love and the finest ingredients
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredItems.map((item) => (
              <Card key={item.id} className="overflow-hidden hover:shadow-xl transition-shadow duration-300">
                <div className="aspect-video overflow-hidden">
                  <img 
                    src={item.image} 
                    alt={item.name}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-semibold text-gray-900">{item.name}</h3>
                    <span className="text-lg font-bold text-orange-600">${item.price}</span>
                  </div>
                  <p className="text-gray-600 mb-4">{item.description}</p>
                  <div className="flex items-center justify-between">
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
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <Button 
              size="lg" 
              onClick={() => onNavigate('menu')}
              className="px-8"
            >
              View Full Menu
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-orange-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to Order?</h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Join thousands of satisfied customers who trust us for their daily meals. 
            Fast delivery, fresh food, and excellent service guaranteed.
          </p>
          <Button 
            size="lg" 
            variant="secondary" 
            className="text-lg px-8 py-3"
            onClick={() => onNavigate('menu')}
          >
            Start Ordering
          </Button>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;