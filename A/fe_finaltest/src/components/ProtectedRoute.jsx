import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

/**
 * ProtectedRoute - Wrapper component để bảo vệ các routes yêu cầu authentication
 * Sử dụng cho: cart, payment, personal page, order, etc.
 */
function ProtectedRoute({ children }) {
    const { isLoggedIn } = useSelector((state) => state.user);

    if (!isLoggedIn) {
        // Redirect tới login nếu chưa đăng nhập
        return <Navigate to="/login" replace />;
    }

    return children;
}

export default ProtectedRoute;
