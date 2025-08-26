// Type declarations for migrated modules
declare module '*.svg' {
  const content: string;
  export default content;
declare module '*.png' {
  const content: string;
  export default content;
declare module '*.jpg' {
  const content: string;
  export default content;
declare module '*.jpeg' {
  const content: string;
  export default content;
declare module '*.gif' {
  const content: string;
  export default content;
declare module '*.css' {
  const classes: { [key: string]: string };
  export default classes;
declare module '*.scss' {
  const classes: { [key: string]: string };
  export default classes;
// Global declarations
declare global {
  interface Window {
    __REACT_CONTEXT_FIX__?: boolean;
    __APP_VERSION__?: string;
    __BUILD_TIME__?: string;
    __DEV__?: boolean;
    __PROD__?: boolean;
export {};
