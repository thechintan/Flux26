import React, { useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldAlert, Scale, LifeBuoy, FileText, CheckCircle, Leaf, Mail, Phone, MapPin, AlertTriangle } from 'lucide-react';

const pageContent = {
  '/contact': {
    title: 'Technical Support & Contact',
    icon: <LifeBuoy size={32} className="text-blue-500" />,
    content: (
      <div className="space-y-6 text-slate-700 dark:text-slate-300">
        <p className="text-lg">Need help specific to your account, orders, or technical issues on the SmartAgri platform? Our team is available 24/7 to assist farmers and buyers.</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
           <div className="p-6 bg-slate-50 dark:bg-dark-800 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col items-center text-center">
             <Phone size={32} className="mb-4 text-primary-500"/>
             <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-2">Call Us</h3>
             <p className="text-slate-600 dark:text-slate-400 font-medium">+91 1800-AGRI-SAFE</p>
             <p className="text-xs text-slate-500 mt-2">Available Mon-Sat, 9AM-8PM</p>
           </div>
           <div className="p-6 bg-slate-50 dark:bg-dark-800 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col items-center text-center">
             <Mail size={32} className="mb-4 text-primary-500"/>
             <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-2">Email Support</h3>
             <p className="text-slate-600 dark:text-slate-400 font-medium">resolutions@smartagri.com</p>
             <p className="text-xs text-slate-500 mt-2">Expect a reply within 24 hours</p>
           </div>
           <div className="p-6 bg-slate-50 dark:bg-dark-800 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col items-center text-center">
             <MapPin size={32} className="mb-4 text-primary-500"/>
             <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-2">HQ Address</h3>
             <p className="text-slate-600 dark:text-slate-400 font-medium leading-relaxed">Global Support HQ,<br/>Agriculture Tech Park,<br/>New Delhi 110001</p>
           </div>
        </div>
      </div>
    )
  },
  '/quality-guidelines': {
    title: 'Agri Quality Standards',
    icon: <CheckCircle size={32} className="text-green-500" />,
    content: (
      <div className="space-y-6 text-slate-700 dark:text-slate-300 leading-relaxed">
        <p className="text-lg">SmartAgri relies on absolute trust. To maintain the integrity of our marketplace, all produce listed must meet our rigorous Grade-A wholesale specifications unless explicitly marked as 'Damaged'.</p>
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-8">Media Requirements</h3>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>High Fidelity:</strong> All uploaded photos must be unedited and showcase the exact batch being sold.</li>
          <li><strong>Mandatory Video Proof:</strong> A recent video showing the volume, color, and handling of the crop is mandatory for every new listing.</li>
        </ul>
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-8">Pesticide & Chemical Policy</h3>
        <p>Products labeled as "Organic" must inherently pass the Zero-Residue test. Buyers have the right to request third-party lab verification upon receiving the load.</p>
        <div className="mt-8 p-4 bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-900/30 rounded-lg">
          <p className="text-sm font-bold text-yellow-800 dark:text-yellow-500 flex items-center gap-2"><AlertTriangle size={16}/> Warning: Repeated quality violations will result in permanent farmer deregistration.</p>
        </div>
      </div>
    )
  },
  '/report-scam': {
    title: 'Report a Scam or Fraud',
    icon: <ShieldAlert size={32} className="text-red-500" />,
    content: (
      <div className="space-y-6 text-slate-700 dark:text-slate-300">
        <p className="text-lg font-bold text-slate-900 dark:text-white">To maintain a 100% scam-free ecosystem, SmartAgri treats all fraud reports with the highest legal severity.</p>
        <p>If you believe a farmer has used fake media (photos/videos not matching the delivered product) or attempted to extort prices outside the platform negotiation system, you must act swiftly.</p>
        
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-8">How to File a Fraud Report</h3>
        <ol className="list-decimal pl-6 space-y-4">
          <li>Navigate to your <strong>Dashboard &gt; Orders & Logistics</strong>.</li>
          <li>Locate the specific order and click <span className="text-red-500 font-bold">Report Quality Issue / Fraud</span>.</li>
          <li>Upload real-time photographic proof of the deceptive load you received.</li>
          <li>Depending on the severity, the seller is legally obligated to issue a <span className="font-bold underline">Formal Fine / Price Reduction</span> or a <span className="font-bold underline">Full Cancellation Refund</span>.</li>
        </ol>
        
        <div className="mt-10 p-6 bg-red-50 dark:bg-red-900/10 border-l-4 border-red-500 rounded-r-lg">
          <h4 className="text-red-700 dark:text-red-400 font-bold text-lg mb-2 flex items-center gap-2"><Scale size={20}/> Zero Tolerance Legal Policy</h4>
          <p className="text-sm">By using SmartAgri, all sellers have signed a binding digital agreement holding them financially and legally liable for attempting a scam. Extortion, bait-and-switch deliveries, or unverified claims explicitly authorize SmartAgri to levy heavy fines or pursue legal actions offline on behalf of the buyer.</p>
        </div>
      </div>
    )
  },
  '/dispute-policy': {
    title: 'Damaged Goods & Refund Policy',
    icon: <Scale size={32} className="text-purple-500" />,
    content: (
      <div className="space-y-6 text-slate-700 dark:text-slate-300">
        <p>Wholesale agricultural commerce can be unpredictable, but our refund mechanism guarantees that buyers are never left bearing the cost of damaged transit goods.</p>
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-8">Resolution Types</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div className="p-4 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-dark-900 shadow-sm">
            <h4 className="font-bold text-primary-600 dark:text-primary-400 mb-2">Partial Refund (Price Reduction Fine)</h4>
            <p className="text-sm">If 10-30% of the goods are damaged or fail quality specs, the buyer reports it in the dashboard. The seller must issue a custom financial fine deductible from the total invoice. Both parties must agree.</p>
          </div>
          <div className="p-4 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-dark-900 shadow-sm">
            <h4 className="font-bold text-red-600 dark:text-red-400 mb-2">Full Refund & Return</h4>
            <p className="text-sm">If the load is entirely unacceptable, fraudulent, or missing, the seller is forced to refund 100% of the transaction and absorb all logistics costs for the return load.</p>
          </div>
        </div>
      </div>
    )
  },
  '/farmer-guidance': {
    title: 'Best Practices for Farmers',
    icon: <Leaf size={32} className="text-green-500" />,
    content: (
      <div className="space-y-6 text-slate-700 dark:text-slate-300">
        <p className="text-lg">Succeeding on SmartAgri means building long-term trust with wholesale buyers. Better trust equals faster sales and higher negotiated prices.</p>
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-8">Listing Optimization</h3>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>Upload the absolute truth:</strong> Buyers respect honesty. If your crop was rain-damaged, list it under the 'Damaged/Unsold' category with a fair discount!</li>
          <li><strong>Shoot clear videos:</strong> A 15-second pan of the harvested crop speaks louder than a curated photo. Video evidence prevents future disputes.</li>
          <li><strong>Respond quickly:</strong> When a buyer makes a formal offer via the chat system, accepting or denying within 2 hours boosts your algorithm visibility.</li>
        </ul>
      </div>
    )
  },
  '/privacy': {
    title: 'Privacy Policy',
    icon: <FileText size={32} className="text-indigo-500" />,
    content: (
      <div className="space-y-6 text-slate-700 dark:text-slate-300 text-sm">
        <p>Your privacy is important to us. SmartAgri collects data strictly to guarantee transactional security, logistics coordination, and dispute resolution.</p>
        <p><strong>1. Data Collection:</strong> We collect your name, location, banking details (handled via secure gateways), and encrypted chat logs. Chat logs are exclusively used by administrators during a Scam/Refund Dispute.</p>
        <p><strong>2. Media Rights:</strong> Uploaded product photos and videos grant SmartAgri a temporary license to distribute within the marketplace. Metadata is retained to combat fraud.</p>
      </div>
    )
  },
  '/terms': {
    title: 'Terms of Service & Legal Framework',
    icon: <Scale size={32} className="text-slate-500" />,
    content: (
      <div className="space-y-6 text-slate-700 dark:text-slate-300 text-sm">
        <p>By registering on SmartAgri, every user (Buyer or Farmer) digitally binds themselves to these legal constraints.</p>
        <p className="font-bold text-red-600 dark:text-red-400 text-base">SECTION 4(A) — ANTI-SCAM LIABILITY CLAUSE</p>
        <p className="pl-4 border-l-2 border-red-500 text-slate-600 dark:text-slate-400">
          "The SELLER expressly warrants that all media (video/photo) represents the precise crop to be shipped. Should the SELLER deliver items substantially different from the media, they agree to forfeit the platform contract, issuing an immediate financial fine or a full refund at their own logistics expense. Malicious deception allows SmartAgri to forward platform details to local authorities pursuing civil/criminal charges on behalf of the BUYER."
        </p>
        <p>Failure to comply will result in an absolute platform ban.</p>
      </div>
    )
  }
};

const InfoPages = () => {
  const location = useLocation();
  const page = pageContent[location.pathname];

  // Scroll to top on load
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  if (!page) {
    return (
      <div className="min-h-[50vh] flex flex-col justify-center items-center text-center px-4">
        <AlertTriangle size={48} className="text-slate-400 mb-4" />
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Page Not Found</h1>
        <p className="text-slate-500 dark:text-slate-400 mb-6">The document you are looking for has been moved or doesn't exist.</p>
        <Link to="/" className="btn-primary py-2 px-6">Return to Marketplace</Link>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8 min-h-[70vh]"
    >
      <div className="glass-card bg-white/95 dark:bg-dark-800 p-8 md:p-12 shadow-xl border-t-4 border-t-primary-500">
        <div className="flex items-center gap-4 mb-8 pb-8 border-b border-slate-200 dark:border-slate-700">
          <div className="w-16 h-16 rounded-2xl bg-slate-50 dark:bg-dark-900 border border-slate-100 dark:border-slate-800 flex justify-center items-center shadow-sm">
            {page.icon}
          </div>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">{page.title}</h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium">SmartAgri Official Documentation</p>
          </div>
        </div>
        
        <div className="prose prose-slate dark:prose-invert max-w-none">
          {page.content}
        </div>
      </div>
    </motion.div>
  );
};

export default InfoPages;
