import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      githubAccessToken?: string;
      githubProfile?: unknown;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    githubAccessToken?: string;
    githubProfile?: unknown;
  }
}