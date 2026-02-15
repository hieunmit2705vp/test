import React, { useState, useEffect } from "react";
import Modal from "react-modal";
import CollarService from "../../../../../services/CollarService";
import { toast } from "react-toastify";

const UpdateModal = ({ isOpen, setUpdateModal, collar, fetchCollars }) => {
    const [name, setCollarName] = useState("");

    useEffect(() => {
        if (collar) {
            setCollarName(collar.name);
        }
    }, [collar]);

    const handleUpdate = async () => {
        if (!name.trim()) {
            toast.error("Tên Collar không được để trống!");
            return;
        }
        try {
            await CollarService.updateCollar(collar.id, { name });
            toast.success("Cập nhật Collar thành công!");
            fetchCollars();
            setUpdateModal(false);
        } catch (error) {
            console.error("Lỗi khi cập nhật Collar:", error);
            toast.error("Không thể cập nhật Collar. Vui lòng thử lại!");
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={() => setUpdateModal(false)}
            contentLabel="Cập nhật Collar"
            className="bg-white p-8 rounded-2xl shadow-2xl max-w-md mx-auto mt-24 outline-none transform transition-all"
            overlayClassName="fixed inset-0 bg-black bg-opacity-60 flex items-start justify-center pt-20 z-50 backdrop-blur-sm"
        >
            <div className="text-center">
                <h2 className="text-2xl font-bold mb-6 text-[#1E3A8A] uppercase tracking-wide">
                    Cập Nhật Cổ Áo
                </h2>

                <div className="mb-6 text-left">
                    <label className="block text-gray-700 text-sm font-bold mb-2 ml-1">
                        Sửa tên cổ áo <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent transition-all duration-300 shadow-sm text-gray-700 bg-gray-50 hover:bg-white"
                        value={name}
                        onChange={(e) => setCollarName(e.target.value)}
                        placeholder="Nhập tên Collar"
                        autoFocus
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') handleUpdate();
                        }}
                    />
                </div>

                <div className="flex justify-end gap-3 mt-8">
                    <button
                        className="px-6 py-2.5 rounded-xl text-gray-600 font-medium hover:bg-gray-100 transition-colors duration-300 border border-transparent hover:border-gray-200"
                        onClick={() => setUpdateModal(false)}
                    >
                        Hủy bỏ
                    </button>
                    <button
                        className="px-6 py-2.5 bg-[#1E3A8A] text-white rounded-xl font-semibold hover:bg-[#163172] transition-all duration-300 shadow-lg hover:shadow-xl transform active:scale-95"
                        onClick={handleUpdate}
                    >
                        Cập nhật
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default UpdateModal;
