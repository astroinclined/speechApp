import { combineReducers } from "redux";
import { isRegExp } from "util";

const wordReducer = (word = "", action) => {
  if (action.type === "UPDATE") {
    return word + " " + action.change;
  }
  return word;
};

const speechReducer = (speech = "", action) => {
  if (action.type === "SPEECH") {
    return action.payload;
  }
  return speech;
};
const positionReducer = (position = 0, action) => {
  if (action.type === "POSITION") {
    return (position += 1);
  }
  return position;
};

const correctReducer = (correctWords = "", action) => {
  if (action.type === "CORRECT") {
    return correctWords + action.payload;
  }
  return correctWords;
};

const recordReducer = (isRecording = false, action) => {
  if (action.type === "RECORD") {
    return !isRecording;
  }
  return isRecording;
};

export default combineReducers({
  word: wordReducer,
  speech: speechReducer,
  position: positionReducer,
  correctWords: correctReducer,
});
