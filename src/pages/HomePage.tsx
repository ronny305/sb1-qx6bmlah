import React from 'react';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Star, Shield, Clock, Truck, Search, FileText, Calendar, Play, Camera, Mic, Lightbulb, ChefHat, Home, Wrench, MapPin } from 'lucide-react';
import { categories } from '../data/mockData';

const HomePage: React.FC = () => {
  const testimonials = [
    {
      name: "Ricky Mendez",
      role: "Production Manager",
      content: "Reputable & reliable production rental supplies MIA has to offer! Always around the clock to serve your needs with what's more than meets the eye! 🙏🏽 thank you!",
      rating: 5,
      image: "/api/placeholder/60/60",
      headline: "Reputable & Reliable Production Rental Supplies"
    },
    {
      name: "Liz Gonazalez", 
      role: "Producer",
      content: "One Stop is the best production rental house in all of South Florida. Responsible team, quality supplies, and great deals. I would highly recommend them to any production company. My crews and I have been working with One Stop since 2016 and will always do so.",
      rating: 5,
      image: "/api/placeholder/60/60",
      headline: "Satisfied With The Facilities At One Stop Production Equipment Rental"
    }
  ];

  const whyChooseFeatures = [
    {
      icon: Star,
      title: "Rent Quality Equipment",
      description: "Professional-grade equipment from top brands"
    },
    {
      icon: Clock,
      title: "Reliable & Fast Service", 
      description: "Quick delivery and setup services"
    },
    {
      icon: Shield,
      title: "Best Prices Guarantee",
      description: "Competitive rates with flexible terms"
    },
    {
      icon: Truck,
      title: "Rent With Full Security",
      description: "Comprehensive insurance coverage"
    }
  ];


  const categoryIcons = {
    video: Camera,
    audio: Mic,
    lighting: Lightbulb,
    'home-ec': ChefHat,
    'production-set': Home,
    general: Wrench
  };

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'film production':
        return 'bg-red-600';
      case 'corporate event':
        return 'bg-purple-600';
      default:
        return 'bg-gray-600';
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-cover bg-center bg-no-repeat text-white py-16" style={{backgroundImage: "url('/onestop-truck-v2.png')"}}>
        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-black bg-opacity-60"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <h1 className="text-3xl md:text-5xl font-bold leading-tight">
                Your One-Stop Source for <span className="text-red-500">Production & Home Ec Rentals</span> in Miami
              </h1>
              <p className="text-lg text-gray-300 leading-relaxed">
                From a full-line of Production Equipment Supplies to a complete Home Economist Kitchen, we make rentals fast, simple, and reliable — with delivery, pickup, and on-set support anywhere in South Florida.
              </p>
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <Link
                  to="/production-equipment"
                  className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold text-base transition-colors duration-200 flex items-center justify-center"
                >
                  Browse Production Equipment
                  <ArrowRight className="ml-2" size={20} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How to Order Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How to Order
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Order professional equipment rentals in just four simple steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            {/* Step 1 */}
            <div className="text-center relative">
              <div className="w-16 h-16 bg-white border-4 border-gray-300 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-gray-900">1</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Browse Equipment</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Explore our extensive catalog of professional production equipment and home economics rentals tailored to your project needs.
              </p>
              {/* Arrow connector - hidden on mobile */}
              <div className="hidden lg:block absolute top-8 -right-6 text-gray-400">
                <ArrowRight size={24} />
              </div>
            </div>

            {/* Step 2 */}
            <div className="text-center relative">
              <div className="w-16 h-16 bg-white border-4 border-gray-300 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-gray-900">2</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Add to Quote</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Select the equipment you need and add them to your quote cart. Specify quantities and rental duration for accurate pricing.
              </p>
              {/* Arrow connector - hidden on mobile */}
              <div className="hidden lg:block absolute top-8 -right-6 text-gray-400">
                <ArrowRight size={24} />
              </div>
            </div>

            {/* Step 3 */}
            <div className="text-center relative">
              <div className="w-16 h-16 bg-white border-4 border-gray-300 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-gray-900">3</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Submit Request</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Complete your project details including dates, locations, and any special requirements. Submit your quote request for review.
              </p>
              {/* Arrow connector - hidden on mobile */}
              <div className="hidden lg:block absolute top-8 -right-6 text-gray-400">
                <ArrowRight size={24} />
              </div>
            </div>

            {/* Step 4 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-white border-4 border-gray-300 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-gray-900">4</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Get Equipment</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Receive your detailed quote and authorization forms via email within 2 business hours. Review, complete the forms, and reply to confirm your rental and coordinate pickup or delivery.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Equipment Categories */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Production Set Rentals Section */}
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <div className="text-center mb-8">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                  Production Supplies Rentals
                </h2>
                <div className="w-16 h-1 bg-yellow-400 mx-auto mb-4"></div>
                <p className="text-base text-gray-600">
                  Complete production supply line of equipment for all your filming needs
                </p>
              </div>

              <div className="mt-8 text-center">
                <Link
                  to="/new-production-equipment"
                  className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors duration-200 inline-flex items-center"
                >
                  Browse Production Equipment
                  <ArrowRight className="ml-2" size={20} />
                </Link>
              </div>
            </div>

            {/* Home Ec Rentals Section */}
            <div className="bg-gray-50 rounded-2xl p-8 shadow-lg">
              <div className="text-center mb-8">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                  Home Ec Rentals
                </h2>
                <div className="w-16 h-1 bg-yellow-400 mx-auto mb-4"></div>
                <p className="text-base text-gray-600">
                  Commercial Grade & Household Kitchen Equipment & Supplies for all your filming Needs
                </p>
              </div>

              <div className="mt-8 text-center">
                <Link
                  to="/home-ec-equipment"
                  className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors duration-200 inline-flex items-center"
                >
                  Browse Home Ec
                  <ArrowRight className="ml-2" size={20} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-12 bg-black text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="relative">
              <img 
                src="https://images.pexels.com/photos/3945313/pexels-photo-3945313.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop" 
                alt="Professional equipment setup"
                className="rounded-lg"
              />
            </div>
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold mb-4">
                  We Offer Smarter & More Affordable Access To Rent Production Equipment
                </h2>
                <div className="w-16 h-1 bg-yellow-400"></div>
              </div>
              
              <p className="text-gray-300 leading-relaxed">

With over 35 years in the business, we understand that time, convenience, and attention to detail matter. That's why we offer an extensive and ever-growing catalog of Production Supplies & Commercial Grade Kitchen Equipment — all ready for pickup or delivery. Our mission is to make your job easier. We're here to help you bring your job the tools needed and on time and on budget. Let us help make your next project a success.

Founded in 2015 by film production veteran Guido Fodale, One Stop Production Rentals was built to make life easier for crews, producers, and production managers across Miami and South Florida. After years on set, Guido saw the frustrations with slow service and limited options — so he set out to deliver something better. Today, we're your fast, full‑service source for production gear and home ec rentals, from hair, makeup & wardrobe stations to kitchen sets, appliances, and props. We offer same‑day and next‑day rentals, delivery, and on‑set support so your production never skips a beat. Se habla español — alquiler rápido y confiable para cine, TV y comerciales en Miami.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose One Stop Production Rentals?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We provide professional equipment rentals with unmatched service and reliability
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {whyChooseFeatures.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <div key={index} className="text-center">
                  <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <IconComponent className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-gray-600 mb-2">We Promise To Find You The Right Equipment</p>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              Read Customers Thoughts
            </h2>
            <div className="w-16 h-1 bg-yellow-400 mx-auto"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                <div className="text-yellow-400 text-4xl mb-4">"</div>
                <h4 className="font-bold text-gray-900 mb-2">
                  {testimonial.headline}
                </h4>
                <h5 className="font-semibold text-gray-700 mb-4">
                  At One Stop Production Equipment Rental
                </h5>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  {testimonial.content}
                </p>
                <div className="flex items-center">
                  <div>
                    <p className="font-semibold text-gray-900">{testimonial.name}</p>
                    <p className="text-sm text-gray-600">{testimonial.role}</p>
                  </div>
                  <div className="ml-auto flex">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 bg-black text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto">
            Browse our extensive equipment catalog or contact us for a custom quote. 
            Professional equipment rentals made simple.
          </p>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-6">
            <Link
              to="/production-equipment"
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold text-base transition-colors duration-200"
            >
              Browse Production Equipment
            </Link>
            <Link
              to="/contact"
              className="bg-transparent border-2 border-white hover:bg-white hover:text-black text-white px-6 py-3 rounded-lg font-semibold text-base transition-colors duration-200"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;