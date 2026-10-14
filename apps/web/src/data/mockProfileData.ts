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
  id: "",
  name: "Customer",
  email: "",
  phoneNumber: "Not provided",
  avatarUrl: "",
  address: {
    id: "addr-01",
    title: "Delivery Address",
    isDefault: true,
    addressLine: "No address added yet",
    landmark: "",
    city: "",
    state: "",
    pincode: "",
    tag: "home",
  },
};
