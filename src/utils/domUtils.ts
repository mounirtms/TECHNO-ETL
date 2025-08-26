/**
 * Safely check if a value is a DOM element
 * Prevents TypeError when checking non-objects
 */
export function safeIsElement(value: any) {
  try {
    // First check if value is an object to prevent TypeError
    if(!value || typeof value !== 'object') {
      return false;
  } catch (error) {
    console.error(error);


  } catch (error) {
    console.error(error);



    // Then check if it's a DOM element (nodeType ===1 and not a plain object)
    return (value.nodeType ===1 && !(value.toString && value.toString() ==='[object Object]');
  } catch(e: any) {
    return false;