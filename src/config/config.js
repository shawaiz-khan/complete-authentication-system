import dotenv from 'dotenv';

dotenv.config({ quiet: true });

if (!process.env.MONGODB_URI) {
    throw new Error("MongoDB URI is not present in .env");
}

if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not present in .env");
}

const config = {
    PORT: process.env.PORT ?? '8080',
    MONGODB_URI: process.env.MONGODB_URI,
    JWT_SECRET: process.env.JWT_SECRET,
}

export default config;