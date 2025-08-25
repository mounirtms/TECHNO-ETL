import soapRequest from 'easy-soap-request';
import xml2js from 'xml2js';

const cegidUrl = import.meta.env.VITE_Cegid_API_URL;
const cegidUsername = import.meta.env.VITE_Cegid_ADMIN_USERNAME;
const cegidPassword = import.meta.env.VITE_Cegid_ADMIN_PASSWORD;

// Define types for Cegid API data
interface CegidItem {
  ItemCode: string[];
  Description: string[];
  Price: string[];
  Stock: string[];
  Store: string[];
  Status: string[];
}

interface CegidInventory {
  Items: CegidItem[];
}

interface CegidResponse {
  Inventory: CegidInventory;
}

interface CegidProduct {
  itemCode: string;
  description: string;
  price: string;
  stock: string;
  store: string;
  status: string;
}

interface SoapResponse {
  response: {
    body: string;
    statusCode: number;
    headers: Record<string, string>;
  };
}

async function getProductsFromCegid(): Promise<CegidProduct[]> {
    const wsdl = await fetch('/assets/CegidApi/InventoryService.wsdl').then(res => res.text());

    const headers = {
        'Content-Type': 'text/xml;charset=UTF-8',
        // Add any other required headers here
    };

    const xml = `<?xml version="1.0" encoding="utf-8"?>
    <soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
        <soap:Body>
            <!-- Your SOAP request body here -->
        </soap:Body>
    </soap:Envelope>`;

    const { response }: SoapResponse = await soapRequest({
        url: cegidUrl,
        headers: headers,
        xml: xml,
    });

    const { body, statusCode } = response;

    if(statusCode !== 200) {
        throw new Error(`Cegid API error ${statusCode}: ${body}`);
    }

    const parser = new xml2js.Parser();
    const parsedData = await parser.parseStringPromise(body) as CegidResponse;

    const transformedMagentoData: CegidProduct[] = parsedData.Inventory.Items.map((item: any: any: any: any) => ({
        itemCode: item.ItemCode[0],
        description: item.Description[0],
        price: item.Price[0],
        stock: item.Stock[0],
        store: item.Store[0],
        status: item.Status[0]
    }));

    return transformedMagentoData;
}

export { getProductsFromCegid, type CegidProduct };