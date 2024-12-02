import axios from 'axios';
import { parseString } from 'xml2js';
import { toast } from 'react-toastify';

class CegidApi {
    constructor() {
        this.api = axios.create({
            headers: {
                'Content-Type': 'text/xml;charset=UTF-8',
            },
        });

        // Add request interceptor
        this.api.interceptors.request.use(
            (config) => {
                const sessionToken = localStorage.getItem('cegidSessionToken');
                if (sessionToken) {
                    config.headers['X-Session-Token'] = sessionToken;
                }
                config.headers['Access-Control-Allow-Origin'] = '*';
                config.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS';
                config.headers['Access-Control-Allow-Headers'] = 'Content-Type, X-Session-Token';
                return config;
            },
            (error) => Promise.reject(error)
        );

        // Add response interceptor
        this.api.interceptors.response.use(
            (response) => response,
            (error) => {
                if (error.response) {
                    const faultString = error.response?.data?.match(/<faultstring>(.*?)<\/faultstring>/)?.[1];
                    if (faultString) {
                        toast.error(faultString);
                    } else {
                        toast.error('An error occurred while processing your request');
                    }
                } else if (error.request) {
                    toast.error('Network error. Please check your connection.');
                }
                return Promise.reject(error);
            }
        );
    }

    // SOAP request helpers
    createSoapEnvelope(body) {
        return `<?xml version="1.0" encoding="UTF-8"?>
            <soapenv:Envelope 
                xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
                xmlns:ceg="http://cegid.com/webservices">
                <soapenv:Header/>
                <soapenv:Body>${body}</soapenv:Body>
            </soapenv:Envelope>`;
    }

    async parseSoapResponse(response) {
        return new Promise((resolve, reject) => {
            parseString(response.data, { explicitArray: false }, (err, result) => {
                if (err) {
                    reject(new Error('Failed to parse SOAP response'));
                } else {
                    resolve(result);
                }
            });
        });
    }

    // Authentication
    async handleCegidConnect(url, username, password, database) {
        try {
            if (!url || !username || !password || !database) {
                throw new Error('Missing required credentials');
            }

            this.api.defaults.baseURL = url.endsWith('/') ? url : `${url}/`;

            const authBody = `
                <ceg:Authenticate>
                    <ceg:credentials>
                        <ceg:DatabaseId>${database}</ceg:DatabaseId>
                        <ceg:Login>${username}</ceg:Login>
                        <ceg:Password>${password}</ceg:Password>
                    </ceg:credentials>
                </ceg:Authenticate>`;

            const response = await this.api.post('', this.createSoapEnvelope(authBody), {
                headers: { 'SOAPAction': 'http://cegid.com/webservices/Authenticate' }
            });

            const result = await this.parseSoapResponse(response);
            const sessionToken = result?.['soap:Envelope']?.['soap:Body']?.AuthenticateResponse?.SessionToken;

            if (!sessionToken) {
                throw new Error('No session token in response');
            }

            localStorage.setItem('cegidSessionToken', sessionToken);
            toast.success('Successfully connected to Cegid');
            return { success: true, sessionToken };

        } catch (error) {
            console.error('Cegid connection error:', error);
            toast.error(error.message || 'Failed to connect to Cegid');
            throw error;
        }
    }

    // Data fetching
    async fetchData(action, body) {
        try {
            const response = await this.api.post('', this.createSoapEnvelope(body), {
                headers: { 'SOAPAction': `http://cegid.com/webservices/${action}` }
            });
            return this.parseSoapResponse(response);
        } catch (error) {
            console.error(`Error in ${action}:`, error);
            throw error;
        }
    }

    // Inventory endpoints
    async getStock(itemId) {
        const body = `
            <ceg:GetStock>
                <ceg:request>
                    <ceg:ItemId>${itemId}</ceg:ItemId>
                </ceg:request>
            </ceg:GetStock>`;
        return this.fetchData('GetStock', body);
    }

    async getStockList(itemIds = []) {
        const itemElements = itemIds.map(id => `<ceg:ItemId>${id}</ceg:ItemId>`).join('');
        const body = `
            <ceg:GetStockList>
                <ceg:request>
                    ${itemElements}
                </ceg:request>
            </ceg:GetStockList>`;
        return this.fetchData('GetStockList', body);
    }

    // Sales Order endpoints
    async getSalesOrders(startDate, endDate) {
        const body = `
            <ceg:GetSalesOrders>
                <ceg:request>
                    <ceg:StartDate>${startDate}</ceg:StartDate>
                    <ceg:EndDate>${endDate}</ceg:EndDate>
                </ceg:request>
            </ceg:GetSalesOrders>`;
        return this.fetchData('GetSalesOrders', body);
    }

    // Customer endpoints
    async getCustomer(customerId) {
        const body = `
            <ceg:GetCustomer>
                <ceg:request>
                    <ceg:CustomerId>${customerId}</ceg:CustomerId>
                </ceg:request>
            </ceg:GetCustomer>`;
        return this.fetchData('GetCustomer', body);
    }

    // Item endpoints
    async getItem(itemId) {
        const body = `
            <ceg:GetItem>
                <ceg:request>
                    <ceg:ItemId>${itemId}</ceg:ItemId>
                </ceg:request>
            </ceg:GetItem>`;
        return this.fetchData('GetItem', body);
    }
}

const cegidApi = new CegidApi();
export default cegidApi;

// Export individual methods for convenience
export const { handleCegidConnect, getStock, getStockList, getSalesOrders, getCustomer, getItem } = cegidApi;