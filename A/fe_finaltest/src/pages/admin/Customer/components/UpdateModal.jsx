import React, { useState, useEffect } from 'react';
import { FaTrashAlt } from 'react-icons/fa';
import CustomerService from '../../../../services/CustomerService';
import CustomerAddressService from '../../../../services/CustomerAddressService';
import GHNService from '../../../../services/GHNService';
import { toast } from 'react-toastify';
import ConfirmModal from './ConfirmModal';

const UpdateModal = ({ isOpen, setUpdateModal, customer, fetchCustomers }) => {
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [updatedCustomer, setUpdatedCustomer] = useState(customer || {});
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

    useEffect(() => {
        setUpdatedCustomer(customer || {});
        if (customer) {
            fetchCustomerAddresses(customer.id);
        }
        fetchProvinces();
    }, [customer]);

    const fetchCustomerAddresses = async (customerId) => {
        try {
            const response = await CustomerAddressService.getByCustomerId(customerId);
            setAddresses(response.data);
        } catch (error) {
            console.error("Error fetching customer addresses:", error);
        }
    };

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
        setUpdatedCustomer(prev => ({ ...prev, [name]: value }));
    };

    const handleUpdate = async () => {
        try {
            await CustomerService.update(customer.id, updatedCustomer);
            toast.success("Cập nhật khách hàng thành công!");
            fetchCustomers();
            setUpdateModal(false);
        } catch (error) {
            toast.error(error.response?.data?.message || "Cập nhật khách hàng thất bại!");
        }
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

    const handleAddAddress = async () => {
        if (!newAddress.provinceId || !newAddress.provinceName || !newAddress.districtId || !newAddress.districtName || !newAddress.wardId || !newAddress.wardName || !newAddress.addressDetail) {
            toast.error("Vui lòng điền đầy đủ thông tin địa chỉ!");
            return;
        }

        try {
            const response = await CustomerAddressService.create({
                customerId: customer.id,
                provinceId: newAddress.provinceId,
                provinceName: newAddress.provinceName,
                districtId: newAddress.districtId,
                districtName: newAddress.districtName,
                wardId: newAddress.wardId,
                wardName: newAddress.wardName,
                addressDetail: newAddress.addressDetail
            });
            setAddresses([...addresses, response.data]);
            toast.success("Thêm địa chỉ mới thành công!");
            // Reset form
            setNewAddress({
                provinceId: '',
                provinceName: '',
                districtId: '',
                districtName: '',
                wardId: '',
                wardName: '',
                addressDetail: ''
            });
        } catch (error) {
            toast.error(error.response?.data?.message || "Thêm địa chỉ thất bại!");
        }
    };

    const handleRemoveAddress = async (addressId) => {
        try {
            await CustomerAddressService.delete(addressId);
            setAddresses(addresses.filter(address => address.id !== addressId));
            toast.success("Xóa địa chỉ thành công!");
        } catch (error) {
            toast.error(error.response?.data?.message || "Xóa địa chỉ thất bại!");
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="bg-gradient-to-r from-[#1E3A8A] via-[#2563EB] to-[#1E3A8A] px-8 py-6 rounded-t-2xl relative overflow-hidden sticky top-0 z-10">
                    <div className="absolute inset-0 bg-white opacity-5"></div>
                    <h2 className="text-3xl font-bold text-white text-center relative z-10">
                        Cập nhật khách hàng
                    </h2>
                    <button
                        className="absolute top-4 right-4 text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-all z-10"
                        onClick={() => setUpdateModal(false)}
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
                                    <label className="text-sm font-semibold text-gray-700 mb-2">Mã khách hàng</label>
                                    <input
                                        type="text"
                                        name="customerCode"
                                        value={updatedCustomer.customerCode || ''}
                                        readOnly
                                        className="border-2 border-gray-200 bg-gray-50 rounded-lg px-4 py-2.5 w-full text-sm text-gray-500 cursor-not-allowed"
                                    />
                                </div>
                                <div className="flex flex-col">
                                    <label className="text-sm font-semibold text-gray-700 mb-2">Tên khách hàng</label>
                                    <input
                                        type="text"
                                        name="fullname"
                                        value={updatedCustomer.fullname || ''}
                                        onChange={handleChange}
                                        className="border-2 border-gray-300 rounded-lg px-4 py-2.5 w-full focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] focus:border-[#1E3A8A] transition-all text-sm"
                                    />
                                </div>

                                <div className="flex flex-col">
                                    <label className="text-sm font-semibold text-gray-700 mb-2">Tên đăng nhập</label>
                                    <input
                                        type="text"
                                        name="username"
                                        value={updatedCustomer.username || ''}
                                        onChange={handleChange}
                                        className="border-2 border-gray-300 rounded-lg px-4 py-2.5 w-full focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] focus:border-[#1E3A8A] transition-all text-sm"
                                    />
                                </div>
                                <div className="flex flex-col">
                                    <label className="text-sm font-semibold text-gray-700 mb-2">Số điện thoại</label>
                                    <input
                                        type="text"
                                        name="phone"
                                        value={updatedCustomer.phone || ''}
                                        onChange={handleChange}
                                        className="border-2 border-gray-300 rounded-lg px-4 py-2.5 w-full focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] focus:border-[#1E3A8A] transition-all text-sm"
                                    />
                                </div>

                                <div className="flex flex-col">
                                    <label className="text-sm font-semibold text-gray-700 mb-2">Email</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={updatedCustomer.email || ''}
                                        onChange={handleChange}
                                        className="border-2 border-gray-300 rounded-lg px-4 py-2.5 w-full focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] focus:border-[#1E3A8A] transition-all text-sm"
                                    />
                                </div>
                                <div className="flex flex-col">
                                    <label className="text-sm font-semibold text-gray-700 mb-2">Ngày sinh</label>
                                    <input
                                        type="date"
                                        name="birthdate"
                                        value={updatedCustomer.birthdate || ''}
                                        onChange={handleChange}
                                        className="border-2 border-gray-300 rounded-lg px-4 py-2.5 w-full focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] focus:border-[#1E3A8A] transition-all text-sm bg-white"
                                    />
                                </div>

                                <div className="flex flex-col col-span-2">
                                    <label className="text-sm font-semibold text-gray-700 mb-2">Giới tính</label>
                                    <select
                                        name="gender"
                                        value={updatedCustomer.gender || 0}
                                        onChange={handleChange}
                                        className="border-2 border-gray-300 rounded-lg px-4 py-2.5 w-full focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] focus:border-[#1E3A8A] transition-all text-sm bg-white"
                                    >
                                        <option value={0}>Nam</option>
                                        <option value={1}>Nữ</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Quản lý địa chỉ */}
                        <div>
                            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 mb-6 border-l-4 border-[#1E3A8A]">
                                <h3 className="text-lg font-bold text-[#1E3A8A] flex items-center">
                                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                    </svg>
                                    Quản lý địa chỉ
                                </h3>
                            </div>

                            {/* Thêm địa chỉ mới */}
                            <div className="bg-gray-50 rounded-xl p-4 mb-4 border-2 border-dashed border-gray-300">
                                <div className="grid grid-cols-3 gap-3 mb-3">
                                    <div className="flex flex-col">
                                        <label className="text-xs font-semibold text-gray-700 mb-1">Tỉnh/Thành</label>
                                        <select
                                            name="provinceId"
                                            value={newAddress.provinceId}
                                            onChange={(e) => { handleAddressChange(e); fetchDistricts(e.target.value); }}
                                            className="border-2 border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] focus:border-[#1E3A8A] transition-all bg-white"
                                        >
                                            <option value="">Chọn tỉnh/thành</option>
                                            {provinces.map(province => (
                                                <option key={province.ProvinceID} value={province.ProvinceID}>{province.ProvinceName}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="flex flex-col">
                                        <label className="text-xs font-semibold text-gray-700 mb-1">Quận/Huyện</label>
                                        <select
                                            name="districtId"
                                            value={newAddress.districtId}
                                            onChange={(e) => { handleAddressChange(e); fetchWards(e.target.value); }}
                                            className="border-2 border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] focus:border-[#1E3A8A] transition-all bg-white"
                                        >
                                            <option value="">Chọn quận/huyện</option>
                                            {districts.map(district => (
                                                <option key={district.DistrictID} value={district.DistrictID}>{district.DistrictName}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="flex flex-col">
                                        <label className="text-xs font-semibold text-gray-700 mb-1">Phường/Xã</label>
                                        <select
                                            name="wardId"
                                            value={newAddress.wardId}
                                            onChange={handleAddressChange}
                                            className="border-2 border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] focus:border-[#1E3A8A] transition-all bg-white"
                                        >
                                            <option value="">Chọn phường/xã</option>
                                            {wards.map(ward => (
                                                <option key={ward.WardCode} value={ward.WardCode}>{ward.WardName}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <input
                                    type="text"
                                    name="addressDetail"
                                    value={newAddress.addressDetail}
                                    onChange={handleAddressChange}
                                    className="border-2 border-gray-300 rounded-lg px-4 py-2 w-full mb-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] focus:border-[#1E3A8A] transition-all"
                                    placeholder="Nhập địa chỉ chi tiết (số nhà, tên đường...)"
                                />

                                <button
                                    className="w-full bg-gradient-to-r from-[#1E3A8A] to-[#2563EB] text-white px-4 py-2.5 rounded-lg font-semibold hover:from-[#163172] hover:to-[#1E3A8A] transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center"
                                    onClick={handleAddAddress}
                                >
                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                    </svg>
                                    Thêm địa chỉ mới
                                </button>
                            </div>

                            {/* Danh sách địa chỉ */}
                            <div className="space-y-3 max-h-[300px] overflow-y-auto">
                                {addresses && addresses.length > 0 ? (
                                    addresses.map((address) => (
                                        <div key={address?.id} className="bg-white border-2 border-gray-200 rounded-lg p-4 hover:border-[#1E3A8A] transition-all shadow-sm">
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <div className="text-sm font-semibold text-gray-800 mb-1">
                                                        {address?.addressDetail || 'Địa chỉ chi tiết không có'}
                                                    </div>
                                                    <div className="text-xs text-gray-600">
                                                        {[address?.wardName, address?.districtName, address?.provinceName]
                                                            .filter(Boolean)
                                                            .join(', ')}
                                                    </div>
                                                </div>
                                                <button
                                                    className="ml-3 text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-all flex items-center"
                                                    onClick={() => handleRemoveAddress(address.id)}
                                                    title="Xóa địa chỉ"
                                                >
                                                    <FaTrashAlt className="text-sm" />
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                                        <svg className="w-12 h-12 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                        <p className="text-sm">Chưa có địa chỉ nào</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end space-x-4 mt-8 pt-6 border-t-2 border-gray-200">
                        <button
                            onClick={() => setUpdateModal(false)}
                            className="px-8 py-3 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-xl font-semibold hover:from-gray-200 hover:to-gray-300 transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105"
                        >
                            Hủy
                        </button>
                        <button
                            onClick={handleUpdate}
                            className="px-8 py-3 bg-gradient-to-r from-[#1E3A8A] to-[#2563EB] text-white rounded-xl font-semibold hover:from-[#163172] hover:to-[#1E3A8A] transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                        >
                            Cập nhật
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UpdateModal;