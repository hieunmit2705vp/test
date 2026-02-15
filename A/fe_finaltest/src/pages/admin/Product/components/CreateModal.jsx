import React, { useEffect, useState } from "react";
import Modal from "react-modal";
import Select from 'react-select';
import BrandService from "../../../../services/BrandService";
import CategoryService from "../../../../services/CategoryService";
import MaterialService from "../../../../services/MaterialService";

Modal.setAppElement("#root");

const CreateModal = ({ isVisible, onConfirm, onCancel }) => {
    const [brandOptions, setBrandOptions] = useState([]);
    const [categoryOptions, setCategoryOptions] = useState([]);
    const [materialOptions, setMaterialOptions] = useState([]);
    const [newProduct, setNewProduct] = useState({
        brandId: '',
        categoryId: '',
        materialId: '',
        productName: ''
    });

    useEffect(() => {
        const fetchOptions = async () => {
            try {
                const brands = await BrandService.getAllBrands();
                setBrandOptions(brands.content.map(brand => ({ value: brand.id, label: brand.brandName })));

                const categories = await CategoryService.getAll();
                setCategoryOptions(categories.content.map(category => ({ value: category.id, label: category.name })));

                const materials = await MaterialService.getAllMaterials();
                setMaterialOptions(materials.content.map(material => ({ value: material.id, label: material.materialName })));
            } catch (error) {
                console.error("Error fetching options:", error);
            }
        };

        fetchOptions();
    }, []);

    useEffect(() => {
        if (isVisible) {
            setNewProduct({
                brandId: '',
                categoryId: '',
                materialId: '',
                productName: '',
                productCode: ''
            });
        }
    }, [isVisible]);

    // Custom styles for React Select
    const customStyles = {
        control: (provided, state) => ({
            ...provided,
            borderRadius: '0.75rem', // rounded-xl
            borderColor: state.isFocused ? '#1E3A8A' : '#D1D5DB', // blue-900 or gray-300
            boxShadow: state.isFocused ? '0 0 0 2px #1E3A8A' : 'none',
            padding: '2px',
            '&:hover': {
                borderColor: '#1E3A8A'
            }
        }),
        option: (provided, state) => ({
            ...provided,
            backgroundColor: state.isSelected ? '#1E3A8A' : state.isFocused ? '#DBEAFE' : 'white', // blue-900 or blue-100
            color: state.isSelected ? 'white' : '#374151',
        })
    };

    return (
        <Modal
            isOpen={isVisible}
            onRequestClose={onCancel}
            contentLabel="Thêm Sản Phẩm"
            className="bg-white p-8 rounded-2xl shadow-2xl max-w-lg mx-auto mt-20 outline-none transform transition-all"
            overlayClassName="fixed inset-0 bg-black bg-opacity-60 flex items-start justify-center pt-10 z-50 backdrop-blur-sm"
        >
            <div className="text-center">
                <h2 className="text-2xl font-bold mb-6 text-[#1E3A8A] uppercase tracking-wide">
                    Thêm Sản Phẩm Mới
                </h2>

                <div className="text-left space-y-4">
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2 ml-1">
                            Tên sản phẩm <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent transition-all duration-300 shadow-sm text-gray-700 bg-gray-50 hover:bg-white"
                            value={newProduct.productName}
                            onChange={(e) => setNewProduct({ ...newProduct, productName: e.target.value })}
                            placeholder="Nhập tên sản phẩm..."
                        />
                    </div>

                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2 ml-1">
                            Thương hiệu <span className="text-red-500">*</span>
                        </label>
                        <Select
                            options={brandOptions}
                            value={brandOptions.find(option => option.value === newProduct.brandId) || null}
                            onChange={(selected) => setNewProduct({ ...newProduct, brandId: selected?.value || '' })}
                            placeholder="Chọn thương hiệu..."
                            styles={customStyles}
                        />
                    </div>

                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2 ml-1">
                            Danh mục <span className="text-red-500">*</span>
                        </label>
                        <Select
                            options={categoryOptions}
                            value={categoryOptions.find(option => option.value === newProduct.categoryId) || null}
                            onChange={(selected) => setNewProduct({ ...newProduct, categoryId: selected?.value || '' })}
                            placeholder="Chọn danh mục..."
                            styles={customStyles}
                        />
                    </div>

                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2 ml-1">
                            Chất liệu <span className="text-red-500">*</span>
                        </label>
                        <Select
                            options={materialOptions}
                            value={materialOptions.find(option => option.value === newProduct.materialId) || null}
                            onChange={(selected) => setNewProduct({ ...newProduct, materialId: selected?.value || '' })}
                            placeholder="Chọn chất liệu..."
                            styles={customStyles}
                        />
                    </div>
                </div>

                <div className="flex justify-end gap-3 mt-8">
                    <button
                        className="px-6 py-2.5 rounded-xl text-gray-600 font-medium hover:bg-gray-100 transition-colors duration-300 border border-transparent hover:border-gray-200"
                        onClick={onCancel}
                    >
                        Hủy bỏ
                    </button>
                    <button
                        className="px-6 py-2.5 bg-[#1E3A8A] text-white rounded-xl font-semibold hover:bg-[#163172] transition-all duration-300 shadow-lg hover:shadow-xl transform active:scale-95"
                        onClick={() => onConfirm(newProduct)}
                    >
                        Thêm mới
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default CreateModal;