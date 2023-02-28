const { loginAuth, refresh } = require("../controllers/auth.controller");
const verifyToken = require("../middleware/auth.middleware");

const AuthRouter = require("express").Router();

AuthRouter.post("/user", loginAuth);
AuthRouter.get("/refresh", verifyToken, refresh);

module.exports = AuthRouter;