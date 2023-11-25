// src/Editor.js
import { useState } from "react";
import "./App.css";
import {
  Editor,
  EditorState,
  RichUtils,
  getDefaultKeyBinding,
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
  const [currentText, setCurrentText] = useState();
  const [editorState, setEditorState] = useState(() => {
    // Load content from localStorage on component mount
    const savedContent = localStorage.getItem("editorContent");
    if (savedContent) {
      const contentState = convertFromRaw(JSON.parse(savedContent));
      return EditorState.createWithContent(contentState, compositeDecorator);
    }
    return EditorState.createEmpty(compositeDecorator);
  });

  // useEffect(() => {
  //   // Save content to localStorage whenever editorState changes
  //   const contentState = editorState.getCurrentContent();
  //   const contentStateJSON = JSON.stringify(convertToRaw(contentState));
  //   localStorage.setItem("editorContent", contentStateJSON);
  // }, [editorState]);

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

  const onEditorChange = (newEditorState) => {
    setEditorState(newEditorState);

    // Your logic to process the content goes here
    const contentState = newEditorState.getCurrentContent();
    const lastBlock = contentState.getLastBlock();
    const lastBlockText = lastBlock.getText();
    console.log("Current content:", lastBlockText);
    setCurrentText(lastBlockText);
  };

  const handleBeforeInput = (input, editorState) => {
    // console.log({ text });
    // if (text === "# ") {
    //   console.log("inside # ", text);
    //   setEditorState(RichUtils.toggleBlockType(editorState, "header-one"));
    //   return "handled";
    // } else if (text === "* ") {
    //   console.log("inside * ", text);
    //   setEditorState(RichUtils.toggleInlineStyle(editorState, "BOLD"));
    //   return "handled";
    // } else if (text === "** ") {
    //   console.log("inside ** ", text);
    //   setEditorState(RichUtils.toggleInlineStyle(editorState, "RED_COLOR"));
    //   return "handled";
    // } else if (text === "*** ") {
    //   console.log("inside *** ", text);
    //   setEditorState(RichUtils.toggleInlineStyle(editorState, "UNDERLINE"));
    //   return "handled";
    // }
    // return "not-handled";

    // const contentState = editorState.getCurrentContent();
    // const selection = editorState.getSelection();
    // const startKey = selection.getStartKey();
    // const currentContentBlock = contentState.getBlockForKey(startKey);
    // const text = currentContentBlock.getText();

    console.log(currentText);

    // Check if the input matches the desired patterns
    if (currentText === "# " && input === " ") {
      console.log("inside hash");
      setEditorState(RichUtils.toggleBlockType(editorState, "header-one"));
      return "handled";
    } else if (currentText === "* " && input === " ") {
      console.log("inside * ");
      setEditorState(RichUtils.toggleInlineStyle(editorState, "BOLD"));
      return "handled";
    } else if (currentText === "** " && input === " ") {
      console.log("inside **");
      setEditorState(RichUtils.toggleInlineStyle(editorState, "RED_COLOR"));
      return "handled";
    } else if (currentText.endsWith("*** ") && input === " ") {
      setEditorState(RichUtils.toggleInlineStyle(editorState, "UNDERLINE"));
      return "handled";
    }

    return "not-handled";
  };

  const handlePastedText = (text, html, editorState) => {
    if (text === "# ") {
      console.log("paste # ", text);
      setEditorState(RichUtils.toggleBlockType(editorState, "header-one"));
      return "handled";
    } else if (text === "* ") {
      console.log("paste * ", text);
      setEditorState(RichUtils.toggleInlineStyle(editorState, "BOLD"));
      return "handled";
    } else if (text === "** ") {
      console.log("paste ** ", text);
      setEditorState(RichUtils.toggleInlineStyle(editorState, "RED_COLOR"));
      return "handled";
    } else if (text === "*** ") {
      console.log("paste *** ", text);
      setEditorState(RichUtils.toggleInlineStyle(editorState, "UNDERLINE"));
      return "handled";
    }
    return "not-handled";
  };

  return (
    <div
      style={{
        maxWidth: "1100px",
        marginLeft: "auto",
        marginRight: "auto",
        marginTop: "30px",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "10px",
        }}
      >
        <h3>Demo editor by Mohammad Jahid</h3>
        <button className="save-button">Save</button>
      </div>
      <div>
        <Editor
          editorState={editorState}
          handleKeyCommand={handleKeyCommand}
          keyBindingFn={mapKeyToEditorCommand}
          handleBeforeInput={(text, editorState) =>
            handleBeforeInput(text, editorState)
          }
          handlePastedText={(text, editorState) =>
            handlePastedText(text, editorState)
          }
          onChange={(newEditorState) => onEditorChange(newEditorState)}
        />
      </div>
    </div>
  );
};

export default App;
