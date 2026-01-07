"use client";
import React, { useState } from 'react';
import { Search, MapPin, Calendar, CheckCircle, Menu, X, Phone, Mail, User, Shield } from 'lucide-react';

// --- MOCK DATA (Simulates Database) ---
const INITIAL_PROPERTIES = [
  {
    id: 1,
    title: "The Ikate Super-house",
    location: "Ikate-Lekki",
    type: "Short-let",
    price: "₦200,000 / night",
    image: "https://res.cloudinary.com/dgjbrmeh7/image/upload/v1765261597/house_2_lpa6n8.jpg", // Replace with real image URL
    beds: 3,
    baths: 3,
    available: true,
    features: ["Pool Access", "24/7 Power", "Fast WiFi"]
  },
  {
    id: 2,
    title: "New-road",
    location: "Lekki",
    type: "Long-stay",
    price: "₦4,000,000 / year",
    image: "/api/placeholder/600/401",
    beds: 4,
    baths: 4,
    available: true,
    features: ["Security", "Gym", "Smart Home"]
  },
  {
    id: 3,
    title: "Brownstone",
    location: "Chisco Lekki Phase 1",
    type: "Short-let",
    price: "₦200,000 / night",
    image: "https://res.cloudinary.com/dgjbrmeh7/image/upload/v1765261602/house_1_fpmikz.jpg",
    beds: 2,
    baths: 3,
    available: true,
    features: ["Netflix", "Housekeeping", "Balcony"]
  }
];

const EdgeHomes = () => {
  const [properties, setProperties] = useState(INITIAL_PROPERTIES);
  const [filter, setFilter] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProp, setSelectedProp] = useState(null);
  const [formData, setFormData] = useState({ name: '', email: '', date: '' });
  const [formStatus, setFormStatus] = useState('idle'); 

  
  const handleFilter = (type) => {
    setFilter(type);
    if (type === 'All') {
      setProperties(INITIAL_PROPERTIES);
    } else {
      setProperties(INITIAL_PROPERTIES.filter(p => p.type === type));
    }
  };

  const openBooking = (property) => {
    setSelectedProp(property);
    setIsModalOpen(true);
    setFormStatus('idle');
  };

  const handleSubmitBooking = (e) => {
    e.preventDefault();
    setFormStatus('submitting');
    
    // SIMULATE API CALL & EMAIL NOTIFICATION
    setTimeout(() => {
      setFormStatus('success');
      console.log("Booking sent to Admin:", {
        property: selectedProp.title,
        customer: formData
      });
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
      
      {/* --- NAVIGATION --- */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center">
              {/* Logo */}
              <div className="text-2xl font-bold tracking-tighter text-gray-900">
                EDGE<span className="text-amber-600">HOMES</span>.
              </div>
            </div>
            <div className="hidden md:flex space-x-8">
              <a href="#" className="text-gray-900 hover:text-amber-600 font-medium">Home</a>
              <a href="#listings" className="text-gray-500 hover:text-amber-600 font-medium">Properties</a>
              <a href="#contact" className="text-gray-500 hover:text-amber-600 font-medium">Contact</a>
            </div>
            <button className="bg-gray-900 text-white px-5 py-2 rounded-full font-medium hover:bg-amber-600 transition duration-300">
              List Your Property
            </button>
          </div>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <div className="relative bg-gray-900 h-[600px] flex items-center justify-center overflow-hidden">
        {/* Background Overlay */}
        <div className="absolute inset-0 bg-black/60 z-10"></div>
        <img 
          src="/api/placeholder/1920/1080" 
          alt="Luxury Apartment" 
          className="absolute inset-0 w-full h-full object-cover"
        />
        
        <div className="relative z-20 text-center px-4 max-w-4xl mx-auto">
          <span className="text-amber-500 font-semibold tracking-widest uppercase mb-4 block">Premium Living</span>
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
            Discover Your Perfect <br/> 
            <span className="text-amber-500">Space in the City</span>
          </h1>
          <p className="text-gray-300 text-lg mb-10 max-w-2xl mx-auto">
            Experience luxury short-lets and premium long-stay apartments in the most exclusive locations in hearts of Lagos.
          </p>

          {/* Search Bar */}
          <div className="bg-white p-2 rounded-full flex flex-col md:flex-row items-center max-w-3xl mx-auto shadow-2xl">
            <div className="flex-1 px-6 py-3 w-full border-b md:border-b-0 md:border-r border-gray-200">
              <label className="block text-xs font-bold text-gray-400 uppercase">Location</label>
              <input type="text" placeholder="e.g. Victoria Island" className="w-full outline-none text-gray-700 font-medium"/>
            </div>
            <div className="flex-1 px-6 py-3 w-full border-b md:border-b-0 md:border-r border-gray-200">
              <label className="block text-xs font-bold text-gray-400 uppercase">Type</label>
              <select className="w-full outline-none text-gray-700 font-medium bg-transparent">
                <option>Short-let</option>
                <option>Long-stay</option>
              </select>
            </div>
            <button className="bg-amber-600 hover:bg-amber-700 text-white p-4 rounded-full transition w-full md:w-auto mt-2 md:mt-0">
              <Search className="w-6 h-6 mx-auto" />
            </button>
          </div>
        </div>
      </div>

      {/* --- FEATURED PROPERTIES --- */}
      <div id="listings" className="max-w-7xl mx-auto px-4 py-20">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Featured Properties</h2>
            <p className="text-gray-500 mt-2">Curated luxury for business and leisure.</p>
          </div>
          <div className="hidden md:flex space-x-2 bg-gray-100 p-1 rounded-lg">
            {['All', 'Short-let', 'Long-stay'].map(type => (
              <button 
                key={type}
                onClick={() => handleFilter(type)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition ${filter === type ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'}`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {properties.map((prop) => (
            <div key={prop.id} className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition duration-300 border border-gray-100">
              <div className="relative h-64 overflow-hidden">
                <div className="absolute top-4 left-4 z-10 flex gap-2">
                  <span className="bg-amber-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                    {prop.type}
                  </span>
                  {!prop.available && (
                    <span className="bg-gray-900 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                      Booked
                    </span>
                  )}
                </div>
                <img 
                  src={prop.image} 
                  alt={prop.title} 
                  className="w-full h-full object-cover transform group-hover:scale-110 transition duration-700"
                />
              </div>
              <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-bold text-gray-900">{prop.title}</h3>
                </div>
                <div className="flex items-center text-gray-500 mb-4 text-sm">
                  <MapPin className="w-4 h-4 mr-1 text-amber-500" />
                  {prop.location}
                </div>
                
                <div className="flex items-center gap-4 text-sm text-gray-600 mb-6 border-y border-gray-100 py-3">
                  <span className="flex items-center"><User className="w-4 h-4 mr-1"/> {prop.beds} Beds</span>
                  <span className="flex items-center"><Shield className="w-4 h-4 mr-1"/> {prop.baths} Baths</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-lg font-bold text-gray-900">{prop.price}</div>
                  <button 
                    onClick={() => openBooking(prop)}
                    disabled={!prop.available}
                    className={`px-5 py-2 rounded-lg font-medium transition ${
                      prop.available 
                      ? 'bg-gray-900 text-white hover:bg-amber-600' 
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {prop.available ? 'Book Now' : 'Unavailable'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* --- BOOKING MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-8 relative">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-900"
            >
              <X className="w-6 h-6" />
            </button>

            {formStatus === 'success' ? (
              <div className="text-center py-10">
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Booking Received!</h3>
                <p className="text-gray-500">Thank you. Our team will contact you shortly to confirm your stay at <span className="font-bold text-gray-900">{selectedProp?.title}</span>.</p>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="mt-6 text-amber-600 font-medium hover:underline"
                >
                  Close Window
                </button>
              </div>
            ) : (
              <>
                <h3 className="text-2xl font-bold text-gray-900 mb-1">Book Your Stay</h3>
                <p className="text-gray-500 text-sm mb-6">Requesting: <span className="font-semibold text-amber-600">{selectedProp?.title}</span></p>
                
                <form onSubmit={handleSubmitBooking} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <input 
                      required 
                      type="text" 
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                    <input 
                      required 
                      type="email" 
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Check-in Date</label>
                    <input 
                      required 
                      type="date" 
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
                      onChange={(e) => setFormData({...formData, date: e.target.value})}
                    />
                  </div>
                  <button 
                    type="submit"
                    disabled={formStatus === 'submitting'}
                    className="w-full bg-gray-900 hover:bg-amber-600 text-white font-bold py-4 rounded-lg transition duration-300 mt-4 flex justify-center items-center"
                  >
                    {formStatus === 'submitting' ? 'Processing...' : 'Confirm Booking Request'}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}

      {/* --- FOOTER --- */}
      <footer id="contact" className="bg-gray-900 text-white py-12 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-3 gap-10">
          <div>
            <div className="text-2xl font-bold tracking-tighter mb-4">
              EDGE<span className="text-amber-600">HOMES</span>.
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              We redefine modern living by connecting you with the finest short-lets and luxury homes. Comfort, security, and class.
            </p>
          </div>
          <div>
            <h4 className="text-lg font-bold mb-4">Contact Us</h4>
            <div className="space-y-3 text-gray-400 text-sm">
              <div className="flex items-center"><Phone className="w-4 h-4 mr-2 text-amber-500"/> +234 800 123 4567</div>
              <div className="flex items-center"><Mail className="w-4 h-4 mr-2 text-amber-500"/> bookings@edgehomes.com</div>
              <div className="flex items-center"><MapPin className="w-4 h-4 mr-2 text-amber-500"/> 17 Petrocam Plaza, Elf-Bus-stop, Lagos</div>
            </div>
          </div>
          <div>
            <h4 className="text-lg font-bold mb-4">Admin Access</h4>
            <p className="text-gray-500 text-xs mb-3">Staff login portal for property management.</p>
            <button className="text-sm border border-gray-700 px-4 py-2 rounded hover:bg-gray-800 transition">
              Login to Dashboard
            </button>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 mt-10 pt-6 border-t border-gray-800 text-center text-gray-500 text-xs">
          © 2023 EDGEHOMES Real Estate. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default EdgeHomes;