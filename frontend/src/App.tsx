import React, { useState, useEffect, useRef } from "react";

import "./App.css";
import { Button } from "@material-ui/core";
import socketIOClient from "socket.io-client";
import { connect, useDispatch, useSelector } from "react-redux";
import { changeWord, changePosition } from "./actions";
import Highlighter from "react-highlight-words";
import { AppWrapper, AppContainer } from "./style/index";
import Gallery from "react-grid-gallery";

const App = () => {
  //most of thhis code is taken from https://github.com/vin-ni/Google-Cloud-Speech-Node-Socket-Playground/blob/79d0d2cb3ba0cad1e94b9f2e8350a3b15ce74f7b/src/app.js#L82
  const [endpoint, setEndpoint] = useState("http://localhost:3000");
  const [isRecording, start] = useState(false);
  const socket = socketIOClient(endpoint);
  const dispatch = useDispatch();
  const currentWord = useSelector((state) => state.word);
  const searchWords = currentWord.split(" ");
  let globalStream: { getTracks: () => any[] };

  let context, processor, source;
  const handleRecord = function () {
    socket.emit("startGoogleCloudStream", {
      config: {
        encoding: "LINEAR16",
        sampleRateHertz: 16000,
        languageCode: "en-US",
        profanityFilter: false,
        enableWordTimeOffsets: true,
      },
      interimResults: true, // If you want interim results, set this to true
    }); //init socket Google Speech Connection

    AudioContext = window.AudioContext;
    const context = new AudioContext();
    const processor = context.createScriptProcessor(2048, 1, 1);
    context.resume();

    processor.connect(context.destination);
    const handleSuccess = function (stream: any) {
      const source = context.createMediaStreamSource(stream);
      globalStream = stream;
      source.connect(processor);
      processor.onaudioprocess = function (e) {
        var left = e.inputBuffer.getChannelData(0);
        var left16 = convertFloat32ToInt16(left);
        socket.emit("binaryData", left16);
      };
    };

    navigator.mediaDevices
      .getUserMedia({ audio: true, video: false })
      .then(handleSuccess);
  };
  function stopRecord() {
    socket.emit("endGoogleCloudStream");

    globalStream.getTracks().forEach(function (track) {
      if (track.readyState == "live" && track.kind === "audio") {
        track.stop();
      }
    });
  }
  socket.on("connect", function (data) {
    socket.emit("join", "server connected to client");
  });
  socket.on("messages", function (data) {
    console.log(data);
  });

  socket.on("speechData", function (data) {
    var dataFinal = undefined || data.results[0].isFinal;

    if (dataFinal) {
      dispatch(changeWord(data.results[0].alternatives[0].transcript));
    }
  });

  function convertFloat32ToInt16(buffer) {
    let l = buffer.length;
    let buf = new Int16Array(l / 3);

    while (l--) {
      if (l % 3 == 0) {
        buf[l / 3] = buffer[l] * 0xffff;
      }
    }
    return buf.buffer;
  }

  return (
    <AppWrapper>
      <AppContainer>
        <Highlighter
          searchWords={searchWords}
          textToHighlight="The dog is chasing the cat. Or perhaps they're just playing?"
        />
        <div>
          <Button
            onClick={() => {
              handleRecord();
            }}
          >
            start
          </Button>
          <Button
            onClick={() => {
              stopRecord();
            }}
          >
            stop
          </Button>
        </div>
      </AppContainer>
    </AppWrapper>
  );
};

export default App;
