import React from 'react';
import { Link } from 'react-router-dom';
import { Logo } from '@/components/common/Logo';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-brand-primary text-brand-surface pt-16 pb-12 border-t border-brand-primary-light">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12 pb-12 border-b border-brand-primary-light/40">
          {/* Brand Info */}
          <div className="space-y-4">
            <Logo variant="light" />
            <p className="text-sm text-brand-surface/80 leading-relaxed font-light mt-4">
              Registered and licensed valuation and property management surveyors in Nairobi, Kenya. Delivering integrity, accuracy, and dedicated asset care since inception.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-serif text-lg font-medium text-brand-surface mb-4">Quick Links</h4>
            <ul className="space-y-2.5 text-sm text-brand-surface/80">
              <li>
                <Link to="/" className="hover:text-brand-accent transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/properties" className="hover:text-brand-accent transition-colors">
                  Browse Properties
                </Link>
              </li>
              <li>
                <Link to="/properties?listing_type=sale" className="hover:text-brand-accent transition-colors">
                  Properties for Sale
                </Link>
              </li>
              <li>
                <Link to="/properties?listing_type=rent" className="hover:text-brand-accent transition-colors">
                  Properties for Rent
                </Link>
              </li>
              <li>
                <Link to="/valuation/new" className="hover:text-brand-accent transition-colors">
                  Request Valuation
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-serif text-lg font-medium text-brand-surface mb-4">Our Practice</h4>
            <ul className="space-y-2.5 text-sm text-brand-surface/80">
              <li className="flex items-start gap-2">
                <span className="text-brand-accent font-bold">&bull;</span>
                <span>Mortgage &amp; Asset Valuation</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-brand-accent font-bold">&bull;</span>
                <span>Commercial &amp; Residential Management</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-brand-accent font-bold">&bull;</span>
                <span>Site Viewing &amp; Due Diligence</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-brand-accent font-bold">&bull;</span>
                <span>Statutory Land Rent &amp; Rates Advisory</span>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h4 className="font-serif text-lg font-medium text-brand-surface mb-4">Nairobi Office</h4>
            <ul className="space-y-3 text-sm text-brand-surface/80">
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-brand-accent flex-shrink-0 mt-0.5" />
                <span>Woodvale Grove, Westlands, Nairobi, Kenya</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-brand-accent flex-shrink-0" />
                <span>+254 (0) 20 123 4567 / +254 700 000 000</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-brand-accent flex-shrink-0" />
                <span>info@kiraguandmwangi.co.ke</span>
              </li>
              <li className="flex items-center gap-3">
                <Clock className="w-4 h-4 text-brand-accent flex-shrink-0" />
                <span>Mon – Sat: 09:00 – 17:00</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-brand-surface/60 gap-4">
          <p>&copy; {new Date().getFullYear()} Kiragu &amp; Mwangi Ltd. All rights reserved.</p>
          <p className="tracking-wide">
            Valuation &middot; Property Management &middot; Real Estate Consultancy
          </p>
        </div>
      </div>
    </footer>
  );
};
