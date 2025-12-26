import NextAuth, { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import CredentialsProvider from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  
  providers: [
    // Google OAuth
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      authorization: {
        params: {
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code',
        },
      },
    }),
    
    // Email/Password
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email et mot de passe requis')
        }

        // Rechercher le dentiste
        const dentist = await prisma.dentist.findUnique({
          where: { email: credentials.email },
        })

        if (!dentist) {
          throw new Error('Aucun compte trouvé avec cet email')
        }

        // Vérifier le mot de passe
        if (!dentist.password) {
          throw new Error('Veuillez utiliser la connexion Google pour ce compte')
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          dentist.password
        )

        if (!isPasswordValid) {
          throw new Error('Mot de passe incorrect')
        }

        return {
          id: dentist.id,
          email: dentist.email,
          name: dentist.name,
        }
      },
    }),
  ],

  pages: {
    signIn: '/login',
    error: '/login',
  },

  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 jours
  },

  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id
        token.email = user.email
        token.name = user.name
      }

      // Si connexion Google, stocker les tokens Google Calendar
      if (account?.provider === 'google') {
        token.googleAccessToken = account.access_token
        token.googleRefreshToken = account.refresh_token
        token.googleTokenExpiry = account.expires_at
      }

      return token
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.email = token.email as string
        session.user.name = token.name as string
      }

      return session
    },

    async signIn({ user, account, profile }) {
      // Si connexion Google
      if (account?.provider === 'google') {
        // Vérifier si le dentiste existe déjà
        const existingDentist = await prisma.dentist.findUnique({
          where: { email: user.email! },
        })

        if (!existingDentist) {
          // Créer un nouveau dentiste
          await prisma.dentist.create({
            data: {
              email: user.email!,
              name: user.name || 'Dentiste',
              googleCalendarEnabled: true,
              googleAccessToken: account.access_token,
              googleRefreshToken: account.refresh_token,
              googleTokenExpiry: account.expires_at
                ? new Date(account.expires_at * 1000)
                : null,
            },
          })
        } else {
          // Mettre à jour les tokens Google
          await prisma.dentist.update({
            where: { email: user.email! },
            data: {
              googleCalendarEnabled: true,
              googleAccessToken: account.access_token,
              googleRefreshToken: account.refresh_token,
              googleTokenExpiry: account.expires_at
                ? new Date(account.expires_at * 1000)
                : null,
            },
          })
        }
      }

      return true
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }