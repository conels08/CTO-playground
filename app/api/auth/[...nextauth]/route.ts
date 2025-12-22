import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const handler = NextAuth({
  session: { strategy: "jwt" },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const username = credentials?.username ?? "";
        const password = credentials?.password ?? "";

        const validUser = process.env.AUTH_USER ?? "";
        const validPass = process.env.AUTH_PASS ?? "";

        if (!validUser || !validPass) return null;

        if (username === validUser && password === validPass) {
          return {
            id: "dev-user",
            name: "Colby",
            email: "dev@local",
          };
        }

        return null;
      },
    }),
  ],
  pages: {
    signIn: "/auth/signin",
  },
});

export { handler as GET, handler as POST };
