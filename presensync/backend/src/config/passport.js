import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as MicrosoftStrategy } from 'passport-microsoft';
import prisma from '../config/database.js';
import { generateToken } from '../utils/jwt.js';

// Serialize user for session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await prisma.user.findUnique({ where: { id } });
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// Google OAuth Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await prisma.user.findFirst({
          where: {
            OR: [
              { email: profile.emails[0].value },
              { oauthId: profile.id, oauthProvider: 'google' },
            ],
          },
        });

        if (!user) {
          // Create new user
          user = await prisma.user.create({
            data: {
              email: profile.emails[0].value,
              fullName: profile.displayName || profile.name.givenName + ' ' + profile.name.familyName,
              avatarUrl: profile.photos[0]?.value,
              oauthProvider: 'google',
              oauthId: profile.id,
              universityEmail: profile.emails[0].value,
              role: 'STUDENT', // Default role, can be updated by admin
            },
          });
        } else if (!user.oauthId) {
          // Link OAuth to existing account
          user = await prisma.user.update({
            where: { id: user.id },
            data: {
              oauthProvider: 'google',
              oauthId: profile.id,
              avatarUrl: profile.photos[0]?.value || user.avatarUrl,
            },
          });
        }

        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

// Microsoft OAuth Strategy
passport.use(
  new MicrosoftStrategy(
    {
      clientID: process.env.MICROSOFT_CLIENT_ID,
      clientSecret: process.env.MICROSOFT_CLIENT_SECRET,
      tenant: process.env.MICROSOFT_TENANT_ID || 'common',
      callbackURL: process.env.MICROSOFT_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await prisma.user.findFirst({
          where: {
            OR: [
              { email: profile.emails[0]?.value },
              { oauthId: profile.id, oauthProvider: 'microsoft' },
            ],
          },
        });

        if (!user) {
          // Create new user
          user = await prisma.user.create({
            data: {
              email: profile.emails[0]?.value || profile._json.userPrincipalName,
              fullName: profile.displayName || profile.name.givenName + ' ' + profile.name.familyName,
              avatarUrl: null, // Microsoft doesn't provide avatar in basic profile
              oauthProvider: 'microsoft',
              oauthId: profile.id,
              universityEmail: profile.emails[0]?.value || profile._json.userPrincipalName,
              role: 'STUDENT', // Default role
            },
          });
        } else if (!user.oauthId) {
          // Link OAuth to existing account
          user = await prisma.user.update({
            where: { id: user.id },
            data: {
              oauthProvider: 'microsoft',
              oauthId: profile.id,
            },
          });
        }

        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

export default passport;

