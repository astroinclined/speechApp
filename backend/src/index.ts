import "./LoadEnv"; // Must be the first import
import app from "@server";
import logger from "@shared/Logger";

const server = require("http").createServer(app);

const io = require("socket.io")(server);
// Start the server
const port = Number(process.env.PORT || 3000);
/**app.listen(port, () => {
  logger.info("Express server started on port: " + port);
});**/

// Makes an authenticated API request.

/**async function main() {
  // Imports the Google Cloud client library
  const speech = require("@google-cloud/speech");
  const fs = require("fs");

  // Creates a client
  const client = new speech.SpeechClient();

  // The name of the audio file to transcribe
  const fileName = "./src/untitled.wav";

  // Reads a local audio file and converts it to base64
  const file = fs.readFileSync(fileName);
  const audioBytes = file.toString("base64");

  // The audio file's encoding, sample rate in hertz, and BCP-47 language code
  const audio = {
    content: audioBytes,
  };
  const config = {
    encoding: "LINEAR16",
    //sampleRateHertz: 16000,
    languageCode: "en-US",
  };
  const request = {
    audio: audio,
    config: config,
  };

  // Detects speech in the audio file
  const [response] = await client.recognize(request);
  const transcription = response.results
    .map(
      (result: { alternatives: { transcript: any }[] }) =>
        result.alternatives[0].transcript
    )
    .join("\n");
  console.log(`Transcription: ${transcription}`);
}
main().catch(console.error);**/
