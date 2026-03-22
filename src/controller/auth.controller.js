import { StatusCodes } from "http-status-codes";
import * as auth_service from "../services/auth.service.js";

// *----- REGISTERING A NEW USER
export async function register(req, res) {
    try {
        const { username, email, password } = req.body;

        const { user, access_token, refresh_token } = await auth_service.register_user(req, username, email, password);

        res.cookie("refresh_token", refresh_token, {
            httpOnly: process.env.NODE_ENV === "production",
            strict: true,
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        return res.status(StatusCodes.CREATED).json({
            message: "Registration Successful",
            user: { username: user.username, email: user.email },
            access_token,
        });
    } catch (error) {
        console.error("Error: ", error);
        return res.status(error.status || StatusCodes.INTERNAL_SERVER_ERROR).json({ message: error.message || "Internal Server Error" });
    }
};

// *----- LOGIN THE USER
export async function login(req, res) {
    try {
        const { email, password } = req.body;

        const { user, access_token, refresh_token } = await auth_service.login_user(req, email, password);

        res.cookie("refresh_token", refresh_token, {
            httpOnly: process.env.NODE_ENV === "production",
            strict: true,
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        res.status(StatusCodes.OK).json({
            message: "Login successfull",
            user: { username: user.username, email: user.email },
            access_token
        });
    } catch (error) {
        console.error("Error: ", error);
        return res.status(error.status || StatusCodes.INTERNAL_SERVER_ERROR).json({ message: error.message || "Internal Server Error" });
    }
}

// *----- GETTING THE USER WITH ID or EMAIL
export async function getMe(req, res) {
    try {
        const token = req.headers.authorization?.split(" ")[1];

        const decoded = await auth_service.get_me(token);

        return res.status(StatusCodes.OK).json({
            message: "User Found",
            user: decoded
        })
    } catch (error) {
        console.error("Error: ", error);
        return res.status(error.status || StatusCodes.INTERNAL_SERVER_ERROR).json({ message: error.message || "Internal Server Error" });
    }
};

// *----- REFRESH TOKEN
export async function refreshToken(req, res) {
    try {
        const refresh_token = req.cookies.refresh_token;

        const { access_token, new_refresh_token } = await auth_service.refresh_token_service(refresh_token);

        res.cookie("refresh_token", new_refresh_token, {
            httpOnly: process.env.NODE_ENV === "production",
            strict: true,
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        return res.status(StatusCodes.CREATED).json({
            message: "Token refreshed",
            access_token
        });
    } catch (error) {
        console.error("Error: ", error);
        return res.status(error.status || StatusCodes.INTERNAL_SERVER_ERROR).json({ message: error.message || "Internal Server Error" });
    }
}

// *----- LOGOUT THE USER
export async function logout(req, res) {
    try {
        const refresh_token = req.cookies.refresh_token;

        await auth_service.logout_user(refresh_token);

        res.clearCookie("refresh_token");

        res.status(StatusCodes.OK).json({
            message: "Logged out successfully"
        });
    } catch (error) {
        console.error("Error: ", error);
        return res.status(error.status || StatusCodes.INTERNAL_SERVER_ERROR).json({ message: error.message || "Internal Server Error" });
    }
}

// *----- LOGOUT FROM ALL DEVICES
export async function logoutAll(req, res) {
    try {
        const refresh_token = req.cookies.refresh_token;

        await auth_service.logout_all_devices(refresh_token);

        res.clearCookie('refresh_token');

        return res.status(StatusCodes.OK).json({
            message: "Logged out from all devices"
        });
    } catch (error) {
        console.error("Error: ", error);
        return res.status(error.status || StatusCodes.INTERNAL_SERVER_ERROR).json({ message: error.message || "Internal Server Error" });
    }
}

// *----- GET ALL THE USERS
export async function getAllUsers(req, res) {
    try {
        const users = await auth_service.get_all_users();

        return res.status(StatusCodes.OK).json({
            message: "All the users fetched",
            users
        });
    } catch (error) {
        console.error("Error: ", error);
        return res.status(error.status || StatusCodes.INTERNAL_SERVER_ERROR).json({ message: error.message || "Internal Server Error" });
    }
}

// *----- GET ALL THE SESSIONS
export async function getAllSessions(req, res) {
    try {
        const sessions = await auth_service.get_all_sessions();

        return res.status(StatusCodes.OK).json({
            message: "All the sessions fetched",
            sessions
        });
    } catch (error) {
        console.error("Error: ", error);
        return res.status(error.status || StatusCodes.INTERNAL_SERVER_ERROR).json({ message: error.message || "Internal Server Error" });
    }
}

// !----- DELETE ALL THE USERS
export async function deleteAllUsers(req, res) {
    try {
        await auth_service.delete_all_users();

        return res.status(StatusCodes.GONE).json({
            message: "All the DB Users are deleted"
        })
    } catch (error) {
        console.error("Error: ", error);
        return res.status(error.status || StatusCodes.INTERNAL_SERVER_ERROR).json({ message: error.message || "Internal Server Error" });
    }
};

// !----- DELETE ALL THE SESSIONS
export async function deleteAllSessions(req, res) {
    try {
        await auth_service.delete_all_sessions();

        return res.status(StatusCodes.GONE).json({
            message: "All the DB Sessions are deleted"
        })
    } catch (error) {
        console.error("Error: ", error);
        return res.status(error.status || StatusCodes.INTERNAL_SERVER_ERROR).json({ message: error.message || "Internal Server Error" });
    }
};