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

