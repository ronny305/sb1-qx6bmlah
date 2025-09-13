import React from 'react';
import { Users, Award, Clock, MapPin, Star, Shield } from 'lucide-react';

const AboutPage: React.FC = () => {
  const stats = [
    { number: '15+', label: 'Years in Business' },
    { number: '5000+', label: 'Successful Rentals' },
    { number: '500+', label: 'Equipment Items' },
    { number: '24/7', label: 'Support Available' },
  ];

  const values = [
    {
      icon: Star,
      title: 'Quality First',
      description: 'We only stock professional-grade equipment from top manufacturers, ensuring reliability for your productions.',
    },
    {
      icon: Users,
      title: 'Expert Support',
      description: 'Our experienced team provides technical guidance and support throughout your rental period.',
    },
    {
      icon: Clock,
      title: 'Flexible Service',
      description: 'From hourly to monthly rentals, we adapt to your schedule and budget requirements.',
    },
    {
      icon: Shield,
      title: 'Fully Insured',
      description: 'Comprehensive insurance coverage protects you and your production from unexpected equipment issues.',
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-black via-gray-900 to-black text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-6">
              About <span className="text-red-500">One Stop Production Rentals</span>
            </h1>
            <p className="text-lg text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Miami's premier destination for professional equipment rentals. Since 2010, we've been 
              empowering creators, educators, and businesses with the tools they need to succeed.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl font-bold text-red-600 mb-2">{stat.number}</div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
                Our Mission
              </h2>
              <div className="space-y-6 text-gray-600 text-base leading-relaxed">
                <p>
                  Our mission is to empower creators, educators, and businesses across Miami and 
                  South Florida by providing fast, reliable access to professional-grade equipment 
                  and exceptional customer service.
                </p>
                <p>
                  We believe that great equipment should never be a barrier to great storytelling. 
                  Whether you're an independent filmmaker with a tight budget or a major production 
                  studio with complex needs, we're committed to finding the right solutions for your project.
                </p>
                <p>
                  Our commitment extends beyond just equipment rental. We strive to be your trusted 
                  partner in production, offering technical expertise, flexible rental terms, and 
                  the personalized service that helps bring your creative vision to life.
                </p>
              </div>
            </div>
            <div>
              <img
                src="/api/placeholder/600/400"
                alt="Professional equipment in our facility"
                className="rounded-lg shadow-xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              Meet Our Team
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Industry professionals dedicated to your success.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-lg p-6 shadow-md text-center">
              <img
                src="/api/placeholder/200/200"
                alt="Team member"
                className="w-32 h-32 rounded-full mx-auto mb-4 object-cover"
              />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Guido Fodale</h3>
              <p className="text-red-600 font-medium mb-2">Operations Manager</p>
              <p className="text-gray-600 text-sm">
                Oversees daily operations and ensures seamless equipment logistics and customer service.
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-md text-center">
              <img
                src="/api/placeholder/200/200"
                alt="Team member"
                className="w-32 h-32 rounded-full mx-auto mb-4 object-cover"
              />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Elizabeth Henning</h3>
              <p className="text-red-600 font-medium mb-2">Owner</p>
              <p className="text-gray-600 text-sm">
                Expert in audio/video systems with certifications from major manufacturers.
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-md text-center">
              <img
                src="/api/placeholder/200/200"
                alt="Team member"
                className="w-32 h-32 rounded-full mx-auto mb-4 object-cover"
              />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Sarah Chen</h3>
              <p className="text-red-600 font-medium mb-2">Customer Success Manager</p>
              <p className="text-gray-600 text-sm">
                Dedicated to ensuring every rental experience exceeds expectations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              Our Values
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              The principles that guide everything we do.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div key={index} className="bg-white rounded-lg p-6 shadow-md text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <value.icon className="text-red-600" size={28} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{value.title}</h3>
                <p className="text-gray-600">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Location Section */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
                <MapPin className="inline-block mr-3 text-red-600" size={36} />
                Our Location
              </h2>
              <div className="space-y-4 text-gray-600 text-base">
                <p>
                  Strategically located in the heart of Miami's production district, our 
                  15,000 square foot facility houses one of South Florida's largest 
                  collections of rental equipment.
                </p>
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="font-bold text-gray-900 mb-3">Facility Features:</h3>
                  <ul className="space-y-2">
                    <li>• Climate-controlled storage for sensitive equipment</li>
                    <li>• On-site technical support and testing facilities</li>
                    <li>• Secure loading dock for easy pickup and delivery</li>
                    <li>• 24/7 monitored security system</li>
                    <li>• Free parking for customer pickups</li>
                  </ul>
                </div>
                <div className="pt-4">
                  <p className="font-medium text-gray-900">Address:</p>
                  <p>6120 NW 6th Ave, Miami, FL 33127</p>
                  <p className="mt-2">
                    <span className="font-medium text-gray-900">Phone:</span> 
                    <a href="tel:+13056104655" className="text-blue-600 hover:text-blue-700 transition-colors ml-2">
                      (305) 610-4655
                    </a>
                  </p>
                </div>
              </div>
            </div>
            <div>
              <img
                src="/api/placeholder/600/400"
                alt="Miami location"
                className="rounded-lg shadow-xl"
              />
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default AboutPage;