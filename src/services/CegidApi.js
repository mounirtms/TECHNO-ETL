import soapRequest from 'easy-soap-request';
import xml2js from 'xml2js';

const cegidUrl = import.meta.env.VITE_Cegid_API_URL;
const cegidUsername = import.meta.env.VITE_Cegid_ADMIN_USERNAME;
const cegidPassword = import.meta.env.VITE_Cegid_ADMIN_PASSWORD;

async function getProductsFromCegid() {
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

  const { response } = await soapRequest({
    url: cegidUrl,
    headers: headers,
    xml: xml,
  });

  const { body, statusCode } = response;

  if (statusCode !== 200) {
    throw new Error(`Cegid API error ${statusCode}: ${body}`);
  }

  const parser = new xml2js.Parser();
  const parsedData = await parser.parseStringPromise(body);

  const transformedMagentoData = parsedData.Inventory.Items.map(item => ({
    itemCode: item.ItemCode[0],
    description: item.Description[0],
    price: item.Price[0],
    stock: item.Stock[0],
    store: item.Store[0],
    status: item.Status[0],
  }));

  return transformedMagentoData;
}

export { getProductsFromCegid };
