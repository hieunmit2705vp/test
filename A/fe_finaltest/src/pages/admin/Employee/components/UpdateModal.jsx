import React, { useState, useRef, useEffect } from 'react';
import EmployeeService from "../../../../services/EmployeeService";
import UploadFileService from '../../../../services/UploadFileService';
import { toast } from 'react-toastify';
import ConfirmModal from './ConfirmModal';

const UpdateModal = ({ isOpen, setUpdateModal, employee, fetchEmployees }) => {
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [updatedEmployee, setUpdatedEmployee] = useState(employee || {});
    const [avatar, setAvatar] = useState(employee?.photo || null);
    const fileInputRef = useRef(null);

    useEffect(() => {
        if (employee) {
            setUpdatedEmployee({
                ...employee,
                roleId: employee.role?.id || 2,
                photo: employee.photo || null,
            });
            setAvatar(employee.photo || null);
        }
    }, [employee]);

    const handleAvatarUpload = async (file) => {
        if (!file) return;

        const localImageUrl = URL.createObjectURL(file);
        setAvatar(localImageUrl);

        try {
            const uploadedImageUrl = await UploadFileService.uploadProductImage(file);
            setUpdatedEmployee(prev => ({ ...prev, photo: uploadedImageUrl }));
            toast.success("Tải ảnh thành công!");
        } catch (error) {
            console.error("Lỗi khi tải ảnh lên:", error);
            toast.error("Không thể tải ảnh lên!");
        }
    };


    const handleDoubleClick = () => fileInputRef.current.click();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setUpdatedEmployee(prev => ({ ...prev, [name]: value }));
    };

    const handleUpdate = async () => {
        try {
            const response = await EmployeeService.update(employee.id, updatedEmployee);
            toast.success("Cập nhật nhân viên thành công!");
            fetchEmployees();
            setUpdateModal(false);
        } catch (error) {
            console.error("Lỗi khi cập nhật:", error);
            toast.error(error?.response?.data?.message || "Không thể cập nhật nhân viên!");
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="bg-gradient-to-r from-[#1E3A8A] via-[#2563EB] to-[#1E3A8A] px-8 py-6 rounded-t-2xl relative overflow-hidden">
                    <div className="absolute inset-0 bg-white opacity-5"></div>
                    <h2 className="text-3xl font-bold text-white text-center relative z-10">
                        Cập nhật nhân viên
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
                    {/* Avatar Section */}
                    <div className="flex flex-col items-center mb-6">
                        <div className="relative group">
                            <div
                                className="w-32 h-32 rounded-full border-4 border-[#1E3A8A] overflow-hidden cursor-pointer transition-all duration-300 hover:border-[#2563EB] hover:shadow-xl"
                                onDoubleClick={handleDoubleClick}
                            >
                                {avatar ? (
                                    <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-indigo-100">
                                        <svg className="w-16 h-16 text-[#1E3A8A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                    </div>
                                )}
                            </div>
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 rounded-full flex items-center justify-center transition-all duration-300">
                                <svg className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            </div>
                        </div>
                        <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={(e) => handleAvatarUpload(e.target.files[0])} />
                        <p className="text-sm text-gray-500 mt-2">Double-click để thay đổi ảnh</p>
                    </div>

                    {/* Form Fields */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col">
                            <label className="text-sm font-semibold text-gray-700 mb-2">Tên nhân viên</label>
                            <input
                                type="text"
                                name="fullname"
                                value={updatedEmployee.fullname || ''}
                                onChange={handleChange}
                                className="border-2 border-gray-300 rounded-lg px-4 py-2.5 w-full focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] focus:border-[#1E3A8A] transition-all text-sm"
                            />
                        </div>
                        <div className="flex flex-col">
                            <label className="text-sm font-semibold text-gray-700 mb-2">Tên đăng nhập</label>
                            <input
                                type="text"
                                name="username"
                                value={updatedEmployee.username || ''}
                                readOnly
                                className="border-2 border-gray-200 bg-gray-50 rounded-lg px-4 py-2.5 w-full text-sm text-gray-500 cursor-not-allowed"
                            />
                        </div>

                        <div className="flex flex-col">
                            <label className="text-sm font-semibold text-gray-700 mb-2">Email</label>
                            <input
                                type="email"
                                name="email"
                                value={updatedEmployee.email || ''}
                                onChange={handleChange}
                                className="border-2 border-gray-300 rounded-lg px-4 py-2.5 w-full focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] focus:border-[#1E3A8A] transition-all text-sm"
                            />
                        </div>
                        <div className="flex flex-col">
                            <label className="text-sm font-semibold text-gray-700 mb-2">Số điện thoại</label>
                            <input
                                type="text"
                                name="phone"
                                value={updatedEmployee.phone || ''}
                                onChange={handleChange}
                                className="border-2 border-gray-300 rounded-lg px-4 py-2.5 w-full focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] focus:border-[#1E3A8A] transition-all text-sm"
                            />
                        </div>

                        <div className="flex flex-col">
                            <label className="text-sm font-semibold text-gray-700 mb-2">Vai trò</label>
                            <select
                                name="roleId"
                                value={updatedEmployee.roleId || 2}
                                onChange={(e) => setUpdatedEmployee(prev => ({
                                    ...prev,
                                    roleId: e.target.value
                                }))}
                                className="border-2 border-gray-300 rounded-lg px-4 py-2.5 w-full focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] focus:border-[#1E3A8A] transition-all text-sm bg-white"
                            >
                                <option value="2">Nhân viên</option>
                                <option value="1">Quản trị</option>
                            </select>
                        </div>
                        <div className="flex flex-col">
                            <label className="text-sm font-semibold text-gray-700 mb-2">Giới tính</label>
                            <select
                                name="gender"
                                value={updatedEmployee.gender !== undefined ? updatedEmployee.gender : true}
                                onChange={handleChange}
                                className="border-2 border-gray-300 rounded-lg px-4 py-2.5 w-full focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] focus:border-[#1E3A8A] transition-all text-sm bg-white"
                            >
                                <option value={true}>Nam</option>
                                <option value={false}>Nữ</option>
                            </select>
                        </div>

                        <div className="flex flex-col col-span-2">
                            <label className="text-sm font-semibold text-gray-700 mb-2">Địa chỉ</label>
                            <input
                                type="text"
                                name="address"
                                value={updatedEmployee.address || ''}
                                onChange={handleChange}
                                className="border-2 border-gray-300 rounded-lg px-4 py-2.5 w-full focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] focus:border-[#1E3A8A] transition-all text-sm"
                            />
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