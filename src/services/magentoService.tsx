import React from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

// Import local data
import customersData from '../assets/data/customers.json';
import productsData from '../assets/data/products.json';
import ordersData from '../assets/data/orders.json';
import invoicesData from '../assets/data/invoices.json';
import categoryData from '../assets/data/category.json';

import directMagentoClient from './directMagentoClient';

/**
 * Settings Persistence Manager
 * Handles persistent storage and retrieval of Magento settings
 */
class SettingsPersistenceManager {
    constructor() {
        this.STORAGE_KEY = 'magento_persistent_settings';
        this.BACKUP_KEY = 'magento_settings_backup';
    // Save settings with timestamp and validation
    saveSettings(settings) {
        try {
            const persistentData = {
                settings,
                timestamp: Date.now(),
                version: '1.0'
            };
            
            // Primary storage
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(persistentData));
            
            // Backup storage
            localStorage.setItem(this.BACKUP_KEY, JSON.stringify(persistentData));
            
            console.log('💾 Magento settings persisted successfully');
            return true;
        } catch(error: any) {
            console.error('❌ Failed to persist settings:', error);
            return false;
    // Load settings with fallback mechanism
    loadSettings() {
        try {
            // Try primary storage first
            let data = localStorage.getItem(this.STORAGE_KEY);
            
            // Fallback to backup if primary fails
            if(!data) {
                data
            if(data) {
                const parsed = JSON.parse(data);
                console.log('📥 Loaded persistent settings:', parsed.timestamp);
                return parsed.settings;
            return null;
        } catch(error: any) {
            console.error('❌ Failed to load persistent settings:', error);
            return null;
    // Clear all persistent data
    clearSettings() {
        try {
            localStorage.removeItem(this.STORAGE_KEY);
            localStorage.removeItem(this.BACKUP_KEY);
            console.log('🗑️ Cleared persistent settings');
        } catch(error: any) {
            console.error('❌ Failed to clear settings:', error);
    // Get settings info
    getSettingsInfo() {
        try {
            const data = localStorage.getItem(this.STORAGE_KEY);
            if(data) {
                const parsed = JSON.parse(data);
                return {
                    exists: true,
                    timestamp: parsed.timestamp,
                    age: Date.now() - parsed.timestamp,
                    version: parsed.version
                };
            return { exists: false };
        } catch(error: any) {
            return { exists: false, error: error.message };
/**
 * Request Cancellation Manager
 * Handles cancellation of ongoing requests when switching modes
 */
class RequestCancellationManager {
    constructor() {
        this.activeRequests = new Map();
        this.abortControllers = new Map();
    // Create a new request with cancellation support
    createCancellableRequest(requestId, requestPromise: any) {
        const abortController = new AbortController();
        this.abortControllers.set(requestId, abortController);
        
        // Wrap the promise to handle cancellation
        const cancellablePromise = new Promise((resolve, reject) => {
            // Handle abort signal
            abortController.signal.addEventListener('abort', () => {
                reject(new Error(`Request ${requestId} was cancelled`));
            });
            
            // Execute the original promise
            requestPromise
                .then(resolve)
                .catch(reject)
                .finally(() => {
                    this.cleanup(requestId);
                });
        });
        
        this.activeRequests.set(requestId, cancellablePromise);
        return cancellablePromise;
    // Cancel all active requests
    cancelAllRequests(reason = 'Service mode changed') {
        console.log(`🚫 Cancelling ${this.activeRequests.size} active requests: ${reason}`);
        
        for([requestId, controller] of this.abortControllers.entries()) {
            try {
                controller.abort(reason);
            } catch(error) {
                console.warn(`Failed to cancel request ${requestId}:`, error);
        this.cleanup();
    // Cancel specific request
    cancelRequest(requestId, reason = 'Cancelled' ) {
        const controller = this.abortControllers.get(requestId);
        if(controller) {
            controller.abort(reason);
            this.cleanup(requestId);
    // Cleanup finished/cancelled requests
    cleanup(requestId = null) {
        if(requestId) {
            this.activeRequests.delete(requestId);
            this.abortControllers.delete(requestId);
        } else {
            this.activeRequests.clear();
            this.abortControllers.clear();
    // Get active requests count
    getActiveRequestsCount() {
        return this.activeRequests.size;
class MagentoService {
    constructor(directConnectionEnabled = false, magentoSettings = null) {
        this.baseURL = '/api/magento';
        this.directConnectionEnabled = directConnectionEnabled;
        this.magentoSettings = magentoSettings;
        
        if(directConnectionEnabled && magentoSettings) {
            // Initialize direct client
            try {
                directMagentoClient.initialize(magentoSettings);
                console.log('✅ Direct Magento client initialized');
            } catch(error: any) {
                console.error('❌ Failed to initialize direct client:', error);
                this.directConnectionEnabled = false;
        this.instance = axios.create({
            baseURL: this.baseURL,
            headers: {
                'Content-Type': 'application/json'
        });
    async get(endpoint, params: any = {}) {
        // Check if direct connection is enabled and settings are available
        if(this.directConnectionEnabled && directMagentoClient?.initialized) {
            try {
                console.log('🔄 Using direct Magento connection for GET:', endpoint);
                return { data: await directMagentoClient.get(endpoint, params?.params || params) };
            } catch(error: any) {
                console.warn('⚠️ Direct connection failed, falling back to proxy:', error.message);
                // Fall back to proxy
        return this.instance.get(endpoint, params);
    async post(endpoint, data = {}, config: any = {}) {
        // Check if direct connection is enabled and settings are available
        if(this.directConnectionEnabled && directMagentoClient?.initialized) {
            try {
                console.log('🔄 Using direct Magento connection for POST:', endpoint);
                return { data: await directMagentoClient.post(endpoint, data) };
            } catch(error: any) {
                console.warn('⚠️ Direct connection failed, falling back to proxy:', error.message);
                // Fall back to proxy
        return this.instance.post(endpoint, data, config);
    async put(endpoint, data = {}, config: any = {}) {
        // Check if direct connection is enabled and settings are available
        if(this.directConnectionEnabled && directMagentoClient?.initialized) {
            try {
                console.log('🔄 Using direct Magento connection for PUT:', endpoint);
                return { data: await directMagentoClient.put(endpoint, data) };
            } catch(error: any) {
                console.warn('⚠️ Direct connection failed, falling back to proxy:', error.message);
                // Fall back to proxy
        return this.instance.put(endpoint, data, config);
    async delete(endpoint, config: any = {}) {
        // Check if direct connection is enabled and settings are available
        if(this.directConnectionEnabled && directMagentoClient?.initialized) {
            try {
                console.log('🔄 Using direct Magento connection for DELETE:', endpoint);
                return { data: await directMagentoClient.delete(endpoint) };
            } catch(error: any) {
                console.warn('⚠️ Direct connection failed, falling back to proxy:', error.message);
                // Fall back to proxy
        return this.instance.delete(endpoint, config);
    // Utility to flatten nested object into URL parameters
    flattenObject(obj, urlParams, prefix = '' ) {
        for(key in obj) {
            if (obj.hasOwnProperty(key)) {
                const value = obj[key];
                const paramKey = prefix ? `${prefix}[${key}]` : key;

                if(value !== null && typeof value === 'object') {
                    if (Array.isArray(value)) {
                        value.forEach((item, index) => {
                            if(typeof item === 'object') {
                                this.flattenObject(item, urlParams, `${paramKey}[${index}]`);
                            } else {
                                urlParams.append(`${paramKey}[${index}]`, item);
                        });
                    } else {
                        this.flattenObject(value, urlParams, paramKey);
                } else {
                    urlParams.append(paramKey, value);
    // Cache management
    async getCachedResponse(url: any) {
        try {
            const cacheKey = this.generateCacheKey(url);
            const cachedData = localStorage.getItem(cacheKey);
            
            if(cachedData) {
                const { data, timestamp } = JSON.parse(cachedData);
                const now = Date.now();
                // Cache for 5 minutes
                if(now - timestamp < 5 * 60 * 1000) {
                    return { data, status: 200, fromCache: true };
                localStorage.removeItem(cacheKey);
            return null;
        } catch(error: any) {
            console.warn('Cache read error:', error);
            return null;
    async setCachedResponse(url, data: any) {
        try {
            const cacheKey = this.generateCacheKey(url);
            localStorage.setItem(cacheKey, JSON.stringify({
                data,
                timestamp: Date.now()
            }));
        } catch(error: any) {
            console.warn('Cache write error:', error);
    generateCacheKey(url: any) {
        // Remove API base URL and clean up the URL for caching
        const cleanUrl = url.replace(this.baseURL, '').replace(/^\/+/, '');
        return `magento_cache_${cleanUrl}`;
    getLocalData(endpoint: any) {
        try {
            // Extract the entity type from the endpoint
            const entityType = endpoint.split('/')[1]; // e.g., 'products', 'orders', etc.
            const localDataMap = {
                products: productsData,
                orders: ordersData,
                customers: customersData,
                invoices: invoicesData,
                categories: categoryData
            };

            return localDataMap[entityType] || null;
        } catch(error: any) {
            console.error('Error getting local data:', error);
            return null;
    clearCache() {
        try {
            // Clear only Magento-related cache items
            Object.keys(localStorage).forEach((key) => {
                if (key.startsWith('magento_cache_')) {
                    localStorage.removeItem(key);
            });
            console.log('🧹 All Magento cache cleared');
        } catch(error: any) {
            console.error('Error clearing cache:', error);
    // Clear direct connection specific cache
    clearDirectCache() {
        try {
            Object.keys(localStorage).forEach((key) => {
                if (key.startsWith('magento_direct_cache_')) {
                    localStorage.removeItem(key);
            });
            
            // Clear direct client cache if available
            if(directMagentoClient?.clearCache) {
                directMagentoClient?.clearCache();
            console.log('🧹 Direct connection cache cleared');
        } catch(error: any) {
            console.error('Error clearing direct cache:', error);
    // Clear proxy connection specific cache
    clearProxyCache() {
        try {
            Object.keys(localStorage).forEach((key) => {
                if (key.startsWith('magento_proxy_cache_') || key.startsWith('magento_cache_')) {
                    localStorage.removeItem(key);
            });
            console.log('🧹 Proxy connection cache cleared');
        } catch(error: any) {
            console.error('Error clearing proxy cache:', error);
    // Save current configuration to localStorage
    saveCurrentConfiguration() {
        try {
            const config = {
                directConnectionEnabled: this.directConnectionEnabled,
                baseURL: this.baseURL,
                timestamp: Date.now()
            };
            localStorage.setItem('magento_service_config', JSON.stringify(config));
        } catch(error: any) {
            console.error('Error saving configuration:', error);
    // Get service status and metrics
    getServiceStatus() {
        return {
            mode: this.directConnectionEnabled ? 'Direct' : 'Proxy',
            baseURL: this.baseURL,
            directClientInitialized: directMagentoClient?.initialized,
            hasAccessToken: !!this.magentoSettings?.accessToken,
            timestamp: new Date().toISOString()
        };
    // Authentication
    async login(username, password, customBaseURL: any = null ) {
        try {
            if(customBaseURL) {
                this.setBaseURL(customBaseURL);
            const response = await this.post('/integration/admin/token', { username, password });
            if(response) {
                // Clear any existing cache when logging in
                this.clearCache();
                localStorage.setItem('adminToken', response);
                return response;
            throw new Error('Invalid response from authentication server');
        } catch(error: any) {
            throw this.handleApiError(error);
    logout() {
        localStorage.removeItem('adminToken');
        toast.success('Logged out successfully');
    // Token Management
    getToken() {
        return localStorage.getItem('adminToken');
    setToken(token: any) {
        localStorage.setItem('adminToken', token);
    // Base URL management
    setBaseURL(newBaseURL: any) {
        if(!newBaseURL) {
            throw new Error('Base URL cannot be empty');
        this.baseURL = newBaseURL;
        if (this.instance?.defaults) this.instance.defaults.baseURL = newBaseURL;
    getBaseURL() {
        return this.baseURL;
    // Enhanced service configuration with intelligent switching and cache management
    updateConfiguration(magentoSettings: any) {
        const wasDirectEnabled = this.directConnectionEnabled;
        this.directConnectionEnabled = magentoSettings.enableDirectConnection;
        this.magentoSettings = magentoSettings;
        
        // If switching from direct to proxy, clear direct connection cache
        if(wasDirectEnabled && !this.directConnectionEnabled) {
            this.clearDirectCache();
            console.log('🧹 Cleared direct connection cache, switching to proxy');
            toast.info('Switched to backend proxy - cache cleared');
        // If enabling direct connection
        if(this.directConnectionEnabled && magentoSettings) {
            try {
                directMagentoClient.initialize(magentoSettings);
                
                // Clear proxy cache when switching to direct
                if(!wasDirectEnabled) {
                    this.clearProxyCache();
                    console.log('🧹 Cleared proxy cache, switching to direct connection');
                console.log('✅ Direct Magento client reconfigured');
                toast.success('🚀 Direct connection to Magento enabled!');
            } catch(error: any) {
                console.error('❌ Failed to reconfigure direct client:', error);
                this.directConnectionEnabled = false;
                toast.error('Failed to enable direct connection: ' + error.message);
        } else if(!this.directConnectionEnabled) {
            console.log('📡 Using backend proxy for Magento API');
            if(wasDirectEnabled) {
                toast.success('🔄 Switched to backend proxy');
            } else {
                toast.info('📡 Using backend proxy for Magento API');
        // Update localStorage with current configuration
        this.saveCurrentConfiguration();
    // Test connection based on current configuration
    async testConnection() {
        if(this.directConnectionEnabled && directMagentoClient?.initialized) {
            return await directMagentoClient.testConnection();
        } else {
            // Test proxy connection
            try {
                const response = await this.get('/store/storeConfigs');
                return {
                    success: true,
                    data: response.data,
                    message: 'Backend proxy connection successful'
                };
            } catch(error: any) {
                throw new Error(`Proxy connection test failed: ${error.message}`);
    // Error Handler
    handleApiError(error: any) {
        console.error('API Error:', error);
        
        if(error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            const status = error.response.status;
            const data = error.response.data;

            switch(status) {
                case 400:
                    toast.error('Invalid request. Please check your input.');
                    break;
                case 401:
                    toast.error('Authentication failed. Please log in again.');
                    this.handleAuthError();
                    break;
                case 403:
                    toast.error('Access denied. You do not have permission to perform this action.');
                    break;
                case 404:
                    toast.error('Resource not found.');
                    break;
                case 500:
                    toast.error('Server error. Please try again later.');
                    break;
                default:
                    toast.error('An error occurred. Please try again.');
            throw {
                message: data.message || 'An error occurred',
                code: data.code || 'API_ERROR',
                originalError: error
            };
        } else if(error.request) {
            // The request was made but no response was received
            toast.error('No response from server. Please check your connection.');
            throw {
                message: 'No response from server',
                code: 'NETWORK_ERROR',
                originalError: error
            };
        } else {
            // Something happened in setting up the request that triggered an Error
            toast.error('Request configuration error.');
            throw {
                message: error.message || 'Request setup error',
                code: 'REQUEST_ERROR',
                originalError: error
            };
    handleAuthError() {
        //localStorage.removeItem('adminToken');
        //localStorage.removeItem('user');
        //window.location.href = '/login';
    async getProducts({ currentPage = 1, pageSize = 20, sortOrders = [], filters: any = [] } = {} ) {
        try {
            // Build query parameters
            const params = {
                currentPage,
                pageSize,
            };

            // Add sort orders if any
            if(sortOrders.length > 0) {
                params.sortOrders = JSON.stringify(sortOrders);
            // Add filters if any
            if(filters.length > 0) {
                params.filters = JSON.stringify(filters);
            const response = await this.get('/products', { params });
            return response.data;
        } catch(error: any) {
            console.error('Error fetching products:', error);
            throw error;
// Create and export a single instance
const magentoService = new MagentoService();
export default magentoService;