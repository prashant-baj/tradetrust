(window as any).global = window; 
(window as any).process = {
   env: {DEBUG: undefined},
};
import { Buffer } from 'buffer';

// @ts-ignore
window.Buffer = Buffer;