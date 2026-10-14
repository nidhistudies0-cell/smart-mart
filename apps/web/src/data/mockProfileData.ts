export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  avatarUrl?: string;
  address: UserAddress;
}

export interface UserAddress {
  id: string;
  title: string;
  isDefault: boolean;
  addressLine: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
  tag?: "hostel" | "home" | "work" | "other";
}

export const INITIAL_MOCK_PROFILE: UserProfile = {
  id: "user-juhi-01",
  name: "Juhi Gupta",
  email: "juhi.gupta@gmail.com",
  phoneNumber: "+91 98765 43210",
  avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80",
  address: {
    id: "addr-01",
    title: "Hostel Address",
    isDefault: true,
    addressLine: "TT Block, Room 307",
    landmark: "VIT Vellore, Katpadi",
    city: "Vellore",
    state: "Tamil Nadu",
    pincode: "632014",
    tag: "hostel",
  },
};
