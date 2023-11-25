// src/Editor.js
import { useState, useEffect } from "react";
import "./App.css";
import {
  Editor,
  EditorState,
  RichUtils,
  getDefaultKeyBinding,
  convertToRaw,
  convertFromRaw,
  CompositeDecorator,
} from "draft-js";
import "draft-js/dist/Draft.css";

// Define a custom inline style for red color
const RED_COLOR_STYLE = { color: "red" };

// Decorator to apply the custom inline style to text matching the pattern
const redColorDecorator = {
  strategy: (contentBlock, callback) => {
    contentBlock.findStyleRanges(
      (character) => character.hasStyle("RED_COLOR"),
      callback
    );
  },
  component: (props) => {
    return <span style={RED_COLOR_STYLE}>{props.children}</span>;
  },
};

const compositeDecorator = new CompositeDecorator([redColorDecorator]);

const App = () => {
  const [editorState, setEditorState] = useState(() => {
    // Load content from localStorage on component mount
    const savedContent = localStorage.getItem("editorContent");
    if (savedContent) {
      const contentState = convertFromRaw(JSON.parse(savedContent));
      return EditorState.createWithContent(contentState, compositeDecorator);
    }
    return EditorState.createEmpty(compositeDecorator);
  });

  useEffect(() => {
    // Save content to localStorage whenever editorState changes
    const contentState = editorState.getCurrentContent();
    const contentStateJSON = JSON.stringify(convertToRaw(contentState));
    localStorage.setItem("editorContent", contentStateJSON);
  }, [editorState]);

  const handleKeyCommand = (command, editorState) => {
    const newState = RichUtils.handleKeyCommand(editorState, command);

    if (newState) {
      setEditorState(newState);
      return "handled";
    }

    return "not-handled";
  };

  const mapKeyToEditorCommand = (e) => {
    if (e.key === "Tab") {
      const newEditorState = RichUtils.onTab(e, editorState, 4 /* maxDepth */);
      if (newEditorState !== editorState) {
        setEditorState(newEditorState);
      }
      return "handled";
    }
    return getDefaultKeyBinding(e);
  };

  const handleBeforeInput = (char, editorState) => {
    if (char === "#") {
      setEditorState(RichUtils.toggleBlockType(editorState, "header-one"));
      return "handled";
    } else if (char === "*") {
      console.log("inside bold");
      setEditorState(RichUtils.toggleInlineStyle(editorState, "BOLD"));
      return "handled";
    } else if (char === "**") {
      console.log("inside red color");
      setEditorState(RichUtils.toggleInlineStyle(editorState, "RED_COLOR"));
      return "handled";
    } else if (char === "***") {
      setEditorState(RichUtils.toggleInlineStyle(editorState, "UNDERLINE"));
      return "handled";
    }
    return "not-handled";
  };

  const handlePastedText = (text, html, editorState) => {
    if (text === "#") {
      setEditorState(RichUtils.toggleBlockType(editorState, "header-one"));
      return "handled";
    } else if (text === "*") {
      setEditorState(RichUtils.toggleInlineStyle(editorState, "BOLD"));
      return "handled";
    } else if (text.trim() === "**") {
      setEditorState(RichUtils.toggleInlineStyle(editorState, "RED_COLOR"));
      return "handled";
    } else if (text.trim() === "***") {
      setEditorState(RichUtils.toggleInlineStyle(editorState, "UNDERLINE"));
      return "handled";
    }
    return "not-handled";
  };

  return (
    <div>
      <div>
        <Editor
          editorState={editorState}
          handleKeyCommand={handleKeyCommand}
          keyBindingFn={mapKeyToEditorCommand}
          handleBeforeInput={(char, editorState) =>
            handleBeforeInput(char, editorState)
          }
          handlePastedText={(text, html, editorState) =>
            handlePastedText(text, html, editorState)
          }
          onChange={(newEditorState) => setEditorState(newEditorState)}
        />
      </div>
    </div>
  );
};

export default App;
