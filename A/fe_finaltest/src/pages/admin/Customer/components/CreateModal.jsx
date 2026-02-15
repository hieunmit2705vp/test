import React, { useState, useEffect } from 'react';
import CustomerService from '../../../../services/CustomerService';
import CustomerAddressService from '../../../../services/CustomerAddressService';
import GHNService from '../../../../services/GHNService';
import { toast } from 'react-toastify';

const CreateModal = ({ isOpen, onCancel, setCreateModal, fetchCustomers }) => {
    const [newCustomer, setNewCustomer] = useState({
        fullname: '',
        username: '',
        email: '',
        phone: '',
        gender: 0,
        birthdate: ''
    });
    const [addresses, setAddresses] = useState([]);
    const [provinces, setProvinces] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [wards, setWards] = useState([]);
    const [newAddress, setNewAddress] = useState({
        provinceId: '',
        provinceName: '',
        districtId: '',
        districtName: '',
        wardId: '',
        wardName: '',
        addressDetail: ''
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            resetForm();
            fetchProvinces();
        }
    }, [isOpen]);

    const fetchProvinces = async () => {
        try {
            const response = await GHNService.getProvinces();
            setProvinces(response.data);
        } catch (error) {
            console.error("Error fetching provinces:", error);
        }
    };

    const fetchDistricts = async (provinceId) => {
        try {
            const response = await GHNService.getDistrictsByProvince(provinceId);
            setDistricts(response.data);
        } catch (error) {
            console.error("Error fetching districts:", error);
        }
    };

    const fetchWards = async (districtId) => {
        try {
            const response = await GHNService.getWardsByDistrict(districtId);
            setWards(response.data);
        } catch (error) {
            console.error("Error fetching wards:", error);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setNewCustomer(prev => ({ ...prev, [name]: value }));
    };

    const handleAddressChange = (e) => {
        const { name, value } = e.target;
        setNewAddress(prev => ({ ...prev, [name]: value }));

        if (name === 'provinceId') {
            const selectedProvince = provinces.find(p => p.ProvinceID == value);
            setNewAddress(prev => ({ ...prev, provinceName: selectedProvince?.ProvinceName || '' }));
            fetchDistricts(value);
        }

        if (name === 'districtId') {
            const selectedDistrict = districts.find(d => d.DistrictID == value);
            setNewAddress(prev => ({ ...prev, districtName: selectedDistrict?.DistrictName || '' }));
            fetchWards(value);
        }

        if (name === 'wardId') {
            const selectedWard = wards.find(w => w.WardCode === value);
            setNewAddress(prev => ({ ...prev, wardName: selectedWard?.WardName || '' }));
        }
    };

    const handleCreateCustomer = async () => {
        setLoading(true);
        try {
            const response = await CustomerService.add(newCustomer);
            const createdCustomer = response.data;

            toast.success("Tạo khách hàng thành công!");

            if (newAddress.provinceId && newAddress.districtId && newAddress.wardId && newAddress.addressDetail) {
                await CustomerAddressService.create({
                    customerId: createdCustomer.id,
                    provinceId: newAddress.provinceId,
                    provinceName: newAddress.provinceName,
                    districtId: newAddress.districtId,
                    districtName: newAddress.districtName,
                    wardId: newAddress.wardId,
                    wardName: newAddress.wardName,
                    addressDetail: newAddress.addressDetail
                });
            }

            setCreateModal(false);
            fetchCustomers();
        } catch (error) {
            toast.error(error.response?.data?.message || "Tạo khách hàng thất bại!");
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setNewCustomer({
            fullname: '',
            username: '',
            email: '',
            phone: '',
            gender: 0,
            birthdate: ''
        });
        setNewAddress({
            provinceId: '',
            provinceName: '',
            districtId: '',
            districtName: '',
            wardId: '',
            wardName: '',
            addressDetail: ''
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="bg-gradient-to-r from-[#1E3A8A] via-[#2563EB] to-[#1E3A8A] px-8 py-6 rounded-t-2xl relative overflow-hidden">
                    <div className="absolute inset-0 bg-white opacity-5"></div>
                    <h2 className="text-3xl font-bold text-white text-center relative z-10">
                        Tạo khách hàng mới
                    </h2>
                    <button
                        className="absolute top-4 right-4 text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-all z-10"
                        onClick={onCancel}
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="p-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Thông tin khách hàng */}
                        <div>
                            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 mb-6 border-l-4 border-[#1E3A8A]">
                                <h3 className="text-lg font-bold text-[#1E3A8A] flex items-center">
                                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                    </svg>
                                    Thông tin cá nhân
                                </h3>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col">
                                    <label className="text-sm font-semibold text-gray-700 mb-2">Tên khách hàng</label>
                                    <input
                                        type="text"
                                        name="fullname"
                                        value={newCustomer.fullname}
                                        onChange={handleChange}
                                        className="border-2 border-gray-300 rounded-lg px-4 py-2.5 w-full focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] focus:border-[#1E3A8A] transition-all text-sm"
                                        placeholder="Nhập tên khách hàng"
                                    />
                                </div>
                                <div className="flex flex-col">
                                    <label className="text-sm font-semibold text-gray-700 mb-2">Tên đăng nhập</label>
                                    <input
                                        type="text"
                                        name="username"
                                        value={newCustomer.username}
                                        onChange={handleChange}
                                        className="border-2 border-gray-300 rounded-lg px-4 py-2.5 w-full focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] focus:border-[#1E3A8A] transition-all text-sm"
                                        placeholder="Nhập tên đăng nhập"
                                    />
                                </div>

                                <div className="flex flex-col">
                                    <label className="text-sm font-semibold text-gray-700 mb-2">Số điện thoại</label>
                                    <input
                                        type="text"
                                        name="phone"
                                        value={newCustomer.phone}
                                        onChange={handleChange}
                                        className="border-2 border-gray-300 rounded-lg px-4 py-2.5 w-full focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] focus:border-[#1E3A8A] transition-all text-sm"
                                        placeholder="Nhập số điện thoại"
                                    />
                                </div>
                                <div className="flex flex-col">
                                    <label className="text-sm font-semibold text-gray-700 mb-2">Email</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={newCustomer.email}
                                        onChange={handleChange}
                                        className="border-2 border-gray-300 rounded-lg px-4 py-2.5 w-full focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] focus:border-[#1E3A8A] transition-all text-sm"
                                        placeholder="Nhập email"
                                    />
                                </div>

                                <div className="flex flex-col">
                                    <label className="text-sm font-semibold text-gray-700 mb-2">Ngày sinh</label>
                                    <input
                                        type="date"
                                        name="birthdate"
                                        value={newCustomer.birthdate}
                                        onChange={handleChange}
                                        className="border-2 border-gray-300 rounded-lg px-4 py-2.5 w-full focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] focus:border-[#1E3A8A] transition-all text-sm bg-white"
                                    />
                                </div>
                                <div className="flex flex-col">
                                    <label className="text-sm font-semibold text-gray-700 mb-2">Giới tính</label>
                                    <select
                                        name="gender"
                                        value={newCustomer.gender}
                                        onChange={handleChange}
                                        className="border-2 border-gray-300 rounded-lg px-4 py-2.5 w-full focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] focus:border-[#1E3A8A] transition-all text-sm bg-white"
                                    >
                                        <option value={0}>Nam</option>
                                        <option value={1}>Nữ</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Địa chỉ */}
                        <div>
                            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 mb-6 border-l-4 border-[#1E3A8A]">
                                <h3 className="text-lg font-bold text-[#1E3A8A] flex items-center">
                                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                    </svg>
                                    Địa chỉ
                                </h3>
                            </div>

                            <div className="grid grid-cols-3 gap-3 mb-4">
                                <div className="flex flex-col">
                                    <label className="text-sm font-semibold text-gray-700 mb-2">Tỉnh/Thành</label>
                                    <select
                                        name="provinceId"
                                        value={newAddress.provinceId}
                                        onChange={(e) => { handleAddressChange(e); fetchDistricts(e.target.value); }}
                                        className="border-2 border-gray-300 rounded-lg px-3 py-2.5 w-full focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] focus:border-[#1E3A8A] transition-all text-sm bg-white"
                                    >
                                        <option value="">Chọn tỉnh/thành</option>
                                        {provinces.map(province => (
                                            <option key={province.ProvinceID} value={province.ProvinceID}>{province.ProvinceName}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="flex flex-col">
                                    <label className="text-sm font-semibold text-gray-700 mb-2">Quận/Huyện</label>
                                    <select
                                        name="districtId"
                                        value={newAddress.districtId}
                                        onChange={(e) => { handleAddressChange(e); fetchWards(e.target.value); }}
                                        className="border-2 border-gray-300 rounded-lg px-3 py-2.5 w-full focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] focus:border-[#1E3A8A] transition-all text-sm bg-white"
                                    >
                                        <option value="">Chọn quận/huyện</option>
                                        {districts.map(district => (
                                            <option key={district.DistrictID} value={district.DistrictID}>{district.DistrictName}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="flex flex-col">
                                    <label className="text-sm font-semibold text-gray-700 mb-2">Phường/Xã</label>
                                    <select
                                        name="wardId"
                                        value={newAddress.wardId}
                                        onChange={handleAddressChange}
                                        className="border-2 border-gray-300 rounded-lg px-3 py-2.5 w-full focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] focus:border-[#1E3A8A] transition-all text-sm bg-white"
                                    >
                                        <option value="">Chọn phường/xã</option>
                                        {wards.map(ward => (
                                            <option key={ward.WardCode} value={ward.WardCode}>{ward.WardName}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="flex flex-col">
                                <label className="text-sm font-semibold text-gray-700 mb-2">Địa chỉ chi tiết</label>
                                <textarea
                                    name="addressDetail"
                                    value={newAddress.addressDetail}
                                    onChange={handleAddressChange}
                                    rows="4"
                                    className="border-2 border-gray-300 rounded-lg px-4 py-2.5 w-full focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] focus:border-[#1E3A8A] transition-all text-sm resize-none"
                                    placeholder="Nhập địa chỉ chi tiết (số nhà, tên đường...)"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end space-x-4 mt-8 pt-6 border-t-2 border-gray-200">
                        <button
                            onClick={onCancel}
                            className="px-8 py-3 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-xl font-semibold hover:from-gray-200 hover:to-gray-300 transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105"
                            disabled={loading}
                        >
                            Hủy
                        </button>
                        <button
                            onClick={handleCreateCustomer}
                            disabled={loading}
                            className={`px-8 py-3 bg-gradient-to-r from-[#1E3A8A] to-[#2563EB] text-white rounded-xl font-semibold hover:from-[#163172] hover:to-[#1E3A8A] transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center ${loading ? "opacity-50 cursor-not-allowed" : ""
                                }`}
                        >
                            {loading ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Đang tạo...
                                </>
                            ) : (
                                <>
                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                    </svg>
                                    Tạo khách hàng
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateModal;