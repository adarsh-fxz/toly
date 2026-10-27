import { passkey } from "@better-auth/passkey";
import { schema } from "@toly/db";
import { isNepaliMobile } from "@toly/shared/phone";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin, captcha, phoneNumber } from "better-auth/plugins";
import { db } from "./db";
import { env, isProd } from "./env";
import { redisStorage } from "./lib/redis";
import { sendSms } from "./lib/sms";

const DAY = 60 * 60 * 24;

export const auth = betterAuth({
  appName: "Toly",
  baseURL: env.WEB_URL,
  basePath: "/api/auth",
  secret: env.BETTER_AUTH_SECRET,
  trustedOrigins: [env.WEB_URL],
  database: drizzleAdapter(db, { provider: "pg", schema }),
  secondaryStorage: redisStorage,
  session: {
    expiresIn: 30 * DAY,
    updateAge: DAY,
    freshAge: 10 * 60,
    cookieCache: { enabled: true, maxAge: 5 * 60 },
  },
  verification: { storeIdentifier: "hashed" },
  account: {
    accountLinking: { enabled: true, trustedProviders: ["google"] },
  },
  socialProviders:
    env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET
      ? {
          google: {
            clientId: env.GOOGLE_CLIENT_ID,
            clientSecret: env.GOOGLE_CLIENT_SECRET,
            prompt: "select_account",
          },
        }
      : {},
  rateLimit: {
    enabled: true,
    window: 60,
    max: 60,
    storage: redisStorage ? "secondary-storage" : "database",
    customRules: {
      "/phone-number/send-otp": { window: 10 * 60, max: 3 },
      "/phone-number/verify": { window: 10 * 60, max: 10 },
      "/passkey/*": { window: 60, max: 20 },
    },
  },
  advanced: {
    cookiePrefix: "toly",
    useSecureCookies: isProd,
    ipAddress: { ipAddressHeaders: ["cf-connecting-ip", "x-forwarded-for"] },
  },
  plugins: [
    phoneNumber({
      otpLength: 6,
      expiresIn: 5 * 60,
      allowedAttempts: 5,
      phoneNumberValidator: isNepaliMobile,
      sendOTP: ({ phoneNumber, code }) =>
        sendSms(
          phoneNumber,
          `${code} is your Toly code. It expires in 5 minutes. Never share it with anyone.`,
        ),
      signUpOnVerification: {
        getTempEmail: (phone) => `${phone.slice(1)}@phone.toly.invalid`,
        getTempName: () => "",
      },
    }),
    passkey({
      rpID: new URL(env.WEB_URL).hostname,
      rpName: "Toly",
      origin: env.WEB_URL,
    }),
    admin(),
    ...(env.TURNSTILE_SECRET_KEY
      ? [
          captcha({
            provider: "cloudflare-turnstile",
            secretKey: env.TURNSTILE_SECRET_KEY,
            endpoints: ["/phone-number/send-otp"],
          }),
        ]
      : []),
  ],
});

export type Session = typeof auth.$Infer.Session;
