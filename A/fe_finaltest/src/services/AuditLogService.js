import api from "../ultils/api";

const API_URL = "/api/audit-logs";

const AuditLogService = {
    getAllLogs: async (params) => {
        try {
            const response = await api.get(API_URL, { params });
            return response.data;
        } catch (error) {
            console.error("Error fetching audit logs:", error);
            throw error;
        }
    },
};

export default AuditLogService;
