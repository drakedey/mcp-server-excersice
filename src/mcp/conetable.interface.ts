import { Transport } from '@modelcontextprotocol/sdk/shared/transport.js';
export default interface Connectable {
    connectToTransport(transport: Transport): void 
}