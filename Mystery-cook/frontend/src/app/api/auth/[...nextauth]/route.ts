import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";

const handler = NextAuth({
    providers: [
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
        Credentials({
            name: "credentials",
            credentials: {
                email: { label: "メールアドレス", type: "email" },
                password: { label: "パスワード", type: "password" },
            },
            async authorize(credentials): Promise<any> {
                try {
                    const url = `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"}/api/v1/auth/login`;
                    const res = await fetch(url, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            email: credentials?.email,
                            password: credentials?.password,
                        }),
                    });
                    if (!res.ok) return null;
                    const data = await res.json();
                    return {
                        id: credentials?.email ?? "",
                        email: credentials?.email,
                        accessToken: data.access_token,
                    };
                } catch {
                    return null;
                }
            },
        }),
    ],
    pages: {
        signIn: "/login",
    },
    session: {
        strategy: "jwt",
    },
    callbacks: {
        // authorizeで返したaccessTokenをJWTに保存する
        async jwt({ token, user }) {
            if (user) token.accessToken = (user as any).accessToken;
            return token;
        },
        // JWTのaccessTokenをセッションに含める
        async session({ session, token }) {
            (session as any).accessToken = token.accessToken;
            return session;
        },
    },
});

export { handler as GET, handler as POST };