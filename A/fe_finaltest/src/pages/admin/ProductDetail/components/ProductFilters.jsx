import React from "react";
import Select from "react-select";
import Slider from "rc-slider";
import "rc-slider/assets/index.css";
import { AiOutlineSearch } from "react-icons/ai";

const ProductFilters = ({
  filters,
  search,
  handlePriceChange,
  handleSearchChange,
  handleFilterChange,
  collars,
  sleeves,
  colors,
  sizes,
  minPrice,
  maxPrice,
}) => {
  const customSelectStyles = {
    control: (base, state) => ({
      ...base,
      borderColor: state.isFocused ? '#1E3A8A' : '#D1D5DB',
      boxShadow: state.isFocused ? '0 0 0 1px #1E3A8A' : 'none',
      '&:hover': {
        borderColor: '#1E3A8A',
      },
    }),
    multiValue: (base) => ({
      ...base,
      backgroundColor: '#DBEAFE',
    }),
    multiValueLabel: (base) => ({
      ...base,
      color: '#1E3A8A',
      fontWeight: '500',
    }),
    multiValueRemove: (base) => ({
      ...base,
      color: '#1E3A8A',
      '&:hover': {
        backgroundColor: '#1E3A8A',
        color: 'white',
      },
    }),
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-gray-200">
      <h3 className="text-lg font-semibold text-[#1E3A8A] mb-4 flex items-center">
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
        </svg>
        Bộ lọc tìm kiếm
      </h3>

      <div className="space-y-4">
        {/* Hàng 1: Ô tìm kiếm & Khoảng giá */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Ô tìm kiếm */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tìm kiếm sản phẩm
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Nhập mã hoặc tên sản phẩm..."
                value={search}
                onChange={handleSearchChange}
                className="border border-gray-300 rounded-lg px-4 py-2.5 w-full pl-10 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent transition-all"
              />
              <AiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
            </div>
          </div>

          {/* Khoảng giá */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Khoảng giá
            </label>
            <div className="px-4 py-3 border border-gray-300 rounded-lg bg-gray-50">
              <div className="flex justify-between text-sm font-medium text-[#1E3A8A] mb-2">
                <span>{filters.minPrice.toLocaleString()} đ</span>
                <span>{filters.maxPrice.toLocaleString()} đ</span>
              </div>
              <Slider
                range
                min={0}
                max={10000000}
                step={10000}
                value={[filters.minPrice, filters.maxPrice]}
                defaultValue={[0, 10000000]}
                onChange={(value) => {
                  handlePriceChange("minPrice", value[0]);
                  handlePriceChange("maxPrice", value[1]);
                }}
                trackStyle={[{ backgroundColor: "#1E3A8A" }]}
                handleStyle={[
                  { borderColor: "#1E3A8A", backgroundColor: "#1E3A8A" },
                  { borderColor: "#1E3A8A", backgroundColor: "#1E3A8A" },
                ]}
                railStyle={{ backgroundColor: "#E5E7EB" }}
              />
            </div>
          </div>
        </div>

        {/* Hàng 2: Các bộ lọc */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cổ áo
            </label>
            <Select
              name="collarId"
              options={collars.map((collar) => ({
                value: collar.id,
                label: collar.name,
              }))}
              isMulti
              onChange={(selectedOptions) =>
                handleFilterChange("collarIds", selectedOptions)
              }
              styles={customSelectStyles}
              className="text-sm"
              placeholder="Chọn kiểu cổ áo"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tay áo
            </label>
            <Select
              name="sleeveId"
              options={sleeves.map((sleeve) => ({
                value: sleeve.id,
                label: sleeve.sleeveName,
              }))}
              isMulti
              onChange={(selectedOptions) =>
                handleFilterChange("sleeveIds", selectedOptions)
              }
              styles={customSelectStyles}
              className="text-sm"
              placeholder="Chọn kiểu tay áo"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Màu sắc
            </label>
            <Select
              name="colorId"
              options={colors.map((color) => ({
                value: color.id,
                label: color.name,
              }))}
              isMulti
              onChange={(selectedOptions) =>
                handleFilterChange("colorIds", selectedOptions)
              }
              styles={customSelectStyles}
              className="text-sm"
              placeholder="Chọn màu sắc"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Kích thước
            </label>
            <Select
              name="sizeId"
              options={sizes.map((size) => ({
                value: size.id,
                label: size.name,
              }))}
              isMulti
              onChange={(selectedOptions) =>
                handleFilterChange("sizeIds", selectedOptions)
              }
              styles={customSelectStyles}
              className="text-sm"
              placeholder="Chọn kích thước"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductFilters;
