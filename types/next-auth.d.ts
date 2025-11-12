import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      uuid: string;
      mcid: string;
      name: string;
    };
  }

  interface User {
    uuid: string;
    mcid: string;
    name: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    uuid: string;
    mcid: string;
    name: string;
  }
}
