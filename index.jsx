import React, { useState, useEffect } from "react";
import { render, Box, Text, useInput } from "ink";
import fs, { stat } from "fs";
import path from "path";
import { clear } from "console";

const TypingGame = () => {
  const [referenceText, setReferenceText] = useState("");
  const [typedText, setTypedText] = useState("");
  const [startTime, setStartTime] = useState(null);
  const [errors, setErrors] = useState(0);
  const [stats, setStats] = useState({ wpm: -1, accuracy: 1 });
  const [gameStatus, setGameStatus] = useState("");

  useEffect(() => {
    fs.readdir("./texts", (err, files) => {
      if (err) {
        console.log("Error loading files:", err);
        return;
      }
      const randomFile = files[Math.floor(Math.random() * files.length)];
      fs.readFile(path.join("./texts", randomFile), "utf8", (err, data) => {
        if (err) {
          console.log("Error reading file:", err);
          return;
        }
        setReferenceText(data);
      });
    });
  }, []);

  useEffect(() => {
    // This is so that gameStatus does not go to "started" at the first Frame
    if (gameStatus === "") {
      setGameStatus("init");
    }

    // If we haven't started the game, start it
    if (gameStatus === "init") {
      setGameStatus("started");
      setStartTime(new Date());
    }

    // If the entire passage is typed correctly, the game is over.
    if (gameStatus === "started" && typedText === referenceText) {
      const endTime = new Date();
      const timeTaken = (endTime - startTime) / 60000;
      const wordCount = referenceText.split(" ").length;
      const characterCount = referenceText.length;
      const wpm = timeTaken ? Math.round(wordCount / timeTaken) : 0;
      const accuracy = 1 - errors / characterCount;

      setStats({ wpm, accuracy });
      setGameStatus("completed");
    }
  }, [typedText]);

  useInput((input, key) => {
    if (key.escape) {
      process.exit();
      return;
    }

    // When the game is completed, we won't accept any input
    if (gameStatus === "completed") {
      return;
    }

    const isBackspace = key.backspace || key.delete;
    const isDeleteWord =
      (key.ctrl && isBackspace) || (key.ctrl && input === "w");

    if (isDeleteWord) {
      const parts = typedText.trimEnd().split(" ");
      const newText =
        parts.length > 1 ? parts.slice(0, -1).join(" ") + " " : "";
      setTypedText(newText);
      return;
    }

    if (isBackspace) {
      setTypedText((typedText) => typedText.slice(0, -1));
      return;
    }

    // ELSE: An input character is typed

    setTypedText((typedText) => typedText + input);

    if (input !== referenceText[typedText.length]) {
      setErrors((errors) => errors + 1);
    }
  });

  const displayText = () => {
    let result = [];
    for (let i = 0; i < referenceText.length; i++) {
      const char = referenceText[i];
      const typedChar = typedText[i];
      const correct = char === typedChar;
      const atCursor = i === typedText.length;
      const textProps = { key: i };

      if (i < typedText.length) {
        if (correct) {
          textProps.children = typedChar;
        } else {
          textProps.children = typedChar || " ";
          textProps.color = "red";
          textProps.backgroundColor = atCursor ? "white" : undefined;
          textProps.underline = true;
        }
      } else {
        textProps.children = char;
        textProps.dimColor = true;
        textProps.inverse = atCursor;
      }

      result.push(<Text {...textProps} />);
    }
    return result;
  };

  return (
    <Box flexDirection="column">
      <Box flexDirection="column">
        <Text>Game Status: {gameStatus}</Text>
        <Text>Start time: {startTime && startTime.toString()}</Text>
      </Box>
      <Box paddingX={2} borderStyle="single" flexDirection="row" width={50} flexWrap="wrap">
        {displayText()}
      </Box>
      {gameStatus === "completed" && (
        <Box flexDirection="column">
          <Text>WPM: {stats.wpm}</Text>
          <Text>Accuracy: {Math.round(stats.accuracy * 1000) / 10}%</Text>
        </Box>
      )}
    </Box>
  );
};

clear();

render(<TypingGame />);
