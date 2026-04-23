"use client";

import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/lib/store";
import { 
  updateProfile, 
  addAddress, 
  removeAddress, 
  setPrimaryAddress 
} from "@/lib/features/authSlice";
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Trash2, 
  Star, 
  Plus, 
  Save, 
  Camera,
  CheckCircle2
} from "lucide-react";
import AddressModal from "@/components/AddressModal";

export default function ProfilePage() {
  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();

  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
      setPhone(user.phone || "");
    }
  }, [user]);

  const handleSaveProfile = () => {
    dispatch(updateProfile({ name, email, phone }));
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-lavender-gradient pt-32 pb-20">
      <div className="max-w-4xl mx-auto px-6">
        
        <header className="mb-10 text-center">
          <h1 className="font-display font-bold text-brand-text text-4xl md:text-5xl tracking-tight mb-4">
            Your <span className="text-brand-violet">Profile.</span>
          </h1>
          <p className="font-body text-brand-muted max-w-lg mx-auto">
            Manage your account details and delivery preferences.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* ---- Sidebar: Photo & Basics ---- */}
          <div className="md:col-span-1 space-y-6">
            <div className="bg-white/80 backdrop-blur-md rounded-3xl border border-white/50 p-8 shadow-xl text-center">
              <div className="relative inline-block mb-6">
                <div className="w-32 h-32 bg-brand-lavender rounded-full flex items-center justify-center text-4xl shadow-inner border-4 border-white overflow-hidden">
                  {user.name.charAt(0)}
                </div>
                <button className="absolute bottom-0 right-0 p-2 bg-brand-violet text-white rounded-full shadow-lg hover:scale-110 transition-transform">
                  <Camera className="w-4 h-4" />
                </button>
              </div>
              
              <h2 className="font-display font-bold text-brand-text text-xl mb-1">{user.name}</h2>
              <p className="font-body text-brand-muted text-sm flex items-center justify-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-brand-violet" />
                {user.email}
              </p>
            </div>
          </div>

          {/* ---- Main Content: Settings ---- */}
          <div className="md:col-span-2 space-y-6">
            
            {/* Personal Details Section */}
            <div className="bg-white/60 backdrop-blur-sm rounded-3xl border border-white/50 p-8 shadow-sm">
              <h3 className="font-display font-bold text-brand-text text-xl mb-6 flex items-center gap-2">
                <User className="w-5 h-5 text-brand-violet" />
                Personal Details
              </h3>
              
              <div className="space-y-6">
                {/* Name Input */}
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-display font-bold text-brand-text uppercase tracking-wider">
                    Full Name
                  </label>
                  <div className="relative">
                    <input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your name"
                      className="w-full bg-white border border-brand-lavender-mid rounded-xl px-4 py-3 pl-11 font-body focus:outline-none focus:ring-2 focus:ring-brand-violet/20 focus:border-brand-violet transition-all"
                    />
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-muted" />
                  </div>
                </div>

                {/* Email Input */}
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-display font-bold text-brand-text uppercase tracking-wider">
                    Email Address
                  </label>
                  <div className="relative">
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Your email"
                      className="w-full bg-white border border-brand-lavender-mid rounded-xl px-4 py-3 pl-11 font-body focus:outline-none focus:ring-2 focus:ring-brand-violet/20 focus:border-brand-violet transition-all"
                    />
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-muted" />
                  </div>
                </div>

                {/* Phone Input */}
                <div className="space-y-2">
                  <label htmlFor="phone" className="text-sm font-display font-bold text-brand-text uppercase tracking-wider">
                    Phone Number
                  </label>
                  <div className="relative">
                    <input
                      id="phone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. +353 87 123 4567"
                      className="w-full bg-white border border-brand-lavender-mid rounded-xl px-4 py-3 pl-11 font-body focus:outline-none focus:ring-2 focus:ring-brand-violet/20 focus:border-brand-violet transition-all"
                    />
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-muted" />
                  </div>
                </div>

                <button 
                  onClick={handleSaveProfile}
                  className="flex items-center gap-2 bg-brand-violet hover:bg-brand-violet-dark text-white font-display font-bold px-8 py-4 rounded-2xl shadow-violet-glow transition-all active:scale-95"
                >
                  {isSaved ? (
                    <>
                      <CheckCircle2 className="w-5 h-5" />
                      Changes Saved
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      Save Profile
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Address List Management */}
            <div className="bg-white/60 backdrop-blur-sm rounded-3xl border border-white/50 p-8 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-display font-bold text-brand-text text-xl flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-brand-violet" />
                  Saved Addresses
                </h3>
                <AddressModal>
                  <button className="text-brand-violet hover:text-brand-violet-dark font-display font-bold text-xs uppercase tracking-widest flex items-center gap-1.5 p-2 rounded-lg hover:bg-brand-violet/5 transition-colors">
                    <Plus className="w-4 h-4" />
                    Add New
                  </button>
                </AddressModal>
              </div>
              
              <div className="space-y-4">
                {user.addresses.length === 0 ? (
                  <p className="text-center py-8 text-brand-muted font-body bg-brand-lavender/20 rounded-2xl border border-dashed border-brand-lavender-mid">
                    No addresses saved yet.
                  </p>
                ) : (
                  user.addresses.map((addr, index) => {
                    const isPrimary = index === user.primaryAddressIndex;
                    return (
                      <div 
                        key={index}
                        className={`p-5 rounded-2xl border transition-all flex items-start justify-between gap-4 ${
                          isPrimary 
                            ? "bg-brand-violet/5 border-brand-violet shadow-sm" 
                            : "bg-white border-brand-lavender-mid hover:border-brand-violet/30"
                        }`}
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            {isPrimary && (
                              <span className="bg-brand-violet text-white text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-md">
                                Primary
                              </span>
                            )}
                            <span className="text-xs font-display font-bold text-brand-muted uppercase tracking-wider">
                              Address #{index + 1}
                            </span>
                          </div>
                          <p className="font-body text-brand-text text-sm leading-relaxed">
                            {addr}
                          </p>
                        </div>
                        
                        <div className="flex flex-col items-end gap-2">
                          {!isPrimary && (
                            <button 
                              onClick={() => dispatch(setPrimaryAddress(index))}
                              className="p-2 text-brand-muted hover:text-brand-violet transition-colors"
                              title="Set as Primary"
                            >
                              <Star className="w-4 h-4" />
                            </button>
                          )}
                          <button 
                            onClick={() => dispatch(removeAddress(index))}
                            className="p-2 text-red-400 hover:text-red-600 transition-colors"
                            title="Remove"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
