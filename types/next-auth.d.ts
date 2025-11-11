import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      mcid?: string;
      uuid?: string;
    };
  }

  interface User {
    mcid?: string;
    uuid?: string;
  }
}
