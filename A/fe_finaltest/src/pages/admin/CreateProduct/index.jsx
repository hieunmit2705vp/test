import React, { useState, useEffect } from "react";
import { FaInfoCircle } from "react-icons/fa";
import Select from "react-select";
import CreatableSelect from "react-select/creatable";
import ProductVariants from "./components/ProductVariants";
import ProductService from "../../../services/ProductService";
import ProductDetailService from "../../../services/ProductDetailService";
import CollarService from "../../../services/CollarService";
import SleeveService from "../../../services/SleeveService";
import ColorService from "../../../services/ColorService";
import SizeService from "../../../services/SizeService";
import PromotionService from "../../../services/PromotionServices";

export default function CreateProduct() {
  const [products, setProducts] = useState([]);
  const [collars, setCollars] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [colors, setColors] = useState([]);
  const [sleeves, setSleeves] = useState([]);
  const [promotions, setPromotions] = useState([]);

  const [generateData, setGenerateData] = useState({
    productId: null,
    sizeId: [],
    colorId: [],
    collarId: [],
    sleeveId: [],
    promotionId: null,
    importPrice: "",
    salePrice: "",
    quantity: "",
    description: "",
  });

  useEffect(() => {
    fetchSelectOptions();
  }, []);

  const fetchSelectOptions = async () => {
    try {
      const productData = await ProductService.getAllProducts(0, 1000);
      setProducts(productData.content);

      const collarData = await CollarService.getAllCollars();
      setCollars(collarData.content);

      const sizeData = await SizeService.getAllSizes();
      setSizes(sizeData.content);

      const colorData = await ColorService.getAllColors();
      setColors(colorData.content);

      const sleeveData = await SleeveService.getAllSleeves();
      setSleeves(sleeveData.content);

      const promotionData = await PromotionService.getAllPromotions();
      const today = new Date();
      const validPromotions = promotionData.content.filter((promotion) => {
        const end = new Date(promotion.endDate);
        return promotion.status === true && end >= today;
      });
      setPromotions(validPromotions);
    } catch (error) {
      console.error("Error fetching select options:", error);
    }
  };

  const handleSelectChange = (name, selectedOption) => {
    const newGenerateData = { ...generateData };

    if (name === "product") {
      newGenerateData.productId = selectedOption ? selectedOption.value : null;
    } else if (name === "collar") {
      newGenerateData.collarId = selectedOption
        ? selectedOption.map((opt) => opt.value)
        : [];
    } else if (name === "sleeve") {
      newGenerateData.sleeveId = selectedOption
        ? selectedOption.map((opt) => opt.value)
        : [];
    } else if (name === "color") {
      newGenerateData.colorId = selectedOption
        ? selectedOption.map((opt) => opt.value)
        : [];
    } else if (name === "size") {
      newGenerateData.sizeId = selectedOption
        ? selectedOption.map((opt) => opt.value)
        : [];
    } else if (name === "promotion") {
      newGenerateData.promotionId = selectedOption
        ? selectedOption.value
        : null;
    }

    setGenerateData(newGenerateData);
  };

  const handleCreateOption = async (name, newOption) => {
    try {
      let createdOption;
      if (name === "collar") {
        createdOption = await CollarService.createCollar({ name: newOption });
        setCollars((prev) => [...prev, createdOption]);
      } else if (name === "sleeve") {
        createdOption = await SleeveService.createSleeve({ name: newOption });
        setSleeves((prev) => [...prev, createdOption]);
      } else if (name === "color") {
        createdOption = await ColorService.createColor({ name: newOption });
        setColors((prev) => [...prev, createdOption]);
      } else if (name === "size") {
        createdOption = await SizeService.createSize({ name: newOption });
        setSizes((prev) => [...prev, createdOption]);
      }
      fetchSelectOptions();
      return createdOption;
    } catch (error) {
      console.error("Error creating new option:", error);
      throw error;
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setGenerateData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const isFormValid = () => {
    return (
      generateData.productId &&
      generateData.sizeId.length > 0 &&
      generateData.colorId.length > 0 &&
      generateData.collarId.length > 0 &&
      generateData.sleeveId.length > 0
    );
  };

  // Custom styles for React Select
  const customStyles = {
    control: (provided, state) => ({
      ...provided,
      borderRadius: '0.75rem',
      borderColor: state.isFocused ? '#1E3A8A' : '#D1D5DB',
      boxShadow: state.isFocused ? '0 0 0 2px #1E3A8A' : 'none',
      padding: '2px',
      '&:hover': {
        borderColor: '#1E3A8A'
      }
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected ? '#1E3A8A' : state.isFocused ? '#DBEAFE' : 'white',
      color: state.isSelected ? 'white' : '#374151',
    }),
    multiValue: (provided) => ({
      ...provided,
      backgroundColor: '#DBEAFE',
      borderRadius: '0.375rem',
    }),
    multiValueLabel: (provided) => ({
      ...provided,
      color: '#1E3A8A',
      fontWeight: '500',
    }),
    multiValueRemove: (provided) => ({
      ...provided,
      color: '#1E3A8A',
      ':hover': {
        backgroundColor: '#1E3A8A',
        color: 'white',
      },
    }),
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 font-sans">
      <div className="max-w-[1600px] mx-auto">
        <h1 className="text-3xl font-extrabold text-[#1E3A8A] mb-8 border-b-2 border-[#1E3A8A] pb-2 inline-block">
          Tạo Sản Phẩm Chi Tiết
        </h1>

        <div className="grid grid-cols-5 gap-6">
          {/* Thuộc tính sản phẩm */}
          <div className="col-span-2 p-6 border border-gray-100 rounded-xl bg-white shadow-md">
            <h2 className="text-xl font-bold text-[#1E3A8A] mb-6 pb-2 border-b border-gray-200">
              Thuộc Tính Sản Phẩm
            </h2>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Tên sản phẩm <span className="text-red-500">*</span>
                </label>
                <Select
                  name="product"
                  options={products.map((product) => ({
                    value: product.id,
                    label: product.productName,
                  }))}
                  isClearable
                  placeholder="Chọn sản phẩm..."
                  onChange={(selectedOption) =>
                    handleSelectChange("product", selectedOption)
                  }
                  styles={customStyles}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Cổ áo <span className="text-red-500">*</span>
                  </label>
                  <CreatableSelect
                    name="collar"
                    options={collars.map((collar) => ({
                      value: collar.id,
                      label: collar.name,
                    }))}
                    value={collars
                      .filter((collar) =>
                        generateData.collarId.includes(collar.id)
                      )
                      .map((collar) => ({
                        value: collar.id,
                        label: collar.name,
                      }))}
                    isMulti
                    onChange={(selectedOption) =>
                      handleSelectChange("collar", selectedOption)
                    }
                    onCreateOption={(newOption) =>
                      handleCreateOption("collar", newOption)
                    }
                    placeholder="Chọn hoặc tạo..."
                    styles={customStyles}
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Tay áo <span className="text-red-500">*</span>
                  </label>
                  <CreatableSelect
                    name="sleeve"
                    options={sleeves.map((sleeve) => ({
                      value: sleeve.id,
                      label: sleeve.sleeveName,
                    }))}
                    value={sleeves
                      .filter((sleeve) =>
                        generateData.sleeveId.includes(sleeve.id)
                      )
                      .map((sleeve) => ({
                        value: sleeve.id,
                        label: sleeve.sleeveName,
                      }))}
                    isMulti
                    onChange={(selectedOption) =>
                      handleSelectChange("sleeve", selectedOption)
                    }
                    onCreateOption={(newOption) =>
                      handleCreateOption("sleeve", newOption)
                    }
                    placeholder="Chọn hoặc tạo..."
                    styles={customStyles}
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Màu sắc <span className="text-red-500">*</span>
                  </label>
                  <CreatableSelect
                    name="color"
                    options={colors.map((color) => ({
                      value: color.id,
                      label: color.name,
                    }))}
                    value={colors
                      .filter((color) => generateData.colorId.includes(color.id))
                      .map((color) => ({ value: color.id, label: color.name }))}
                    isMulti
                    onChange={(selectedOption) =>
                      handleSelectChange("color", selectedOption)
                    }
                    onCreateOption={(newOption) =>
                      handleCreateOption("color", newOption)
                    }
                    placeholder="Chọn hoặc tạo..."
                    styles={customStyles}
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Kích thước <span className="text-red-500">*</span>
                  </label>
                  <CreatableSelect
                    name="size"
                    options={sizes.map((size) => ({
                      value: size.id,
                      label: size.name,
                    }))}
                    value={sizes
                      .filter((size) => generateData.sizeId.includes(size.id))
                      .map((size) => ({ value: size.id, label: size.name }))}
                    isMulti
                    onChange={(selectedOption) =>
                      handleSelectChange("size", selectedOption)
                    }
                    onCreateOption={(newOption) =>
                      handleCreateOption("size", newOption)
                    }
                    placeholder="Chọn hoặc tạo..."
                    styles={customStyles}
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Khuyến mãi
                  </label>
                  <Select
                    name="promotion"
                    options={promotions.map((promotion) => ({
                      value: promotion.id,
                      label: `${promotion.promotionName} - ${promotion.promotionPercent}%`,
                    }))}
                    isClearable
                    placeholder="Chọn khuyến mãi..."
                    value={
                      generateData.promotionId
                        ? promotions
                          .filter(
                            (promotion) =>
                              generateData.promotionId === promotion.id
                          )
                          .map((promotion) => ({
                            value: promotion.id,
                            label: `${promotion.promotionName} - ${promotion.promotionPercent}%`,
                          }))
                        : null
                    }
                    onChange={(selectedOption) =>
                      handleSelectChange("promotion", selectedOption)
                    }
                    styles={customStyles}
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Số lượng <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="quantity"
                    value={generateData.quantity}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent transition-all duration-300 shadow-sm text-gray-700 bg-gray-50 hover:bg-white"
                    placeholder="Nhập số lượng..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Giá nhập <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="importPrice"
                    value={generateData.importPrice}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent transition-all duration-300 shadow-sm text-gray-700 bg-gray-50 hover:bg-white"
                    placeholder="Nhập giá nhập..."
                    step={10000}
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Giá bán <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="salePrice"
                    value={generateData.salePrice}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent transition-all duration-300 shadow-sm text-gray-700 bg-gray-50 hover:bg-white"
                    placeholder="Nhập giá bán..."
                    step={10000}
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Mô tả
                  </label>
                  <textarea
                    name="description"
                    value={generateData.description}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent transition-all duration-300 shadow-sm text-gray-700 bg-gray-50 hover:bg-white resize-none"
                    placeholder="Nhập mô tả sản phẩm..."
                    maxLength={500}
                    rows={3}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Biến thể sản phẩm */}
          {isFormValid() ? (
            <div className="col-span-3 bg-white border border-gray-100 rounded-xl shadow-md">
              <ProductVariants generateData={generateData} />
            </div>
          ) : (
            <div className="col-span-3 p-8 border border-gray-100 rounded-xl bg-white shadow-md flex flex-col items-center justify-center text-center">
              <div className="w-24 h-24 flex items-center justify-center bg-blue-50 rounded-full mb-4">
                <FaInfoCircle className="text-5xl text-[#1E3A8A]" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Chưa đủ thông tin
              </h3>
              <p className="text-gray-600 max-w-md">
                Vui lòng chọn đầy đủ các thuộc tính bắt buộc (Sản phẩm, Cổ áo, Tay áo, Màu sắc, Kích thước) để hiển thị biến thể sản phẩm.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
