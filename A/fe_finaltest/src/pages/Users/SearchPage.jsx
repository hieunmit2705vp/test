import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import ProductService from "../../services/ProductService";
import { FaSearch, FaShoppingCart } from "react-icons/fa";

const SearchPage = () => {
    const [searchParams] = useSearchParams();
    const query = searchParams.get("query");
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProducts = async () => {
            if (!query) return;

            try {
                setLoading(true);
                const params = { search: query, size: 50 };
                const response = await ProductService.getFilteredProducts(params);
                setProducts(response?.content || []);
            } catch (error) {
                console.error("Lỗi khi tìm kiếm sản phẩm:", error);
                setProducts([]);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, [query]);

    const handleViewProduct = async (productId) => {
        try {
            const productDetails = await ProductService.getProductById(productId);
            if (productDetails && productDetails.productCode) {
                navigate(`/view-product/${productDetails.productCode}`);
            }
        } catch (error) {
            console.error("Lỗi khi xem chi tiết sản phẩm:", error);
        }
    };

    const formatCurrency = (amount) => {
        return amount ? amount.toLocaleString("vi-VN") + "₫" : "Liên hệ";
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#1E3A8A] mx-auto mb-4"></div>
                    <p className="text-gray-600 text-lg">Đang tìm kiếm...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Search Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 bg-[#1E3A8A] rounded-full flex items-center justify-center">
                            <FaSearch className="text-white text-xl" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-extrabold text-gray-900">
                                Kết quả tìm kiếm
                            </h1>
                            <p className="text-gray-600 mt-1">
                                Tìm kiếm cho: <span className="font-semibold text-[#1E3A8A]">"{query}"</span>
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-500">
                            Tìm thấy <span className="font-bold text-[#1E3A8A]">{products.length}</span> sản phẩm
                        </p>
                    </div>
                </div>

                {/* Results Grid */}
                {products.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {products.map((product) => (
                            <div
                                key={product.id}
                                onClick={() => handleViewProduct(product.id)}
                                className="bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer group border border-gray-100 hover:border-[#1E3A8A]"
                            >
                                {/* Product Image */}
                                <div className="relative overflow-hidden aspect-square">
                                    <img
                                        src={product.photo || "https://via.placeholder.com/300"}
                                        alt={product.nameProduct}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                    />
                                    {product.importPrice > product.salePrice && (
                                        <div className="absolute top-2 left-2 bg-red-600 text-white text-xs font-bold py-1 px-2 rounded-full">
                                            -{Math.round(((product.importPrice - product.salePrice) / product.importPrice) * 100)}%
                                        </div>
                                    )}
                                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button className="bg-[#1E3A8A] text-white px-4 py-2 rounded-lg font-semibold shadow-lg hover:bg-blue-800 transition-colors flex items-center gap-2">
                                            <FaShoppingCart /> Xem chi tiết
                                        </button>
                                    </div>
                                </div>

                                {/* Product Info */}
                                <div className="p-4">
                                    <h3 className="font-semibold text-gray-800 text-sm line-clamp-2 mb-2 group-hover:text-[#1E3A8A] transition-colors min-h-[40px]">
                                        {product.nameProduct}
                                    </h3>

                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-[#1E3A8A] font-bold text-lg">
                                                {formatCurrency(product.salePrice)}
                                            </p>
                                            {product.importPrice > product.salePrice && (
                                                <p className="text-gray-400 text-sm line-through">
                                                    {formatCurrency(product.importPrice)}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {product.quantitySaled > 0 && (
                                        <div className="mt-3">
                                            <div className="flex justify-between text-xs text-gray-500 mb-1">
                                                <span>Đã bán</span>
                                                <span className="font-semibold">{product.quantitySaled}</span>
                                            </div>
                                            <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                                                <div
                                                    className="bg-green-500 h-full rounded-full transition-all"
                                                    style={{
                                                        width: `${Math.min((product.quantitySaled / product.quantity) * 100 || 0, 100)}%`,
                                                    }}
                                                ></div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16">
                        <div className="max-w-md mx-auto">
                            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <FaSearch className="text-gray-400 text-4xl" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                Không tìm thấy sản phẩm nào
                            </h2>
                            <p className="text-gray-500 mb-8">
                                Không có kết quả nào phù hợp với "<span className="font-semibold">{query}</span>".
                                Vui lòng thử tìm kiếm với từ khóa khác.
                            </p>
                            <button
                                onClick={() => navigate("/products")}
                                className="px-6 py-3 bg-[#1E3A8A] text-white font-semibold rounded-lg hover:bg-blue-800 transition-colors shadow-md"
                            >
                                Xem tất cả sản phẩm
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SearchPage;
