import React from 'react';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  // Get Supabase URL for form links
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;

  return (
    <footer className="bg-black text-white mb-16 lg:mb-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold">
              <span className="text-white">One Stop</span>
              <span className="text-red-500 ml-2">Production Rentals</span>
            </h3>
            <p className="text-gray-300 leading-relaxed">
              Filming in Miami? Let us help make your next project a success. Miami's premier destination for Professional Production Equipment Rentals. Serving Miami's Filmmakers since 2015.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-base font-semibold text-white">Quick Links</h4>
            <ul className="space-y-2">
              <li><Link to="/production-equipment" className="text-gray-300 hover:text-white transition-colors">Production Equipment</Link></li>
              <li><Link to="/home-ec-equipment" className="text-gray-300 hover:text-white transition-colors">Home Ec Equipment</Link></li>
              <li><Link to="/contact" className="text-gray-300 hover:text-white transition-colors">Contact</Link></li>
              <li><Link to="/login" className="text-gray-300 hover:text-white transition-colors">Sign In</Link></li>
              {/* Form Links */}
              <li><a href={`${supabaseUrl}/storage/v1/object/sign/One%20Stop%20Order%20Forms/2025%20W9_One%20Stop.pdf?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9jYTc0YmNhNy1jYzE2LTQ2ZTYtYjJhMS04MzFmMjIxYjJjMDEiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJPbmUgU3RvcCBPcmRlciBGb3Jtcy8yMDI1IFc5X09uZSBTdG9wLnBkZiIsImlhdCI6MTc1NTQ2MjgxNiwiZXhwIjoxODQxODYyODE2fQ.tLEPmO_Alvsm9_XC449xanL-NkcMA_G2bjScqYGTwvg`} target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white transition-colors">W9 Form</a></li>
              <li><a href={`${supabaseUrl}/storage/v1/object/sign/One%20Stop%20Order%20Forms/CC%20Auth%20Form.pdf?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9jYTc0YmNhNy1jYzE2LTQ2ZTYtYjJhMS04MzFmMjIxYjJjMDEiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJPbmUgU3RvcCBPcmRlciBGb3Jtcy9DQyBBdXRoIEZvcm0ucGRmIiwiaWF0IjoxNzU1NDYyNzE1LCJleHAiOjE4NDE4NjI3MTV9.Z1ofW3NnR06lAVUysZu0SAyP8j7HttHT9Dgl1_H7ZAU`} target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white transition-colors">CC Auth Form</a></li>
              <li><a href={`${supabaseUrl}/storage/v1/object/sign/One%20Stop%20Order%20Forms/One%20Stop_Order%20Form_PS_v2.pdf?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9jYTc0YmNhNy1jYzE2LTQ2ZTYtYjJhMS04MzFmMjIxYjJjMDEiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJPbmUgU3RvcCBPcmRlciBGb3Jtcy9PbmUgU3RvcF9PcmRlciBGb3JtX1BTX3YyLnBkZiIsImlhdCI6MTc1NTQ2MTQ2MywiZXhwIjoxNzg2OTk3NDYzfQ.RAbqcAYt06L3qPTRLWPrDnX36xx3wEnZmx0QRvf-Xak`} target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white transition-colors">Order Form</a></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h4 className="text-base font-semibold text-white">Contact Info</h4>
            <ul className="space-y-3">
              <li className="flex items-start">
                <MapPin size={18} className="text-red-500 mr-3 mt-1 flex-shrink-0" />
                <span className="text-gray-300">
                  6120 NW 6th Ave<br />
                  Miami, FL 33127
                </span>
              </li>
              <li className="flex items-center">
                <Phone size={18} className="text-red-500 mr-3 flex-shrink-0" />
                <a href="tel:+13056104655" className="text-gray-300 hover:text-white transition-colors">
                  (305) 610-4655
                </a>
              </li>
              <li className="flex items-center">
                <Mail size={18} className="text-red-500 mr-3 flex-shrink-0" />
                <a href="mailto:ONESTOPSUPPLIESMIAMI@gmail.com" className="text-gray-300 hover:text-white transition-colors">
                  ONESTOPSUPPLIESMIAMI@gmail.com
                </a>
              </li>
            </ul>
          </div>

          {/* Business Hours */}
          <div className="space-y-4">
            <h4 className="text-base font-semibold text-white">Business Hours</h4>
            <ul className="space-y-2">
              <li className="flex items-center">
                <Clock size={16} className="text-red-500 mr-3 flex-shrink-0" />
                <div className="text-gray-300">
                  <div>Mon-Sun: Open 24 Hours</div>
                </div>
              </li>
            </ul>
            <div className="bg-red-600 px-4 py-3 rounded-lg">
              <p className="text-white text-sm font-medium">
                24/7 Emergency Equipment Support Available
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-700 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            © 2025 One Stop Production Rentals. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link to="/login" className="text-gray-400 hover:text-white text-sm transition-colors">Sign In</Link>
            <Link to="#" className="text-gray-400 hover:text-white text-sm transition-colors">Rental Agreement</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;