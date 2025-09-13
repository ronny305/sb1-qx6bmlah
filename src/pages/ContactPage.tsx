import React, { useState } from 'react';
import { MapPin, Phone, Mail, Clock, Truck, Shield } from 'lucide-react';

const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      setSubmitted(true);
      setIsSubmitting(false);
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
    }, 2000);
  };

  const contactInfo = [
    {
      icon: MapPin,
      title: 'Address',
      details: ['6120 NW 6th Ave', 'Miami, FL 33127'],
      color: 'text-red-600',
    },
    {
      icon: Phone,
      title: 'Phone',
      details: ['(305) 610-4655'],
      color: 'text-red-600',
    },
    {
      icon: Mail,
      title: 'Email',
      details: ['ONESTOPSUPPLIESMIAMI@gmail.com'],
      color: 'text-red-600',
    },
    {
      icon: Clock,
      title: 'Business Hours',
      details: [
        'Mon-Sun: Open 24 Hours'
      ],
      color: 'text-red-600',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-gradient-to-br from-black via-gray-900 to-black text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-6">
              Contact <span className="text-red-500">Us</span>
            </h1>
            <p className="text-lg text-gray-300 max-w-3xl mx-auto">
              Ready to rent equipment or have questions? Get in touch with our team.
            </p>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Contact Information */}
          <div className="space-y-8 text-center">
            <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-2xl p-8 shadow-lg border border-red-200">
              <div className="max-w-3xl mx-auto">
                <div className="flex items-center justify-center mb-6">
                  <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mr-4">
                    <Mail className="text-white" size={32} />
                  </div>
                  <div className="text-left">
                    <h2 className="text-3xl font-bold text-gray-900">Get in Touch</h2>
                    <p className="text-red-600 font-medium">We're here to help</p>
                  </div>
                </div>
                
                <p className="text-lg text-gray-700 mb-8 leading-relaxed">
                  Whether you need equipment for a feature film, commercial shoot, educational program, or special event, 
                  our experienced team is ready to provide personalized service and expert guidance.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <Clock className="text-red-600 mx-auto mb-2" size={24} />
                    <h3 className="font-semibold text-gray-900 mb-1">Quick Response</h3>
                    <p className="text-sm text-gray-600">2-hour quote turnaround</p>
                  </div>
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <Truck className="text-red-600 mx-auto mb-2" size={24} />
                    <h3 className="font-semibold text-gray-900 mb-1">Delivery Available</h3>
                    <p className="text-sm text-gray-600">Free delivery in Miami-Dade</p>
                  </div>
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <Shield className="text-red-600 mx-auto mb-2" size={24} />
                    <h3 className="font-semibold text-gray-900 mb-1">Fully Insured</h3>
                    <p className="text-sm text-gray-600">Comprehensive coverage</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {contactInfo.map((info, index) => (
                <div key={index} className="bg-white rounded-lg p-6 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                  <div className="flex items-start">
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <info.icon className={`${info.color}`} size={28} />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">{info.title}</h3>
                      {info.title === 'Address' ? (
                        <p className="text-gray-600 leading-relaxed mb-1">
                          {info.details.join(', ')}
                        </p>
                      ) : (
                        info.details.map((detail, idx) => (
                          <p key={idx} className="text-gray-600 leading-relaxed mb-1">
                            {info.title === 'Phone' ? (
                              <a href={`tel:${detail.replace(/[^\d]/g, '')}`} className="text-blue-600 hover:text-blue-700 transition-colors">
                                {detail}
                              </a>
                            ) : (
                              detail
                            )}
                          </p>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Emergency Contact */}
            <div className="bg-red-600 rounded-lg p-6 text-white">
              <h3 className="text-xl font-bold mb-2">24/7 Emergency Support</h3>
              <p className="mb-3">
                Equipment issues during your rental? Our emergency support line is available 24/7 
                for urgent technical assistance.
              </p>
              <p className="font-semibold">Emergency Line: <a href="tel:+13056104655" className="text-white underline hover:text-red-200 transition-colors">(305) 610-4655</a></p>
            </div>

            {/* Map Placeholder */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden mt-8">
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3591.1374723046956!2d-80.20663379999999!3d25.832015!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x88d9b1ee3ae53489%3A0x931422b7e2292949!2sOne%20Stop%20Production%20Rentals!5e0!3m2!1sen!2sus!4v1755464118834!5m2!1sen!2sus" 
                width="600" 
                height="450" 
                style={{border:0}} 
                allowFullScreen={true}
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
                className="w-full h-80"
                title="One Stop Production Rentals Location"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;