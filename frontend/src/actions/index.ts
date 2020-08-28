export const changeWord = (word) => {
  return {
    type: "UPDATE",
    change: word,
  };
};
export const changeSpeech = (speech) => {
  return {
    type: "SPEECH",
    payload: speech,
  };
};
export const changePosition = () => {
  return {
    type: "POSITION",
  };
};
export const addWord = (payload) => {
  return {
    type: "CORRECT",
    payload: payload,
  };
};

export const changeRecording = () => {
  return {
    type: "RECORD",
  };
};
