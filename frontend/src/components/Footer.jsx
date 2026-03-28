import React from 'react';
import { Link } from 'react-router-dom';
import { Leaf, ShieldAlert, LifeBuoy, HeartHandshake, Phone, Mail, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="glass py-12 mt-auto border-t border-slate-700/50 bg-slate-900 text-slate-300 relative overflow-hidden">
       {/* Background decorative elements */}
       <div className="absolute top-0 right-0 w-64 h-64 bg-primary-900/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
       <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-900/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
       
       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
             
             {/* Brand Column */}
             <div className="space-y-4">
                <Link to="/" className="flex items-center gap-2 text-primary-500 font-bold text-2xl tracking-tight">
                  <Leaf className="h-7 w-7" />
                  SmartAgri
                </Link>
                <p className="text-sm font-medium leading-relaxed max-w-sm text-slate-400">
                  Empowering local farmers and bulk buyers by cutting out middlemen. Direct sourcing, transparent negotiation, and absolute quality assurance tracking.
                </p>
             </div>

             {/* Support Column */}
             <div>
                <h4 className="font-bold text-white mb-4 uppercase tracking-wider text-sm flex items-center gap-2"><LifeBuoy size={16}/> Customer Help</h4>
                <ul className="space-y-3 font-medium text-sm">
                   <li><Link to="/contact" className="hover:text-primary-400 transition-colors">Technical Support / Contact Us</Link></li>
                   <li><Link to="/dashboard" className="hover:text-primary-400 transition-colors">My Logistics Dashboard</Link></li>
                   <li><Link to="/quality-guidelines" className="hover:text-primary-400 transition-colors">Agri Quality Standards</Link></li>
                </ul>
             </div>

             {/* Trust & Safety Column */}
             <div>
                <h4 className="font-bold text-white mb-4 uppercase tracking-wider text-sm flex items-center gap-2"><ShieldAlert size={16}/> Trust & Safety Hub</h4>
                <ul className="space-y-3 font-medium text-sm">
                   <li><Link to="/report-scam" className="hover:text-red-400 text-red-300/80 transition-colors font-bold flex items-center gap-1.5"><ShieldAlert size={14}/> Report a Scam/Fraud</Link></li>
                   <li><Link to="/dispute-policy" className="hover:text-primary-400 transition-colors">Damaged Goods & Refund Policy</Link></li>
                   <li><Link to="/farmer-guidance" className="hover:text-primary-400 transition-colors">Best Practices for Farmers</Link></li>
                </ul>
             </div>

             {/* Contact Address */}
             <div>
                <h4 className="font-bold text-white mb-4 uppercase tracking-wider text-sm flex items-center gap-2"><Phone size={16}/> Contact Support</h4>
                <ul className="space-y-3 font-medium text-sm text-slate-400">
                   <li className="flex items-start gap-2"><MapPin size={16} className="mt-0.5 text-primary-500 shrink-0"/> Global Support HQ,<br/>Agriculture Tech Park,<br/>New Delhi 110001</li>
                   <li className="flex items-center gap-2"><Phone size={16} className="text-primary-500 shrink-0"/> +91 1800-AGRI-SAFE</li>
                   <li className="flex items-center gap-2"><Mail size={16} className="text-primary-500 shrink-0"/> resolutions@smartagri.com</li>
                </ul>
             </div>
          </div>

          <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
             <p className="text-xs font-bold text-slate-500 flex items-center gap-1">
               © {new Date().getFullYear()} Smart Agri Supply Network. Built with <HeartHandshake size={14} className="text-primary-500 mx-0.5"/> for transparent farming.
             </p>
             <div className="flex gap-4 text-xs font-semibold text-slate-500">
                <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
                <Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
             </div>
          </div>
       </div>
    </footer>
  );
};

export default Footer;
