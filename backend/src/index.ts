import "./LoadEnv"; // Must be the first import
import app from "@server";
import logger from "@shared/Logger";

const server = require("http").createServer(app);

const io = require("socket.io")(server);
// Start the server
const port = Number(process.env.PORT || 3000);
