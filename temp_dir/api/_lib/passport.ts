import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as DiscordStrategy } from "passport-discord";
import { User } from "./User.model.js";

// Google Configuration
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID || "missing_client_id",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "missing_client_secret",
      callbackURL: `${process.env.APP_URL || process.env.NEXTAUTH_URL}/api/auth/google/callback`,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;
        if (!email) {
          return done(new Error("No email found from Google"), undefined);
        }

        // Check if user already exists
        let user = await (User as any).findOne({ $or: [{ googleId: profile.id }, { email }] });

        if (user) {
          // Link google id if missing (in case user signed up with credentials mapped to same email)
          if (!user.googleId) {
            user.googleId = profile.id;
            user.provider = "multiple";
            await user.save();
          }
          return done(null, user);
        }

        // Else, create new user
        const avatarUrl = profile.photos && profile.photos.length > 0 ? profile.photos[0].value : "";

        user = new User({
          username: profile.displayName || email.split("@")[0],
          email,
          googleId: profile.id,
          provider: "google",
          avatarUrl,
        });

        await user.save();
        return done(null, user);
      } catch (err: any) {
        return done(err, undefined);
      }
    }
  )
);

// Discord Configuration
passport.use(
  new DiscordStrategy(
    {
      clientID: process.env.DISCORD_CLIENT_ID || "missing_client_id",
      clientSecret: process.env.DISCORD_CLIENT_SECRET || "missing_client_secret",
      callbackURL: `${process.env.APP_URL || process.env.NEXTAUTH_URL}/api/auth/discord/callback`,
      scope: ["identify", "email"],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.email;
        if (!email) {
          return done(new Error("No email found from Discord"), undefined);
        }

        let user = await (User as any).findOne({ $or: [{ discordId: profile.id }, { email }] });

        if (user) {
          if (!user.discordId) {
            user.discordId = profile.id;
            user.provider = "multiple";
            await user.save();
          }
          return done(null, user);
        }

        let avatarUrl = "";
        if (profile.avatar) {
          const format = profile.avatar.startsWith("a_") ? "gif" : "png";
          avatarUrl = `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.${format}`;
        }

        user = new User({
          username: profile.username || email.split("@")[0],
          email,
          discordId: profile.id,
          provider: "discord",
          avatarUrl,
        });

        await user.save();
        return done(null, user);
      } catch (err: any) {
        return done(err, undefined);
      }
    }
  )
);

export default passport;
