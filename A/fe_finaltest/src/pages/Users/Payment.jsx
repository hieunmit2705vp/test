import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Select from "react-select";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import GHNService from "../../services/GHNService";
import PaymentService from "../../services/PaymentService";
import LoginInfoService from "../../services/LoginInfoService";
import VoucherService from "../../services/VoucherServices";
import CustomerAddressService from "../../services/CustomerAddressService";
import {
  FaMoneyBillWave,
  FaCreditCard,
  FaMapMarkerAlt,
  FaUser,
  FaPhoneAlt,
  FaEnvelope,
  FaTruck,
  FaTicketAlt,
  FaShieldAlt,
  FaArrowRight
} from "react-icons/fa";

function Payment() {
  const location = useLocation();
  const navigate = useNavigate();
  const [shippingFee, setShippingFee] = useState(0);
  const [currentUser, setCurrentUser] = useState(null);
  const [userAddresses, setUserAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [vouchers, setVouchers] = useState([]);
  const [selectedProvince, setSelectedProvince] = useState(null);
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [selectedWard, setSelectedWard] = useState(null);
  const [isOrdering, setIsOrdering] = useState(false);
  const [finalTotal, setFinalTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isVoucherModalOpen, setIsVoucherModalOpen] = useState(false);
  const [voucherSearch, setVoucherSearch] = useState("");

  const { items, totalAmount, totalItems } = location.state || {};

  // Redirection if no data
  useEffect(() => {
    if (!items || !totalAmount || !totalItems) {
      toast.error("Không có thông tin đơn hàng. Vui lòng quay lại giỏ hàng.");
      navigate("/cart");
    }
  }, [items, totalAmount, totalItems, navigate]);

  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
  });
  const [selectedVoucher, setSelectedVoucher] = useState(null);
  const [customAddress, setCustomAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cod");

  useEffect(() => {
    const voucherDiscount = calculateVoucherDiscount();
    const newFinalTotal = (totalAmount || 0) + shippingFee - voucherDiscount;
    setFinalTotal(newFinalTotal > 0 ? newFinalTotal : 0);
  }, [totalAmount, shippingFee, selectedVoucher]);

  const calculateVoucherDiscount = () => {
    if (!selectedVoucher || (totalAmount || 0) < selectedVoucher.minCondition) {
      return 0;
    }
    const discountAmount = ((totalAmount || 0) * selectedVoucher.reducedPercent) / 100;
    return Math.min(discountAmount, selectedVoucher.maxDiscount);
  };

  useEffect(() => {
    if (!items) return;

    const fetchAllData = async () => {
      setLoading(true);
      try {
        let user;
        try {
          user = await LoginInfoService.getCurrentUser();
          setCurrentUser(user);
        } catch (error) {
          console.error("Error fetching user:", error);
        }

        let formattedAddresses = [];
        try {
          const addresses = await LoginInfoService.getCurrentUserAddresses();
          formattedAddresses = addresses.map((address) => ({
            value: address.id,
            label: `${address.addressDetail}, ${address.wardName}, ${address.districtName}, ${address.provinceName}`,
            fullAddress: address,
          }));
          setUserAddresses(formattedAddresses);
        } catch (error) {
          console.error("Error fetching addresses:", error);
        }

        setFormData({
          fullName: user?.fullname ?? "",
          phone: user?.phone ?? "",
          email: user?.email ?? "",
        });

        try {
          const response = await GHNService.getProvinces();
          setProvinces(
            response.data.map((province) => ({
              value: province.ProvinceID,
              label: province.ProvinceName,
            }))
          );
        } catch (error) {
          console.error("Error fetching provinces:", error);
        }

        if (formattedAddresses.length > 0) {
          await handleSelectAddress(formattedAddresses[0]);
        }

        try {
          const allVouchers = await VoucherService.getAllVouchers();
          const now = new Date();
          const activeVouchers = allVouchers.content.filter((voucher) => {
            const startDate = new Date(voucher.startDate);
            const endDate = new Date(voucher.endDate);
            return voucher.status && now >= startDate && now <= endDate;
          });
          setVouchers(activeVouchers);

          // Auto-select optimal voucher
          if (activeVouchers.length > 0 && totalAmount > 0) {
            let bestVoucher = null;
            let maxDiscountAmount = -1;

            activeVouchers.forEach(v => {
              if (totalAmount >= v.minCondition) {
                const discount = Math.min((totalAmount * v.reducedPercent) / 100, v.maxDiscount);
                if (discount > maxDiscountAmount) {
                  maxDiscountAmount = discount;
                  bestVoucher = v;
                }
              }
            });

            if (bestVoucher) {
              setSelectedVoucher(bestVoucher);
            }
          }
        } catch (error) {
          console.error("Error fetching vouchers", error)
        }

      } catch (error) {
        console.error("Unexpected error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAllData();
  }, [totalAmount]);

  // GHN Handlers (Keeping logic intact)
  const handleProvinceChange = async (selectedOption) => {
    setSelectedProvince(selectedOption);
    setSelectedDistrict(null);
    setSelectedWard(null);
    setDistricts([]);
    try {
      const response = await GHNService.getDistrictsByProvince(selectedOption.value);
      setDistricts(response.data.map((d) => ({ value: d.DistrictID, label: d.DistrictName })));
    } catch (error) { console.error(error); }
  };

  const handleDistrictChange = async (selectedOption) => {
    setSelectedDistrict(selectedOption);
    setSelectedWard(null);
    setWards([]);
    try {
      const response = await GHNService.getWardsByDistrict(selectedOption.value);
      setWards(response.data.map((w) => ({ value: w.WardCode, label: w.WardName })));
    } catch (error) { console.error(error); }
  };

  const handleWardChange = (selectedOption) => {
    setSelectedWard(selectedOption);
  };

  const fetchShippingFee = async (districtId, wardCode) => {
    try {
      const response = await GHNService.calculateShippingFee({
        toDistrictId: districtId,
        toWardCode: wardCode,
        weight: 1000,
        items: items.map(i => ({ name: i.productName, quantity: i.quantity }))
      });
      setShippingFee(response.data.total);
      return response.data.total;
    } catch (error) {
      console.error("Error fetching shipping fee:", error);
      toast.error("Không thể tính phí vận chuyển cho địa chỉ này.");
      setShippingFee(0);
      return 0;
    }
  };

  const handleSelectAddress = async (selectedOption) => {
    if (!selectedOption?.fullAddress) return;
    setSelectedAddress(selectedOption);

    const { districtId, wardId } = selectedOption.fullAddress;
    if (districtId && wardId) {
      await fetchShippingFee(districtId, wardId);
    }
  };

  const handleCalculateShippingFee = async () => {
    if (!selectedProvince || !selectedDistrict || !selectedWard || !customAddress) {
      toast.error("Vui lòng nhập đầy đủ thông tin địa chỉ");
      return;
    }

    try {
      await fetchShippingFee(selectedDistrict.value, selectedWard.value);

      const addrData = {
        customerId: currentUser?.id,
        provinceId: selectedProvince.value,
        provinceName: selectedProvince.label,
        districtId: selectedDistrict.value,
        districtName: selectedDistrict.label,
        wardId: selectedWard.value,
        wardName: selectedWard.label,
        addressDetail: customAddress
      };

      let newAddr;
      if (currentUser?.id && currentUser.id !== -1) {
        const saveResponse = await CustomerAddressService.create(addrData);
        newAddr = saveResponse.data;
        toast.success("Đã lưu địa chỉ vào tài khoản");
      } else {
        newAddr = {
          id: Date.now(),
          ...addrData
        };
      }

      const formatted = `${newAddr.addressDetail}, ${newAddr.wardName}, ${newAddr.districtName}, ${newAddr.provinceName}`;
      const addrOption = { value: newAddr.id, label: formatted, fullAddress: newAddr };

      setUserAddresses(prev => [...prev, addrOption]);
      setSelectedAddress(addrOption);
      setIsModalOpen(false);
      setCustomAddress("");
      setSelectedProvince(null);
      setSelectedDistrict(null);
      setSelectedWard(null);
    } catch (e) {
      console.error("Error in handleCalculateShippingFee:", e);
      toast.error("Không thể lưu địa chỉ");
    }
  };

  const handleConfirmOrder = async () => {
    setIsConfirmModalOpen(false);
    setIsOrdering(true);

    const voucherId = selectedVoucher?.id ?? selectedVoucher?.value ?? null;

    const orderData = {
      phone: formData.phone,
      address: selectedAddress ? selectedAddress.label : "",
      voucherId: voucherId ? String(voucherId) : null,
      shipfee: shippingFee,
      paymentMethod: paymentMethod === "cod" ? 1 : 2,
      statusOrder: 0,
      orderOnlineDetails: items.map(item => ({ productDetailId: item.productDetailId, quantity: item.quantity }))
    };

    try {
      const response = await PaymentService.createOrder(orderData);
      if (response?.data?.id) {
        toast.success("Đặt hàng thành công!");
        setTimeout(() => navigate("/order"), 2000);
      } else {
        toast.error("Đặt hàng thất bại");
      }
    } catch (e) {
      toast.error("Lỗi đặt hàng: " + (e.response?.data?.message || e.message));
    } finally {
      setIsOrdering(false);
    }
  };

  if (!items) return null;
  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-10 h-10 border-4 border-[#1E3A8A] border-t-transparent rounded-full animate-spin"></div></div>;

  return (
    <div className="bg-gray-50 min-h-screen py-8 font-sans">
      <div className="container mx-auto px-4 max-w-6xl">
        <h1 className="text-3xl font-black text-[#1E3A8A] mb-8 flex items-center gap-3">
          <FaMoneyBillWave /> Thanh Toán
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Form Info */}
          <div className="lg:col-span-2 space-y-6">

            {/* 1. Customer Info */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-blue-100 text-[#1E3A8A] flex items-center justify-center text-sm">1</span>
                Thông tin khách hàng
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                  <FaUser className="absolute top-3.5 left-3 text-gray-400" />
                  <input
                    type="text"
                    value={formData.fullName}
                    readOnly
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#1E3A8A] transition-colors"
                    placeholder="Họ và tên"
                  />
                </div>
                <div className="relative">
                  <FaPhoneAlt className="absolute top-3.5 left-3 text-gray-400" />
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#1E3A8A] transition-colors"
                    placeholder="Số điện thoại"
                  />
                </div>
                <div className="relative md:col-span-2">
                  <FaEnvelope className="absolute top-3.5 left-3 text-gray-400" />
                  <input
                    type="text"
                    value={formData.email}
                    readOnly
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#1E3A8A] transition-colors"
                    placeholder="Email"
                  />
                </div>
              </div>
            </div>

            {/* 2. Shipping Address */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-blue-100 text-[#1E3A8A] flex items-center justify-center text-sm">2</span>
                Địa chỉ giao hàng
              </h2>
              {userAddresses.length > 0 ? (
                <div className="space-y-3 mb-4">
                  {userAddresses.map((addr) => (
                    <div
                      key={addr.value}
                      onClick={() => handleSelectAddress(addr)}
                      className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-start gap-3
                                        ${selectedAddress?.value === addr.value
                          ? 'border-[#1E3A8A] bg-blue-50/50'
                          : 'border-gray-100 hover:border-blue-200 bg-white'}
                                    `}
                    >
                      <div className={`w-5 h-5 rounded-full border-2 mt-0.5 flex items-center justify-center shrink-0
                                         ${selectedAddress?.value === addr.value ? 'border-[#1E3A8A]' : 'border-gray-300'}
                                    `}>
                        {selectedAddress?.value === addr.value && <div className="w-2.5 h-2.5 rounded-full bg-[#1E3A8A]" />}
                      </div>
                      <div>
                        <p className="font-bold text-gray-800">{addr.label.split(',')[0]}</p>
                        <p className="text-sm text-gray-500 mt-1">{addr.label.split(',').slice(1).join(', ')}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-red-500 mb-4">Chưa có địa chỉ nào. Vui lòng thêm địa chỉ.</p>
              )}

              <button
                onClick={() => setIsModalOpen(true)}
                className="w-full py-3 rounded-xl border border-dashed border-[#1E3A8A] text-[#1E3A8A] font-bold hover:bg-blue-50 transition-all flex items-center justify-center gap-2"
              >
                <FaMapMarkerAlt /> Thêm địa chỉ mới
              </button>
            </div>

            {/* 3. Payment Method */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-blue-100 text-[#1E3A8A] flex items-center justify-center text-sm">3</span>
                Phương thức thanh toán
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div
                  onClick={() => setPaymentMethod('cod')}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center gap-3
                                ${paymentMethod === 'cod'
                      ? 'border-[#1E3A8A] bg-blue-50/50'
                      : 'border-gray-100 hover:border-blue-200 bg-white'}
                            `}
                >
                  <div className="w-10 h-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-xl shrink-0"><FaMoneyBillWave /></div>
                  <div>
                    <p className="font-bold text-gray-800">COD</p>
                    <p className="text-xs text-gray-500">Thanh toán khi nhận hàng</p>
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* Right Column: Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 sticky top-24">
              <h2 className="text-xl font-bold text-gray-800 mb-6 pb-4 border-b border-gray-100">Đơn hàng ({totalItems} sản phẩm)</h2>

              <div className="space-y-4 max-h-[300px] overflow-y-auto custom-scrollbar mb-6 pr-2">
                {items.map(item => (
                  <div key={item.id} className="flex gap-3">
                    <div className="w-16 h-16 rounded-lg border border-gray-200 overflow-hidden shrink-0">
                      <img src={item.photo} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm font-bold text-gray-800 line-clamp-1">{item.productName}</h3>
                      <p className="text-xs text-gray-500">{item.productDetailName}</p>
                      <div className="flex justify-between items-center mt-1">
                        <p className="text-xs font-semibold text-gray-600">x{item.quantity}</p>
                        <p className="text-sm font-bold text-[#1E3A8A]">{(item.discountPrice || item.price).toLocaleString()}₫</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Voucher Selector */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3 text-sm font-bold text-gray-700">
                  <FaTicketAlt className="text-[#1E3A8A]" /> Mã giảm giá
                </div>
                {selectedVoucher ? (
                  <div className="p-4 rounded-xl border-2 border-blue-100 bg-blue-50/50 flex items-center justify-between mb-2">
                    <div className="flex-1">
                      <p className="font-bold text-[#1E3A8A]">{selectedVoucher.voucherCode}</p>
                      <p className="text-xs text-gray-600 line-clamp-1">{selectedVoucher.voucherName}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setSelectedVoucher(null)}
                        className="text-xs text-red-500 font-bold hover:underline"
                      >
                        Gỡ
                      </button>
                      <button
                        onClick={() => setIsVoucherModalOpen(true)}
                        className="text-xs text-[#1E3A8A] font-bold hover:underline"
                      >
                        Đổi
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setIsVoucherModalOpen(true)}
                    className="w-full py-3 px-4 rounded-xl border border-gray-200 text-gray-400 text-sm flex items-center justify-between hover:border-[#1E3A8A] hover:bg-gray-50 transition-all"
                  >
                    <span>Chọn hoặc nhập mã...</span>
                    <FaArrowRight size={12} />
                  </button>
                )}
              </div>

              {/* Totals */}
              <div className="space-y-2 pt-4 border-t border-gray-100 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Tạm tính</span>
                  <span className="font-semibold">{totalAmount.toLocaleString()}₫</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Phí vận chuyển</span>
                  <span className="font-semibold">{shippingFee.toLocaleString()}₫</span>
                </div>
                {calculateVoucherDiscount() > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Giảm giá</span>
                    <span className="font-bold">-{calculateVoucherDiscount().toLocaleString()}₫</span>
                  </div>
                )}
                <div className="flex justify-between items-center pt-4 mt-2 border-t border-gray-100">
                  <span className="text-base font-bold text-gray-800">Tổng cộng</span>
                  <span className="text-2xl font-black text-[#1E3A8A]">{finalTotal.toLocaleString()}₫</span>
                </div>
              </div>

              <button
                onClick={() => {
                  if (!formData.phone || !selectedAddress) {
                    toast.error("Vui lòng điền đủ thông tin giao hàng");
                    return;
                  }
                  setIsConfirmModalOpen(true);
                }}
                className="w-full mt-6 py-4 bg-[#1E3A8A] text-white rounded-xl font-bold text-lg shadow-lg hover:bg-blue-800 hover:shadow-xl hover:-translate-y-1 transition-all flex items-center justify-center gap-2"
              >
                Đặt Hàng <FaTruck />
              </button>

              <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-500">
                <FaShieldAlt className="text-green-500" /> Thông tin được bảo mật tuyệt đối
              </div>
            </div>
          </div>
        </div>

        {/* Address Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
              <h2 className="text-xl font-bold text-[#1E3A8A] mb-4">Thêm địa chỉ mới</h2>
              <div className="space-y-4">
                <Select options={provinces} value={selectedProvince} onChange={handleProvinceChange} placeholder="Tỉnh/Thành phố" />
                <Select options={districts} value={selectedDistrict} onChange={handleDistrictChange} placeholder="Quận/Huyện" />
                <Select options={wards} value={selectedWard} onChange={handleWardChange} placeholder="Phường/Xã" />
                <input
                  type="text"
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-[#1E3A8A]"
                  placeholder="Số nhà, tên đường..."
                  value={customAddress}
                  onChange={e => setCustomAddress(e.target.value)}
                />
                <div className="flex gap-3 pt-4">
                  <button onClick={() => setIsModalOpen(false)} className="flex-1 py-2.5 bg-gray-100 rounded-lg font-bold text-gray-600 hover:bg-gray-200">Hủy</button>
                  <button onClick={handleCalculateShippingFee} className="flex-1 py-2.5 bg-[#1E3A8A] text-white rounded-lg font-bold hover:bg-blue-800">Xác nhận</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Confirm Modal */}
        {isConfirmModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl text-center text-gray-600">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 text-[#1E3A8A] text-2xl">
                <FaMoneyBillWave />
              </div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">Xác nhận đơn hàng</h2>
              <p className="text-gray-500 mb-6">Bạn có chắc chắn muốn đặt đơn hàng này với tổng số tiền là <span className="font-bold text-[#1E3A8A]">{finalTotal.toLocaleString()}₫</span>?</p>

              <div className="flex gap-3">
                <button onClick={() => setIsConfirmModalOpen(false)} className="flex-1 py-3 bg-gray-100 rounded-xl font-bold text-gray-600 hover:bg-gray-200">Kiểm tra lại</button>
                <button onClick={handleConfirmOrder} disabled={isOrdering} className="flex-1 py-3 bg-[#1E3A8A] text-white rounded-xl font-bold hover:bg-blue-800 disabled:opacity-50">
                  {isOrdering ? "Đang xử lý..." : "Đồng ý"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Voucher Modal */}
        {isVoucherModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg flex flex-col max-h-[85vh] overflow-hidden animate-fade-in">
              {/* Header */}
              <div className="p-6 border-b border-gray-100 flex items-center justify-between shrink-0">
                <div>
                  <h2 className="text-2xl font-black text-[#1E3A8A]">Kho Voucher</h2>
                  <p className="text-sm text-gray-500 mt-1">Chọn món quà ưu đãi dành cho bạn</p>
                </div>
                <button
                  onClick={() => setIsVoucherModalOpen(false)}
                  className="w-10 h-10 rounded-full bg-gray-50 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-all font-bold text-xl"
                >
                  ✕
                </button>
              </div>

              {/* Search */}
              <div className="px-6 py-4 shrink-0">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
                  <input
                    type="text"
                    placeholder="Tìm theo tên hoặc mã voucher..."
                    className="w-full pl-10 pr-4 py-3 bg-gray-100 border-none rounded-2xl focus:ring-2 focus:ring-[#1E3A8A] transition-all outline-none text-sm"
                    value={voucherSearch}
                    onChange={(e) => setVoucherSearch(e.target.value)}
                  />
                </div>
              </div>

              {/* Voucher List */}
              <div className="p-6 overflow-y-auto space-y-4 flex-1 custom-scrollbar bg-gray-50/50">
                {vouchers
                  .filter(v =>
                    v.voucherCode.toLowerCase().includes(voucherSearch.toLowerCase()) ||
                    v.voucherName.toLowerCase().includes(voucherSearch.toLowerCase())
                  )
                  .map(voucher => {
                    const isEligible = (totalAmount || 0) >= voucher.minCondition;
                    const isSelected = selectedVoucher?.id === voucher.id;

                    return (
                      <div
                        key={voucher.id}
                        onClick={() => {
                          if (isEligible) {
                            setSelectedVoucher(voucher);
                            setIsVoucherModalOpen(false);
                          }
                        }}
                        className={`group relative flex gap-4 p-4 rounded-2xl border-2 transition-all duration-300
                          ${isSelected ? 'border-[#1E3A8A] bg-blue-50/30' : 'border-white bg-white hover:border-blue-200'}
                          ${!isEligible ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}
                        `}
                      >
                        {/* Left part: Icon/Code */}
                        <div className={`w-20 h-20 rounded-xl flex flex-col items-center justify-center shrink-0 border border-dashed
                          ${isSelected ? 'bg-[#1E3A8A] text-white border-white/20' : 'bg-blue-50 text-[#1E3A8A] border-blue-200'}
                        `}>
                          <span className="text-xs font-bold opacity-80 uppercase tracking-tighter">Giảm</span>
                          <span className="text-xl font-black">{voucher.reducedPercent}%</span>
                        </div>

                        {/* Right part: Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start mb-1">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-[#1E3A8A] bg-blue-50 px-2 py-0.5 rounded">
                              {voucher.voucherCode}
                            </span>
                            {!isEligible && (
                              <span className="text-[10px] font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded">
                                Chưa đủ {voucher.minCondition.toLocaleString()}₫
                              </span>
                            )}
                          </div>
                          <h3 className="font-bold text-gray-800 text-sm line-clamp-1 group-hover:text-[#1E3A8A] transition-colors">
                            {voucher.voucherName}
                          </h3>
                          <p className="text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed">
                            {voucher.description}
                          </p>
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-3 text-[10px] font-bold">
                            <span className="text-gray-400 font-medium italic">HSD: {new Date(voucher.endDate).toLocaleDateString('vi-VN')}</span>
                            <span className="text-blue-600">Đơn từ {voucher.minCondition.toLocaleString()}₫</span>
                            <span className="text-gray-800">Tối đa {voucher.maxDiscount.toLocaleString()}₫</span>
                          </div>
                        </div>

                        {/* Selected Indicator */}
                        {isSelected && (
                          <div className="absolute top-2 right-2 w-5 h-5 bg-[#1E3A8A] rounded-full flex items-center justify-center">
                            <span className="text-white text-[10px]">✓</span>
                          </div>
                        )}
                      </div>
                    );
                  })}

                {vouchers.filter(v =>
                  v.voucherCode.toLowerCase().includes(voucherSearch.toLowerCase()) ||
                  v.voucherName.toLowerCase().includes(voucherSearch.toLowerCase())
                ).length === 0 && (
                    <div className="py-12 text-center">
                      <FaTicketAlt className="mx-auto text-4xl text-gray-200 mb-4" />
                      <p className="text-gray-400">Không tìm thấy voucher phù hợp</p>
                    </div>
                  )}
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-gray-100 shrink-0 flex gap-4">
                <button
                  onClick={() => setIsVoucherModalOpen(false)}
                  className="flex-1 py-3 bg-gray-50 text-gray-600 font-bold rounded-xl hover:bg-gray-100 transition-all"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div >
  );
}

export default Payment;
