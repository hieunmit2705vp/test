import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import CartService from "../../services/CartService";
import { toast, ToastContainer } from "react-toastify";
import { FaTrashAlt, FaLongArrowAltLeft, FaShieldAlt, FaTruck, FaShoppingCart, FaStore } from "react-icons/fa";

function Cart() {
  const [cartItems, setCartItems] = useState([]);
  const [localQuantities, setLocalQuantities] = useState({});
  const [selectedItems, setSelectedItems] = useState([]); // Array of selected item IDs
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCartItems();
  }, []);

  const fetchCartItems = async () => {
    setIsLoading(true);
    try {
      const items = await CartService.getAllCartItems();
      setCartItems(items);

      // Initialize local quantities
      const initialQuantities = {};
      items.forEach((item) => {
        initialQuantities[item.id] = item.quantity;
      });
      setLocalQuantities(initialQuantities);

      // Auto-select all items initially
      setSelectedItems(items.map(item => item.id));
    } catch (error) {
      console.error("Error fetching cart items:", error);
      // toast.error("Không thể tải giỏ hàng");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveItem = async (cartItemId) => {
    try {
      await CartService.removeProductFromCart(cartItemId);
      setCartItems((prevItems) => prevItems.filter((item) => item.id !== cartItemId));
      setSelectedItems(prev => prev.filter(id => id !== cartItemId));
      setLocalQuantities((prev) => {
        const newQuantities = { ...prev };
        delete newQuantities[cartItemId];
        return newQuantities;
      });
      toast.success("Đã xóa sản phẩm khỏi giỏ hàng");
    } catch (error) {
      toast.error(error.response?.data?.message || "Lỗi khi xóa sản phẩm");
    }
  };

  const updateQuantityAndSync = async (cartItemId, newQuantity) => {
    if (newQuantity < 1) return;

    // Optimistic update
    setLocalQuantities((prev) => ({ ...prev, [cartItemId]: newQuantity }));

    try {
      const updatedItem = await CartService.updateCartItemQuantity(cartItemId, newQuantity);

      setCartItems((prevItems) =>
        prevItems.map((item) => (item.id === cartItemId ? updatedItem : item))
      );

      // Sync strictly with BE response
      setLocalQuantities((prev) => ({ ...prev, [cartItemId]: updatedItem.quantity }));
    } catch (error) {
      toast.error(error.response?.data?.message || "Lỗi cập nhật số lượng");
      // Revert on error
      const originalItem = cartItems.find((item) => item.id === cartItemId);
      if (originalItem) {
        setLocalQuantities((prev) => ({ ...prev, [cartItemId]: originalItem.quantity }));
      }
    }
  };

  const handleQuantityBlur = (cartItemId, e) => {
    let value = parseInt(e.target.value);
    if (isNaN(value) || value < 1) value = 1;
    if (value !== cartItems.find(i => i.id === cartItemId)?.quantity) {
      updateQuantityAndSync(cartItemId, value);
    }
  };

  // Selection Logic
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedItems(cartItems.map(item => item.id));
    } else {
      setSelectedItems([]);
    }
  };

  const handleSelectItem = (id) => {
    setSelectedItems(prev => {
      if (prev.includes(id)) {
        return prev.filter(item => item !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  // Calculations for SELECTED items only
  const selectedCartItems = cartItems.filter(item => selectedItems.includes(item.id));

  const totalAmount = selectedCartItems.reduce((total, item) => {
    const qty = parseInt(localQuantities[item.id]) || item.quantity;
    return total + (item.discountPrice || item.price) * qty;
  }, 0);

  const totalSelectedQuantity = selectedCartItems.reduce((total, item) => {
    return total + (parseInt(localQuantities[item.id]) || item.quantity);
  }, 0);


  const proceedToPayment = () => {
    if (selectedItems.length === 0) {
      toast.warn("Vui lòng chọn ít nhất một sản phẩm để thanh toán");
      return;
    }

    const itemsToPay = selectedCartItems.map(item => ({
      ...item,
      quantity: parseInt(localQuantities[item.id]) || item.quantity
    }));

    const checkoutState = {
      items: itemsToPay,
      totalAmount: totalAmount,
      totalItems: totalSelectedQuantity,
    };

    navigate("/pay", { state: checkoutState });
  };

  if (isLoading) {
    return <div className="min-h-screen flex justify-center items-center"><div className="w-10 h-10 border-4 border-[#1E3A8A] border-t-transparent rounded-full animate-spin"></div></div>;
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-lg text-center max-w-md w-full">
          <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6 text-[#1E3A8A]">
            <FaShoppingCart size={40} />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Giỏ hàng trống</h2>
          <p className="text-gray-500 mb-8">Bạn chưa thêm sản phẩm nào vào giỏ hàng.</p>
          <button
            onClick={() => navigate("/")}
            className="w-full py-3 bg-[#1E3A8A] text-white rounded-xl font-bold hover:bg-blue-800 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1"
          >
            Tiếp tục mua sắm
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-8 font-sans">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex items-center gap-4 mb-8">
          <Link to="/products" className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-gray-600 hover:text-[#1E3A8A] hover:shadow-md transition-all">
            <FaLongArrowAltLeft />
          </Link>
          <h1 className="text-3xl font-black text-[#1E3A8A]">Giỏ Hàng Của Bạn <span className="text-lg font-medium text-gray-500">({cartItems.length} sản phẩm)</span></h1>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Cart Section */}
          <div className="lg:w-2/3 space-y-4">

            {/* Header Row */}
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center gap-4">
              <input
                type="checkbox"
                checked={selectedItems.length === cartItems.length && cartItems.length > 0}
                onChange={handleSelectAll}
                className="w-5 h-5 text-[#1E3A8A] border-gray-300 rounded focus:ring-[#1E3A8A] cursor-pointer"
              />
              <span className="font-bold text-gray-700">Chọn tất cả ({cartItems.length})</span>
            </div>

            {/* Cart Items */}
            <div className="space-y-4">
              {cartItems.map((item) => {
                const isSelected = selectedItems.includes(item.id);
                const qty = parseInt(localQuantities[item.id]) || item.quantity;
                const itemTotal = (item.discountPrice || item.price) * qty;

                return (
                  <div
                    key={item.id}
                    className={`bg-white rounded-xl p-4 shadow-sm border transition-all duration-300 flex flex-col sm:flex-row items-start sm:items-center gap-4 
                                ${isSelected ? 'border-[#1E3A8A] ring-1 ring-blue-50' : 'border-gray-100 hover:border-blue-200'}
                            `}
                  >
                    {/* Checkbox */}
                    <div className="flex items-center h-full pt-1 sm:pt-0">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleSelectItem(item.id)}
                        className="w-5 h-5 text-[#1E3A8A] border-gray-300 rounded focus:ring-[#1E3A8A] cursor-pointer"
                      />
                    </div>

                    {/* Image */}
                    <Link to={`/product/${item.productDetailId}`} className="w-24 h-24 shrink-0 bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                      <img src={item.photo} alt={item.productName} className="w-full h-full object-cover" />
                    </Link>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="bg-blue-50 text-[#1E3A8A] text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide">
                          {item.brandName || "Brand"}
                        </span>
                      </div>
                      <h3 className="font-bold text-gray-800 text-sm sm:text-base line-clamp-1">{item.productName}</h3>
                      <div className="flex items-center text-sm text-gray-500 mt-1 gap-3">
                        <span className="bg-gray-100 px-2 py-0.5 rounded text-xs">{item.productDetailName || "N/A"}</span>
                      </div>
                      <div className="sm:hidden mt-2 font-bold text-[#1E3A8A]">
                        {(item.discountPrice || item.price).toLocaleString()}₫
                      </div>
                    </div>

                    {/* Price & Quantity (Desktop) */}
                    <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-8 w-full sm:w-auto mt-4 sm:mt-0 justify-between">
                      <div className="hidden sm:block text-right">
                        <div className="font-bold text-gray-800">{(item.discountPrice || item.price).toLocaleString()}₫</div>
                        {item.discountPrice < item.price && (
                          <div className="text-xs text-gray-400 line-through">{item.price.toLocaleString()}₫</div>
                        )}
                      </div>

                      <div className="flex items-center">
                        <button
                          onClick={() => updateQuantityAndSync(item.id, qty - 1)}
                          disabled={qty <= 1}
                          className="w-8 h-8 rounded-l-lg border border-gray-300 bg-gray-50 hover:bg-white flex items-center justify-center text-gray-600 disabled:opacity-50"
                        >-</button>
                        <input
                          type="text"
                          value={qty}
                          onChange={(e) => setLocalQuantities({ ...localQuantities, [item.id]: e.target.value })}
                          onBlur={(e) => handleQuantityBlur(item.id, e)}
                          className="w-12 h-8 border-y border-gray-300 text-center text-sm font-bold focus:outline-none"
                        />
                        <button
                          onClick={() => updateQuantityAndSync(item.id, qty + 1)}
                          className="w-8 h-8 rounded-r-lg border border-gray-300 bg-gray-50 hover:bg-white flex items-center justify-center text-gray-600"
                        >+</button>
                      </div>

                      <div className="text-right w-24">
                        <div className="font-black text-[#1E3A8A]">{itemTotal.toLocaleString()}₫</div>
                      </div>

                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        className="text-gray-400 hover:text-red-500 transition-colors p-2 hover:bg-red-50 rounded-full"
                        title="Xóa sản phẩm"
                      >
                        <FaTrashAlt />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Sidebar Summary */}
          <div className="lg:w-1/3">
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 sticky top-24">
              <h2 className="text-xl font-bold text-gray-800 mb-6 pb-4 border-b border-gray-100">Tổng Đơn Hàng</h2>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Đã chọn</span>
                  <span className="font-medium">{selectedItems.length} sản phẩm</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Tổng số lượng</span>
                  <span className="font-medium">{totalSelectedQuantity}</span>
                </div>
              </div>

              <div className="flex justify-between items-end mb-8 pt-4 border-t border-gray-100">
                <span className="text-gray-800 font-bold">Tổng thanh toán</span>
                <div className="text-right">
                  <div className="text-2xl font-black text-[#1E3A8A]">{totalAmount.toLocaleString()}₫</div>
                  <div className="text-xs text-gray-500 font-normal">(Chưa bao gồm phí vận chuyển)</div>
                </div>
              </div>

              <button
                onClick={proceedToPayment}
                disabled={selectedItems.length === 0}
                className="w-full py-4 bg-[#1E3A8A] text-white rounded-xl font-bold text-lg shadow-lg hover:bg-blue-800 hover:shadow-xl hover:-translate-y-1 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
              >
                Mua Hàng <FaTruck />
              </button>

              <div className="mt-6 space-y-3">
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  <FaShieldAlt className="text-green-500 text-lg" />
                  <span>Bảo mật thanh toán tuyệt đối</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  <FaStore className="text-blue-500 text-lg" />
                  <span>Đổi trả miễn phí trong 30 ngày</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Cart;
