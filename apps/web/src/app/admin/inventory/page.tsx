"use client";

import { useEffect, useState } from "react";
import { fetchApi } from "@/lib/api";
import { Package, AlertTriangle, ArrowRight } from "lucide-react";

export default function InventoryPage() {
  const [inventory, setInventory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  
  const [stock, setStock] = useState("");
  const [reorder, setReorder] = useState("");

  const loadData = () => {
    setLoading(true);
    fetchApi<any[]>("/api/inventory")
      .then(setInventory)
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSave = async (productId: number) => {
    try {
      await fetchApi(`/api/inventory/${productId}`, {
        method: "PATCH",
        body: JSON.stringify({ currentStock: Number(stock), reorderLevel: Number(reorder) }),
      });
      setEditingId(null);
      loadData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Inventory Management</h1>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading inventory...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50/50 text-gray-500 text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4 font-medium">Product</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Current Stock</th>
                  <th className="px-6 py-4 font-medium">Reorder Level</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {inventory.map((inv) => {
                  const isLowStock = inv.currentStock <= inv.reorderLevel;
                  const isEditing = editingId === inv.productId;

                  return (
                    <tr key={inv.productId} className={`hover:bg-gray-50/50 transition-colors ${isLowStock ? 'bg-rose-50/20' : ''}`}>
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900 flex items-center gap-2">
                          <Package size={16} className="text-gray-400" />
                          {inv.productName}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">{inv.categoryName} • {inv.supplierName}</div>
                      </td>
                      <td className="px-6 py-4">
                        {isLowStock ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-100 text-rose-800">
                            <AlertTriangle size={12} /> Low Stock
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                            In Stock
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {isEditing ? (
                          <input 
                            type="number" 
                            min="0"
                            value={stock} 
                            onChange={(e) => setStock(e.target.value)}
                            className="w-20 px-2 py-1 bg-white border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500/20 outline-none"
                          />
                        ) : (
                          <span className={`font-medium ${isLowStock ? 'text-rose-600' : 'text-gray-900'}`}>{inv.currentStock}</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {isEditing ? (
                          <input 
                            type="number" 
                            min="0"
                            value={reorder} 
                            onChange={(e) => setReorder(e.target.value)}
                            className="w-20 px-2 py-1 bg-white border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500/20 outline-none"
                          />
                        ) : (
                          <span className="text-gray-600">{inv.reorderLevel}</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {isEditing ? (
                          <div className="flex justify-end gap-2">
                            <button 
                              onClick={() => handleSave(inv.productId)}
                              className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                            >
                              Save
                            </button>
                            <button 
                              onClick={() => setEditingId(null)}
                              className="text-gray-500 hover:text-gray-700 text-sm font-medium"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button 
                            onClick={() => {
                              setEditingId(inv.productId);
                              setStock(String(inv.currentStock));
                              setReorder(String(inv.reorderLevel));
                            }}
                            className="text-indigo-600 hover:text-indigo-800 text-sm font-medium flex items-center justify-end gap-1 ml-auto"
                          >
                            Update <ArrowRight size={14} />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {inventory.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">No inventory found.</td>
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
