import api from './api';

export const fetchPorts = (params = {}) =>
    api.get('/ports/', { params }).then(r => r.data);

export const fetchPort = (id) =>
    api.get(`/ports/${id}/`).then(r => r.data);

export const fetchPortCongestion = () =>
    api.get('/ports/congestion/').then(r => r.data);

export const fetchVoyages = (params = {}) =>
    api.get('/voyages/', { params }).then(r => r.data);

export const fetchSafetyEvents = (params = {}) =>
    api.get('/safety-events/', { params }).then(r => r.data);
