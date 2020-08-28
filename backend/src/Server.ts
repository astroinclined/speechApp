import cookieParser from "cookie-parser";
import morgan from "morgan";
import path from "path";
import helmet from "helmet";

import express, { Request, Response, NextFunction } from "express";
import { BAD_REQUEST } from "http-status-codes";
import "express-async-errors";

import BaseRouter from "./routes";
import logger from "@shared/Logger";

const http = require("http");
const socketIO = require("socket.io");

const speech = require("@google-cloud/speech");
const speechClient = new speech.SpeechClient();

const request = {
  config: {
    encoding: "LINEAR16",
    sampleRateHertz: 16000,
    languageCode: "en-US",
  },
  interimResults: true,
};
// Init express
const app = express();
const server = http.createServer(app);

//var io = require("socket.io")(server, { origins: "*:*" });

const io = require("socket.io")(server, {
  handlePreflightRequest: (
    req: { headers: { origin: any } },
    res: {
      writeHead: (
        arg0: number,
        arg1: {
          "Access-Control-Allow-Headers": string;
          "Access-Control-Allow-Origin": any; //or the specific origin you want to give access to,
          "Access-Control-Allow-Credentials": boolean;
        }
      ) => void;
      end: () => void;
    }
  ) => {
    const headers = {
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Allow-Origin": req.headers.origin, //or the specific origin you want to give access to,
      "Access-Control-Allow-Credentials": true,
    };
    res.writeHead(200, headers);
    res.end();
  },
});

io.on("connection", (client: any) => {
  let recognizeStream: {
    write: (arg0: any) => void;
    end: () => void;
  } | null = null;
  client.on("join", function () {
    client.emit("messages", "Socket Connected to Server");
  });

  client.on("messages", function (data) {
    client.emit("broad", data);
  });

  client.on("startGoogleCloudStream", function (data) {
    console.log(data);
    startRecognitionStream(client);
  });

  client.on("endGoogleCloudStream", function () {
    stopRecognitionStream();
  });
  client.on("binaryData", function (data) {
    // console.log(data); //log binary data
    if (recognizeStream) {
      recognizeStream.write(data);
    }
  });
  function startRecognitionStream(client) {
    recognizeStream = speechClient
      .streamingRecognize({
        config: {
          encoding: "LINEAR16",
          sampleRateHertz: 16000,
          languageCode: "en-US",
          profanityFilter: false,
          enableWordTimeOffsets: true,
        },
        interimResults: true, // If you want interim results, set this to true
      })
      .on("error", function (error) {
        console.error(error);
        client.emit("endGoogleCloudStream");
      })
      .on("data", (data) => {
        process.stdout.write(
          data.results[0] && data.results[0].alternatives[0]
            ? `Transcription: ${data.results[0].alternatives[0].transcript}\n`
            : "\n\nReached transcription time limit, press Ctrl+C\n"
        );
        client.emit("speechData", data);

        // if end of utterance, let's restart stream
        // this is a small hack. After 65 seconds of silence, the stream will still throw an error for speech length limit
        if (data.results[0] && data.results[0].isFinal) {
          stopRecognitionStream();
          startRecognitionStream(client);
        }
      });
  }
  function stopRecognitionStream() {
    console.log("ending recognition stream");
    if (recognizeStream) {
      recognizeStream.end();
    }
    recognizeStream = null;
  }
});

server.listen(3000);

/************************************************************************************
 *                              Set basic express settings
 ***********************************************************************************/

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Show routes called in console during development
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Security
if (process.env.NODE_ENV === "production") {
  app.use(helmet());
}

// Add APIs
app.use("/api", BaseRouter);

// Print API errors
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  logger.error(err.message, err);
  return res.status(BAD_REQUEST).json({
    error: err.message,
  });
});

/************************************************************************************
 *                              Serve front-end content
 ***********************************************************************************/

const viewsDir = path.join(__dirname, "views");
app.set("views", viewsDir);
const staticDir = path.join(__dirname, "public");
app.use(express.static(staticDir));
app.get("*", (req: Request, res: Response) => {
  res.sendFile("index.html", { root: viewsDir });
});

// Export express instance
export default app;
