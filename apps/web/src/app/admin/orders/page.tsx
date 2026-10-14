"use client";

import { useEffect, useState } from "react";
import { fetchApi } from "@/lib/api";
import { ChevronDown, ChevronUp, Clock, CheckCircle, Truck, Package, XCircle } from "lucide-react";

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [orderDetails, setOrderDetails] = useState<any>(null);

  const loadOrders = () => {
    setLoading(true);
    fetchApi<any[]>("/api/orders")
      .then(setOrders)
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const toggleExpand = async (orderId: number) => {
    if (expandedId === orderId) {
      setExpandedId(null);
      setOrderDetails(null);
      return;
    }
    setExpandedId(orderId);
    setOrderDetails(null);
    try {
      const details = await fetchApi(`/api/orders/${orderId}`);
      setOrderDetails(details);
    } catch (err) {
      console.error(err);
    }
  };

  const handleStatusChange = async (orderId: number, status: string) => {
    try {
      await fetchApi(`/api/orders/${orderId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ orderStatus: status }),
      });
      loadOrders();
      if (expandedId === orderId) {
        toggleExpand(orderId);
        toggleExpand(orderId);
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  const StatusIcon = ({ status }: { status: string }) => {
    switch (status) {
      case "Pending": return <Clock size={16} className="text-amber-500" />;
      case "Confirmed": return <CheckCircle size={16} className="text-blue-500" />;
      case "Shipped": return <Truck size={16} className="text-indigo-500" />;
      case "Delivered": return <Package size={16} className="text-emerald-500" />;
      case "Cancelled": return <XCircle size={16} className="text-rose-500" />;
      default: return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Customer Orders</h1>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading orders...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50/50 text-gray-500 text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4 font-medium">Order ID / Date</th>
                  <th className="px-6 py-4 font-medium">Customer</th>
                  <th className="px-6 py-4 font-medium">Total</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {orders.map((order) => (
                  <React.Fragment key={order.orderId}>
                    <tr className={`hover:bg-gray-50/50 transition-colors ${expandedId === order.orderId ? 'bg-gray-50/50' : ''}`}>
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">#{order.orderId}</div>
                        <div className="text-xs text-gray-500 mt-1">{new Date(order.orderDate).toLocaleString()}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{order.customerName}</div>
                        <div className="text-xs text-gray-500 mt-1">{order.customerEmail}</div>
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-900">
                        ₹{Number(order.totalAmount).toLocaleString("en-IN")}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5">
                          <StatusIcon status={order.orderStatus} />
                          <select
                            value={order.orderStatus}
                            onChange={(e) => handleStatusChange(order.orderId, e.target.value)}
                            className="bg-transparent border-none text-sm font-medium focus:ring-0 cursor-pointer p-0 m-0"
                          >
                            <option value="Pending">Pending</option>
                            <option value="Confirmed">Confirmed</option>
                            <option value="Shipped">Shipped</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => toggleExpand(order.orderId)}
                          className="text-gray-500 hover:text-indigo-600 transition-colors p-1"
                        >
                          {expandedId === order.orderId ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                        </button>
                      </td>
                    </tr>
                    {expandedId === order.orderId && (
                      <tr className="bg-gray-50/30">
                        <td colSpan={5} className="px-6 py-6 border-t border-gray-100">
                          {orderDetails ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                              <div>
                                <h4 className="font-semibold text-gray-900 mb-4 text-sm uppercase tracking-wider">Order Items</h4>
                                <ul className="space-y-3">
                                  {orderDetails.items.map((item: any) => (
                                    <li key={item.orderDetailId} className="flex justify-between items-center text-sm bg-white p-3 rounded-lg border border-gray-100">
                                      <span className="font-medium text-gray-900">{item.productName} <span className="text-gray-500 font-normal">x{item.quantity}</span></span>
                                      <span className="text-gray-900 font-medium">₹{(Number(item.unitPrice) * item.quantity).toLocaleString("en-IN")}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                              <div className="space-y-6">
                                <div>
                                  <h4 className="font-semibold text-gray-900 mb-2 text-sm uppercase tracking-wider">Shipping Details</h4>
                                  <div className="text-sm text-gray-600 bg-white p-4 rounded-lg border border-gray-100">
                                    {orderDetails.shippingAddress || "No shipping address provided."}
                                  </div>
                                </div>
                                <div>
                                  <h4 className="font-semibold text-gray-900 mb-2 text-sm uppercase tracking-wider">Payment Information</h4>
                                  <div className="text-sm bg-white p-4 rounded-lg border border-gray-100">
                                    {orderDetails.payment ? (
                                      <div className="space-y-1">
                                        <div className="flex justify-between"><span className="text-gray-500">Method:</span> <span className="font-medium text-gray-900">{orderDetails.payment.paymentMethod}</span></div>
                                        <div className="flex justify-between"><span className="text-gray-500">Status:</span> <span className={`font-medium ${orderDetails.payment.paymentStatus === 'Completed' ? 'text-emerald-600' : 'text-amber-600'}`}>{orderDetails.payment.paymentStatus}</span></div>
                                        <div className="flex justify-between"><span className="text-gray-500">Amount Paid:</span> <span className="font-medium text-gray-900">₹{Number(orderDetails.payment.amount).toLocaleString("en-IN")}</span></div>
                                      </div>
                                    ) : (
                                      <span className="text-gray-500">No payment record found.</span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="text-center py-4 text-gray-500 text-sm">Loading details...</div>
                          )}
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
                {orders.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">No orders found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

import React from "react";
