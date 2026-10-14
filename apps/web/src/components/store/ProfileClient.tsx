"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  User,
  Mail,
  Phone,
  Home,
  ShoppingBag,
  ArrowRight,
  Edit3,
  Plus,
  Camera,
  X,
  Check,
  ChevronRight,
} from "lucide-react";
import { Navbar } from "@/components/store/Navbar";
import {
  INITIAL_MOCK_PROFILE,
  UserProfile,
  UserAddress,
} from "@/data/mockProfileData";

export function ProfileClient() {
  const [profile, setProfile] = useState<UserProfile>(INITIAL_MOCK_PROFILE);

  // Modal states for interactive editing
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [isEditingAddress, setIsEditingAddress] = useState(false);

  // Form states for profile
  const [profileForm, setProfileForm] = useState({
    name: profile.name,
    email: profile.email,
    phoneNumber: profile.phoneNumber,
  });

  // Form states for address
  const [addressForm, setAddressForm] = useState<UserAddress>({
    ...profile.address,
  });

  // Toast feedback state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const handleOpenEditProfile = () => {
    setProfileForm({
      name: profile.name,
      email: profile.email,
      phoneNumber: profile.phoneNumber,
    });
    setIsEditProfileOpen(true);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setProfile((prev) => ({
      ...prev,
      name: profileForm.name,
      email: profileForm.email,
      phoneNumber: profileForm.phoneNumber,
    }));
    setIsEditProfileOpen(false);
    showToast("Profile details updated successfully!");
  };

  const handleOpenAddAddress = () => {
    setIsEditingAddress(false);
    setAddressForm({
      id: "addr-" + Date.now(),
      title: "New Address",
      isDefault: false,
      addressLine: "",
      landmark: "",
      city: "",
      state: "",
      pincode: "",
      tag: "home",
    });
    setIsAddressModalOpen(true);
  };

  const handleOpenEditAddress = () => {
    setIsEditingAddress(true);
    setAddressForm({ ...profile.address });
    setIsAddressModalOpen(true);
  };

  const handleSaveAddress = (e: React.FormEvent) => {
    e.preventDefault();
    setProfile((prev) => ({
      ...prev,
      address: { ...addressForm },
    }));
    setIsAddressModalOpen(false);
    showToast(
      isEditingAddress
        ? "Address updated successfully!"
        : "New address added successfully!"
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F2] text-stone-900 selection:bg-[#D3E2D3] selection:text-[#1A4731] relative overflow-hidden">
      {/* Decorative organic background leaf illustration at top-right matching screenshot */}
      <div
        className="pointer-events-none absolute right-0 top-16 w-96 h-96 opacity-40 bg-no-repeat bg-contain bg-right-top"
        style={{
          backgroundImage: `radial-gradient(circle at top right, rgba(211,226,211,0.6) 0%, rgba(250,247,242,0) 70%)`,
        }}
      />

      {/* Navbar with customer-facing context */}
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full z-10">
        {/* Breadcrumb matching reference: Home > Profile */}
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-2 text-xs sm:text-sm text-stone-500 mb-4"
        >
          <Link href="/" className="hover:text-[#1E4D38] transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
          <span className="font-semibold text-stone-800">Profile</span>
        </nav>

        {/* Page Title & Subtitle */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight">
            My <span className="text-[#1E4D38]">Profile</span>
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            View and manage your personal information, address and orders.
          </p>
        </div>

        {/* Top Hero Profile Banner Card */}
        <div className="bg-white rounded-3xl border border-stone-200/80 p-6 sm:p-8 shadow-2xs mb-8 flex flex-col sm:flex-row items-center sm:items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
            {/* Avatar Container with camera badge button */}
            <div className="relative">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-[#E5EFE2] overflow-hidden border-2 border-[#D5E5D1] flex items-center justify-center shadow-xs">
                {profile.avatarUrl ? (
                  <img
                    src={profile.avatarUrl}
                    alt={profile.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-3xl font-extrabold text-[#1E4D38]">
                    {profile.name.charAt(0)}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => showToast("Avatar photo upload will connect to cloud storage.")}
                className="absolute bottom-1 right-1 w-8 h-8 rounded-full bg-white border border-stone-200 shadow-sm flex items-center justify-center text-stone-600 hover:text-[#1E4D38] hover:bg-stone-50 transition cursor-pointer"
                title="Change Photo"
                aria-label="Change Profile Photo"
              >
                <Camera className="w-4 h-4" />
              </button>
            </div>

            {/* User Name & Email */}
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900">
                {profile.name}
              </h2>
              <p className="text-sm text-stone-500 mt-0.5 font-medium">
                {profile.email}
              </p>
            </div>
          </div>

          {/* Edit Profile Action Button */}
          <button
            onClick={handleOpenEditProfile}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#EAF3E7] hover:bg-[#D8E9D4] text-[#1E4D38] font-bold text-xs sm:text-sm border border-[#D5E5D1] transition-colors cursor-pointer shrink-0"
          >
            <Edit3 className="w-4 h-4" />
            <span>Edit Profile</span>
          </button>
        </div>

        {/* Two-Column Grid: Left (Personal Information) + Right (Address & Past Orders) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* LEFT COLUMN: Personal Information Card */}
          <div className="bg-white rounded-3xl border border-stone-200/80 p-6 sm:p-8 shadow-2xs space-y-6">
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-stone-900">
                Personal Information
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                Your basic account details.
              </p>
            </div>

            <div className="space-y-4">
              {/* Full Name Item */}
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-[#FAF5EE]/70 border border-stone-200/60">
                <div className="w-10 h-10 rounded-full bg-[#E5EFE2] text-[#1E4D38] flex items-center justify-center shrink-0">
                  <User className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="block text-xs text-stone-400 font-medium">
                    Full Name
                  </span>
                  <span className="text-sm sm:text-base font-bold text-stone-800 truncate block mt-0.5">
                    {profile.name}
                  </span>
                </div>
              </div>

              {/* Email Address Item */}
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-[#FAF5EE]/70 border border-stone-200/60">
                <div className="w-10 h-10 rounded-full bg-[#E5EFE2] text-[#1E4D38] flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="block text-xs text-stone-400 font-medium">
                    Email Address
                  </span>
                  <span className="text-sm sm:text-base font-bold text-stone-800 truncate block mt-0.5">
                    {profile.email}
                  </span>
                </div>
              </div>

              {/* Phone Number Item */}
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-[#FAF5EE]/70 border border-stone-200/60">
                <div className="w-10 h-10 rounded-full bg-[#E5EFE2] text-[#1E4D38] flex items-center justify-center shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="block text-xs text-stone-400 font-medium">
                    Phone Number
                  </span>
                  <span className="text-sm sm:text-base font-bold text-stone-800 truncate block mt-0.5">
                    {profile.phoneNumber}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Address and Past Orders */}
          <div className="space-y-8">
            {/* Address Section Card */}
            <div className="bg-white rounded-3xl border border-stone-200/80 p-6 sm:p-8 shadow-2xs space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-stone-900">
                    Address
                  </h3>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Your default delivery address.
                  </p>
                </div>
                <button
                  onClick={handleOpenAddAddress}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-[#EAF3E7] hover:bg-[#D8E9D4] text-[#1E4D38] font-bold text-xs border border-[#D5E5D1] transition cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Address</span>
                </button>
              </div>

              {/* Default Address Sage Box matching screenshot */}
              <div className="bg-[#EAF3E7] border border-[#D5E5D1] rounded-2xl p-5 flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white/80 text-[#1E4D38] flex items-center justify-center shrink-0 shadow-2xs mt-0.5">
                    <Home className="w-5 h-5" />
                  </div>
                  <div className="text-xs sm:text-sm space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-stone-900">
                        {profile.address.title} {profile.address.isDefault && "(Default)"}
                      </span>
                      {profile.address.isDefault && (
                        <span className="px-2 py-0.5 rounded-full bg-[#D5E5D1] text-[#1E4D38] text-[10px] font-bold">
                          Default
                        </span>
                      )}
                    </div>
                    <p className="text-stone-700">{profile.address.addressLine}</p>
                    {profile.address.landmark && (
                      <p className="text-stone-600">{profile.address.landmark}</p>
                    )}
                    <p className="text-stone-600">
                      {profile.address.city}, {profile.address.state} -{" "}
                      {profile.address.pincode}
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleOpenEditAddress}
                  className="text-xs font-bold text-[#1E4D38] hover:underline cursor-pointer shrink-0 pt-0.5"
                >
                  Edit
                </button>
              </div>
            </div>

            {/* Past Orders Card matching reference */}
            <div className="bg-white rounded-3xl border border-stone-200/80 p-6 sm:p-8 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-stone-900">
                  Past Orders
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  View and track your previous orders.
                </p>
              </div>

              {/* View Order History Button navigating to /orders */}
              <Link
                href="/orders"
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border-2 border-[#1E4D38] text-[#1E4D38] hover:bg-[#1E4D38] hover:text-white font-bold text-xs sm:text-sm transition-all duration-200 cursor-pointer shadow-2xs shrink-0 w-full sm:w-auto"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>View Order History</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#1E4D38] text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 text-xs sm:text-sm font-semibold border border-emerald-600 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <Check className="w-4 h-4 text-emerald-300" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Edit Profile Modal */}
      {isEditProfileOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-stone-900/40 backdrop-blur-xs"
            onClick={() => setIsEditProfileOpen(false)}
          />
          <div className="relative bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl z-10 space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h3 className="text-lg font-bold text-stone-900">
                Edit Personal Information
              </h3>
              <button
                onClick={() => setIsEditProfileOpen(false)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={profileForm.name}
                  onChange={(e) =>
                    setProfileForm({ ...profileForm, name: e.target.value })
                  }
                  className="w-full px-3.5 py-2 text-xs sm:text-sm bg-[#FCFAF7] border border-stone-200 rounded-xl text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#1E4D38]/20 focus:border-[#1E4D38]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={profileForm.email}
                  onChange={(e) =>
                    setProfileForm({ ...profileForm, email: e.target.value })
                  }
                  className="w-full px-3.5 py-2 text-xs sm:text-sm bg-[#FCFAF7] border border-stone-200 rounded-xl text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#1E4D38]/20 focus:border-[#1E4D38]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  required
                  value={profileForm.phoneNumber}
                  onChange={(e) =>
                    setProfileForm({
                      ...profileForm,
                      phoneNumber: e.target.value,
                    })
                  }
                  className="w-full px-3.5 py-2 text-xs sm:text-sm bg-[#FCFAF7] border border-stone-200 rounded-xl text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#1E4D38]/20 focus:border-[#1E4D38]"
                />
              </div>

              <div className="pt-3 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditProfileOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-stone-200 text-xs sm:text-sm font-semibold text-stone-700 hover:bg-stone-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#1E4D38] hover:bg-[#163C2B] text-white font-bold text-xs sm:text-sm shadow-xs transition"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add / Edit Address Modal */}
      {isAddressModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-stone-900/40 backdrop-blur-xs"
            onClick={() => setIsAddressModalOpen(false)}
          />
          <div className="relative bg-white rounded-3xl p-6 sm:p-7 max-w-lg w-full shadow-2xl z-10 space-y-5 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h3 className="text-lg font-bold text-stone-900">
                {isEditingAddress ? "Edit Delivery Address" : "Add New Delivery Address"}
              </h3>
              <button
                onClick={() => setIsAddressModalOpen(false)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAddress} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Address Label
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Hostel Address, Home, Office"
                  value={addressForm.title}
                  onChange={(e) =>
                    setAddressForm({ ...addressForm, title: e.target.value })
                  }
                  className="w-full px-3.5 py-2 text-xs sm:text-sm bg-[#FCFAF7] border border-stone-200 rounded-xl text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#1E4D38]/20 focus:border-[#1E4D38]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Street / Block / Room
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. TT Block, Room 307"
                  value={addressForm.addressLine}
                  onChange={(e) =>
                    setAddressForm({
                      ...addressForm,
                      addressLine: e.target.value,
                    })
                  }
                  className="w-full px-3.5 py-2 text-xs sm:text-sm bg-[#FCFAF7] border border-stone-200 rounded-xl text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#1E4D38]/20 focus:border-[#1E4D38]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Area / Campus / Landmark
                </label>
                <input
                  type="text"
                  placeholder="e.g. VIT Vellore, Katpadi"
                  value={addressForm.landmark || ""}
                  onChange={(e) =>
                    setAddressForm({
                      ...addressForm,
                      landmark: e.target.value,
                    })
                  }
                  className="w-full px-3.5 py-2 text-xs sm:text-sm bg-[#FCFAF7] border border-stone-200 rounded-xl text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#1E4D38]/20 focus:border-[#1E4D38]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Vellore"
                    value={addressForm.city}
                    onChange={(e) =>
                      setAddressForm({ ...addressForm, city: e.target.value })
                    }
                    className="w-full px-3.5 py-2 text-xs sm:text-sm bg-[#FCFAF7] border border-stone-200 rounded-xl text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#1E4D38]/20 focus:border-[#1E4D38]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    State
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Tamil Nadu"
                    value={addressForm.state}
                    onChange={(e) =>
                      setAddressForm({ ...addressForm, state: e.target.value })
                    }
                    className="w-full px-3.5 py-2 text-xs sm:text-sm bg-[#FCFAF7] border border-stone-200 rounded-xl text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#1E4D38]/20 focus:border-[#1E4D38]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    PIN Code
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="632014"
                    value={addressForm.pincode}
                    onChange={(e) =>
                      setAddressForm({
                        ...addressForm,
                        pincode: e.target.value,
                      })
                    }
                    className="w-full px-3.5 py-2 text-xs sm:text-sm bg-[#FCFAF7] border border-stone-200 rounded-xl text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#1E4D38]/20 focus:border-[#1E4D38]"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="defaultAddressCheck"
                  checked={addressForm.isDefault}
                  onChange={(e) =>
                    setAddressForm({
                      ...addressForm,
                      isDefault: e.target.checked,
                    })
                  }
                  className="w-4 h-4 rounded text-[#1E4D38] focus:ring-[#1E4D38] cursor-pointer accent-[#1E4D38]"
                />
                <label
                  htmlFor="defaultAddressCheck"
                  className="text-xs font-medium text-stone-700 cursor-pointer"
                >
                  Set as default delivery address
                </label>
              </div>

              <div className="pt-3 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddressModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-stone-200 text-xs sm:text-sm font-semibold text-stone-700 hover:bg-stone-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#1E4D38] hover:bg-[#163C2B] text-white font-bold text-xs sm:text-sm shadow-xs transition"
                >
                  Save Address
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
