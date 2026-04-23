import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/lib/store";
import { 
  updateProfile, 
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
  CheckCircle2,
  ShoppingBag,
  CreditCard,
  ChevronRight
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
    <div className="min-h-screen pt-32 pb-20">
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

          <div className="md:col-span-2 space-y-6">
            <div className="bg-white/60 backdrop-blur-sm rounded-3xl border border-white/50 p-8 shadow-sm">
              <h3 className="font-display font-bold text-brand-text text-xl mb-6 flex items-center gap-2">
                <User className="w-5 h-5 text-brand-violet" />
                Personal Details
              </h3>
              <div className="space-y-6">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-display font-bold text-brand-text uppercase tracking-wider">Full Name</label>
                  <input id="name" value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-white border border-brand-lavender-mid rounded-xl px-4 py-3 font-body focus:outline-none focus:ring-2 focus:ring-brand-violet/20" />
                </div>
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-display font-bold text-brand-text uppercase tracking-wider">Email Address</label>
                  <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-white border border-brand-lavender-mid rounded-xl px-4 py-3 font-body focus:outline-none focus:ring-2 focus:ring-brand-violet/20" />
                </div>
                <div className="space-y-2">
                  <label htmlFor="phone" className="text-sm font-display font-bold text-brand-text uppercase tracking-wider">Phone Number</label>
                  <input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full bg-white border border-brand-lavender-mid rounded-xl px-4 py-3 font-body focus:outline-none focus:ring-2 focus:ring-brand-violet/20" />
                </div>
                <button onClick={handleSaveProfile} className="flex items-center gap-2 bg-brand-violet text-white font-display font-bold px-8 py-4 rounded-2xl shadow-violet-glow transition-all">
                  {isSaved ? <><CheckCircle2 className="w-5 h-5" /> Saved</> : <><Save className="w-5 h-5" /> Save Profile</>}
                </button>
              </div>
            </div>

            <div className="bg-white/60 backdrop-blur-sm rounded-3xl border border-white/50 p-8 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-display font-bold text-brand-text text-xl flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-brand-violet" /> Saved Addresses
                </h3>
                <AddressModal>
                  <button className="text-brand-violet font-display font-bold text-xs uppercase tracking-widest flex items-center gap-1.5 p-2 rounded-lg hover:bg-brand-violet/5 transition-colors">
                    <Plus className="w-4 h-4" /> Add New
                  </button>
                </AddressModal>
              </div>
              <div className="space-y-4">
                {user.addresses.map((addr, index) => (
                  <div key={index} className={`p-5 rounded-2xl border flex items-start justify-between gap-4 ${index === user.primaryAddressIndex ? "bg-brand-violet/5 border-brand-violet" : "bg-white border-brand-lavender-mid"}`}>
                    <p className="font-body text-brand-text text-sm">{addr}</p>
                    <div className="flex gap-2">
                      {index !== user.primaryAddressIndex && <button onClick={() => dispatch(setPrimaryAddress(index))}><Star className="w-4 h-4 text-brand-muted hover:text-brand-violet" /></button>}
                      <button onClick={() => dispatch(removeAddress(index))}><Trash2 className="w-4 h-4 text-red-400 hover:text-red-600" /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Link href="/orders" className="bg-white/60 backdrop-blur-sm rounded-3xl border border-white/50 p-6 flex items-center justify-between group hover:border-brand-violet/50 transition-all shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-brand-violet/10 rounded-2xl flex items-center justify-center group-hover:bg-brand-violet group-hover:text-white transition-all">
                    <ShoppingBag className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-display font-bold text-brand-text">Order History</h4>
                    <p className="text-xs font-body text-brand-muted">View past deliveries</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-brand-muted group-hover:text-brand-violet" />
              </Link>
              <Link href="/payments" className="bg-white/60 backdrop-blur-sm rounded-3xl border border-white/50 p-6 flex items-center justify-between group hover:border-brand-violet/50 transition-all shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-brand-violet/10 rounded-2xl flex items-center justify-center group-hover:bg-brand-violet group-hover:text-white transition-all">
                    <CreditCard className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-display font-bold text-brand-text">Payment Methods</h4>
                    <p className="text-xs font-body text-brand-muted">Manage your cards</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-brand-muted group-hover:text-brand-violet" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
