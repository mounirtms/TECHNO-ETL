
import axios from 'axios';
import { toast } from 'react-toastify';

class CegidApi {
    constructor() {
        this.baseConfig = {
            headers: {
                'Content-Type': 'text/xml',
                'Accept': '*/*'
            }
        };

        // Retrieve stored credentials
        this.credentials = {
            url: import.meta.env.VITE_Cegid_API_URL,
            username: import.meta.env.VITE_Cegid_ADMIN_USERNAME,
            password: import.meta.env.VITE_Cegid_ADMIN_PASSWORD,
            database: import.meta.env.VITE_Cegid_ADMIN_DATABASE
        };
              // Cancel token source for managing requests
              this.cancelTokenSource = null;
    }

    // Create SOAP envelope with proper XML structure
    createSoapEnvelope(body, database) {
        return `<?xml version="1.0" encoding="utf-8"?>
            <soap:Envelope 
                xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" 
                xmlns:ret="http://www.cegid.fr/Retail/1.0">
                <soap:Header>
                    <ret:RetailContext>
                        <ret:DatabaseId>${database}</ret:DatabaseId>
                    </ret:RetailContext>
                </soap:Header>
                <soap:Body>
                    ${body}
                </soap:Body>
            </soap:Envelope>`;
    }

    // Create HelloWorld request body
    createHelloWorldBody(database) {
        return `
            <ret:HelloWorld>
                <ret:text>Techo Stationary connection</ret:text>
                <ret:clientContext>
                    <ret:DatabaseId>${database}</ret:DatabaseId>
                </ret:clientContext>
            </ret:HelloWorld>`;
    }

   // Simple XML response parser
   parseSoapResponse(xmlString) {
    try {
        // Extract content between HelloWorldResult tags
        const match = xmlString.match(/<HelloWorldResult>(.*?)<\/HelloWorldResult>/s);
        if (match) {
            const result = match[1].trim();
            // Extract database and identity information
            const dbMatch = result.match(/DataBaseId: \((.*?)\)/);
            const identityMatch = result.match(/Current Identity: \((.*?)\)/);
            return {
                success: true,
                result,
                database: dbMatch ? dbMatch[1] : null,
                identity: identityMatch ? identityMatch[1] : null
            };
        }
        
        // Check for fault
        const faultMatch = xmlString.match(/<faultstring>(.*?)<\/faultstring>/s);
        if (faultMatch) {
            throw new Error(faultMatch[1].trim());
        }

        return {
            success: true,
            raw: xmlString
        };
    } catch (error) {
        console.error('XML Parsing Error:', error);
        throw error;
    }
}

    // Create Basic Auth header using browser's btoa
    createBasicAuth(username, password) {
        try {
            const auth = btoa(`${username}:${password}`);
            return `Basic ${auth}`;
        } catch (error) {
            console.error('Error creating Basic Auth:', error);
            throw new Error('Failed to create authorization header');
        }
    }

       // Cancel any ongoing requests
       cancelOngoingRequests() {
        if (this.cancelTokenSource) {
            this.cancelTokenSource.cancel('Operation cancelled due to new request');
            this.cancelTokenSource = null;
        }
    }

  // Cegid Connection Method with Basic Authentication
  async handleCegidConnect(
    url = this.credentials.url, 
    username = this.credentials.username, 
    password = this.credentials.password, 
    database = this.credentials.database
) {
    try {
        // Cancel any ongoing requests
        this.cancelOngoingRequests();
        
        // Create new cancel token
        this.cancelTokenSource = axios.CancelToken.source();

        // Validate inputs
        if (!url || !username || !password || !database) {
            throw new Error('Missing required credentials');
        }

        const serviceUrl = url.endsWith('/') 
            ? `${url}CustomerWcfService.svc` 
            : `${url}/CustomerWcfService.svc`;

        // Create SOAP request with proper structure
        const soapRequest = this.createSoapEnvelope(
            this.createHelloWorldBody(database),
            database
        );

        console.log('Making request to:', serviceUrl);
        const headers = {
            ...this.baseConfig.headers,
            'Authorization': this.createBasicAuth(username, password),
            'SOAPAction': 'http://www.cegid.fr/Retail/1.0/ICbrBasicWebServiceInterface/HelloWorld'
        };
        console.log('With headers:', headers);

        // Make SOAP request with Basic Authentication
        const response = await axios({
            method: 'post',
            url: serviceUrl,
            data: soapRequest,
            headers,
            maxRedirects: 0,
            cancelToken: this.cancelTokenSource.token
        });

        // Parse response
        const result = this.parseSoapResponse(response.data);
        
        // Store credentials securely
        localStorage.setItem('cegidCredentials', JSON.stringify({
            url: serviceUrl,
            username,
            database
        }));

        // Show success toast with database and username
        toast.success(
            `Connected to Cegid successfully!\nDatabase: ${result.database || database}\nUser: ${result.identity || username}`,
            { autoClose: 5000 }
        );
        
        return result;

    } catch (error) {
        console.error('Cegid Connection Error:', error);
        
        // Don't show error toast if request was cancelled
        if (!axios.isCancel(error)) {
            const errorMessage = error.response?.data 
                ? this.parseSoapResponse(error.response.data).message || error.message
                : error.message;
            
            toast.error(`Connection failed: ${errorMessage}`, { autoClose: 5000 });
            throw new Error(`Cegid Connection Error: ${errorMessage}`);
        }
    } finally {
        this.cancelTokenSource = null;
    }
}
    // Generic method for making SOAP requests
    async fetchData(action, body, options = {}) {
        try {
            const credentials = JSON.parse(localStorage.getItem('cegidCredentials'));
            if (!credentials) {
                throw new Error('No stored credentials found');
            }

            const soapRequest = this.createSoapEnvelope(body, credentials.database);

            const response = await axios({
                method: 'post',
                url: credentials.url,
                data: soapRequest,
                headers: {
                    ...this.baseConfig.headers,
                    'Authorization': this.createBasicAuth(credentials.username, this.credentials.password),
                    'SOAPAction': action
                }
            });

            return this.parseSoapResponse(response.data);
        } catch (error) {
            console.error('Cegid API Fetch Error:', error);
            throw error;
        }
    }

    // Inventory endpoints
    async getStock(itemId) {
        const body = `
            <ret:GetStock>
                <ret:request>
                    <ret:ItemId>${itemId}</ret:ItemId>
                </ret:request>
            </ret:GetStock>`;
        return this.fetchData('http://www.cegid.fr/Retail/1.0/ICbrBasicWebServiceInterface/GetStock', body);
    }
}

const cegidApi = new CegidApi();
export default cegidApi;