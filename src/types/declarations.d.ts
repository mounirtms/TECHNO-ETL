/**
 * Type declarations for modules without TypeScript definitions
 */

declare module 'easy-soap-request' {
  interface SoapRequestOptions {
    url: string;
    headers: Record<string, string>;
    xml: string;
    timeout?: number;
    proxy?: string;
  interface SoapResponse {
    response: {
      body: string;
      statusCode: number;
      headers: Record<string, string>;
    };
  function soapRequest(options: SoapRequestOptions): Promise<SoapResponse>;
  export = soapRequest;
declare module 'xml2js' {
  export interface ParserOptions {
    async?: boolean;
    attrkey?: string;
    charkey?: string;
    explicitArray?: boolean;
    normalizeTags?: boolean;
    normalize?: boolean;
    trim?: boolean;
    mergeAttrs?: boolean;
    explicitRoot?: boolean;
    explicitCharkey?: boolean;
    charsAsChildren?: boolean;
    includeWhiteChars?: boolean;
    emptyTag?;
    explicitChildren?: boolean;
  export class Parser {
    constructor(options?: ParserOptions);
    parseString(str: string, callback?: (err: Error, result) => void): void;
    parseStringPromise(str: string): Promise<any>;