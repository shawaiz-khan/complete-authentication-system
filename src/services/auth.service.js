import { StatusCodes } from 'http-status-codes';
import UserModel from '../models/user.model.js';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import config from '../config/config.js';
import SessionModel from '../models/session.model.js';

// *----- REGISTER THE USER IN DB
export async function register_user(req, username, email, password) {
    const isUser = await UserModel.findOne({
        $or: [{ username }, { email }]
    });

    if (isUser) {
        const error = new Error('User Already Exists');
        error.status = StatusCodes.CONFLICT;
        throw error;
    }

    const hashedPassword = crypto.createHash("sha256").update(password).digest("hex");

    const user = await UserModel.create({
        username,
        email,
        password: hashedPassword
    });

    const refresh_token = jwt.sign(
        { id: user._id },
        config.JWT_SECRET,
        { expiresIn: "7d" }
    );

    const hashedRefreshToken = crypto.createHash("sha256").update(refresh_token).digest("hex");

    const session = await SessionModel.create({
        user: user._id,
        refreshTokenHash: hashedRefreshToken,
        ip: req.ip,
        userAgent: req.headers["user-agent"]
    });

    const access_token = jwt.sign(
        {
            id: user._id,
            sessionId: session._id
        },
        config.JWT_SECRET,
        { expiresIn: "15m" }
    );

    return { user, access_token, refresh_token };
};

// *----- LOGIN THE USER
export async function login_user(req, email, password) {
    const user = await UserModel.findOne({ email });

    if (!user) {
        const error = new Error("User not found");
        error.status = StatusCodes.UNAUTHORIZED;
        throw error;
    }

    const hashedPassword = crypto.createHash("sha256").update(password).digest("hex");
    const isPasswordValid = hashedPassword === user.password;

    if (!isPasswordValid) {
        const error = new Error("Invalid email or password");
        error.status = StatusCodes.UNAUTHORIZED;
        throw error;
    }

    const refresh_token = jwt.sign({ id: user._id }, config.JWT_SECRET, { expiresIn: '7d' });
    const refreshTokenHash = crypto.createHash('sha256').update(refresh_token).digest("hex");

    const session = await SessionModel.create({
        user: user._id,
        refreshTokenHash,
        ip: req.ip,
        userAgent: req.headers['user-agent']
    });

    const access_token = jwt.sign({ id: user._id, sessionId: session._id }, config.JWT_SECRET, { expiresIn: '15m' });

    return { user, access_token, refresh_token };
}

// *----- GET ME OVER SERVICE
export async function get_me(token) {
    if (!token) {
        const error = new Error("User is not authorized");
        error.status = StatusCodes.UNAUTHORIZED;
        throw error;
    }
    return jwt.verify(token, config.JWT_SECRET);
}

// *----- REFRESH TOKEN OVER SERVICE
export async function refresh_token_service(refresh_token) {
    if (!refresh_token) {
        const error = new Error("No refresh token found");
        error.status = StatusCodes.UNAUTHORIZED;
        throw error;
    }

    const decoded = jwt.verify(refresh_token, config.JWT_SECRET);
    const refreshTokenHash = crypto.createHash("sha256").update(refresh_token).digest("hex");

    const session = await SessionModel.findOne({
        refreshTokenHash,
        revoked: false
    });

    if (!session) {
        const error = new Error("Incorrect or Expired refresh token");
        error.status = StatusCodes.UNAUTHORIZED;
        throw error;
    }

    const new_refresh_token = jwt.sign(
        { id: decoded.id },
        config.JWT_SECRET,
        { expiresIn: "7d" }
    );

    const newRefreshTokenHash = crypto.createHash("sha256").update(new_refresh_token).digest("hex");

    session.refreshTokenHash = newRefreshTokenHash;
    await session.save();

    const access_token = jwt.sign(
        { id: decoded.id },
        config.JWT_SECRET,
        { expiresIn: "15m" }
    );

    return { access_token, new_refresh_token };
}

// *----- LOGOUT THE USER OVER SERVICE
export async function logout_user(refresh_token) {
    if (!refresh_token) {
        const error = new Error("No refresh token found");
        error.status = StatusCodes.UNAUTHORIZED;
        throw error;
    }

    const refreshTokenHash = crypto.createHash("sha256").update(refresh_token).digest("hex");

    const session = await SessionModel.findOne({
        refreshTokenHash,
        revoked: false,
    });

    if (!session) {
        const error = new Error("Incorrect or expired refresh token");
        error.status = StatusCodes.UNAUTHORIZED;
        throw error;
    }

    session.revoked = true;
    await session.save();
}

// *----- LOGOUT FROM ALL DEVICES OVER SERVICE
export async function logout_all_devices(refresh_token) {
    if (!refresh_token) {
        const error = new Error("No refresh token found");
        error.status = StatusCodes.UNAUTHORIZED;
        throw error;
    }

    const decoded = jwt.verify(refresh_token, config.JWT_SECRET);

    await SessionModel.updateMany({ user: decoded._id, revoked: false }, { revoked: true });
}

// *----- GET ALL THE USERS FROM DB
export async function get_all_users() {
    return await UserModel.find({});
}

// *----- GET ALL SESSIONS FROM DB
export async function get_all_sessions() {
    return await SessionModel.find({});
}

// !----- DELETE ALL THE USERS FROM DB
export async function delete_all_users() {
    await UserModel.deleteMany({});
}

// !----- DELETE ALL SESSIONS FROM DB
export async function delete_all_sessions() {
    await SessionModel.deleteMany({});
}