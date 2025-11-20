// Temporary type declarations for Prisma Client when generation is not possible
declare module '@prisma/client' {
  export * from '@prisma/client/index';
  export { PrismaClient } from '@prisma/client/index';
}

declare module '@prisma/client/index' {
  export class PrismaClient {
    constructor(options?: any);
    user: any;
    playerConfig: any;
    keybinding: any;
    customKey: any;
    keyRemap: any;
    externalTool: any;
    itemLayout: any;
    $connect(): Promise<void>;
    $disconnect(): Promise<void>;
    $transaction(fn: (tx: PrismaClient) => Promise<any>): Promise<any>;
  }
}
