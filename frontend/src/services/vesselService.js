import api from "./api";

// Fetch all vessels with optional filters
export const fetchVessels = async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.name) params.append("name", filters.name);
    if (filters.type) params.append("type", filters.type);
    if (filters.flag) params.append("flag", filters.flag);
    if (filters.cargo_type) params.append("cargo_type", filters.cargo_type);
    const response = await api.get(`/vessels/?${params.toString()}`);
    return response.data;
};

// Fetch a single vessel by ID
export const fetchVessel = async (id) => {
    const response = await api.get(`/vessels/${id}/`);
    return response.data;
};

// Fetch events for a vessel
export const fetchVesselEvents = async (id) => {
    const response = await api.get(`/vessels/${id}/events/`);
    return response.data;
};

// Subscribe to a vessel
export const subscribeVessel = async (id) => {
    const response = await api.post(`/vessels/${id}/subscribe/`);
    return response.data;
};

// Unsubscribe from a vessel
export const unsubscribeVessel = async (id) => {
    const response = await api.delete(`/vessels/${id}/subscribe/`);
    return response.data;
};

// Get current user's subscriptions
export const fetchSubscriptions = async () => {
    try {
        const response = await api.get(`/vessels/subscriptions/`);
        return response.data;
    } catch (_error) {
        // Return empty array if not authenticated or endpoint fails
        return [];
    }
};
