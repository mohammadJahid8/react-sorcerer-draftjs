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
  Modifier,
  convertToRaw,
} from "draft-js";
import "draft-js/dist/Draft.css";

const blockStyleFn = (contentBlock) => {
  const type = contentBlock.getType();
  if (type === "code-block") {
    return "code-block-style";
  }
  return "";
};

const RED_COLOR_STYLE = { color: "red" };

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
  const [loading, setLoading] = useState(false);
  const [editorState, setEditorState] = useState(() => {
    const savedContent = localStorage.getItem("editorContent");
    if (savedContent) {
      const contentState = convertFromRaw(JSON.parse(savedContent));
      return EditorState.createWithContent(contentState, compositeDecorator);
    }
    return EditorState.createEmpty(compositeDecorator);
  });

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

    const contentState = newEditorState.getCurrentContent();
    const lastBlock = contentState.getLastBlock();
    const lastBlockText = lastBlock.getText();

    if (lastBlockText.endsWith("# ") && lastBlockText.trim() === "#") {
      console.log("inside hash");
      setEditorState(RichUtils.toggleBlockType(newEditorState, "header-one"));
    } else if (lastBlockText.endsWith("* ") && lastBlockText.trim() === "*") {
      console.log("inside * ");
      setEditorState(RichUtils.toggleInlineStyle(newEditorState, "BOLD"));
    } else if (lastBlockText.endsWith("** ") && lastBlockText.trim() === "**") {
      console.log("inside **");
      setEditorState(RichUtils.toggleInlineStyle(newEditorState, "RED_COLOR"));
    } else if (
      lastBlockText.endsWith("*** ") &&
      lastBlockText.trim() === "***"
    ) {
      setEditorState(RichUtils.toggleInlineStyle(newEditorState, "UNDERLINE"));
    } else if (
      lastBlockText.endsWith("``` ") &&
      lastBlockText.trim() === "```"
    ) {
      // Handle code block logic
      console.log("inside code block");
      const currentContent = newEditorState.getCurrentContent();
      const selection = newEditorState.getSelection();
      const codeBlock = Modifier.splitBlock(currentContent, selection);
      const newContentState = Modifier.setBlockType(
        codeBlock,
        codeBlock.getSelectionAfter(),
        "code-block"
      );
      const newEditorStateWithCodeBlock = EditorState.push(
        newEditorState,
        newContentState,
        "split-block"
      );
      setEditorState(newEditorStateWithCodeBlock);
    }
    const contentStateJSON = JSON.stringify(convertToRaw(contentState));

    localStorage.setItem("editorContent", contentStateJSON);
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
    } else if (text.trim() === "``` ") {
      // Handle pasted code block
      console.log("paste code block");
      const currentContent = editorState?.getCurrentContent();
      const selection = editorState.getSelection();
      const codeBlock = Modifier.splitBlock(currentContent, selection);
      const newContentState = Modifier.setBlockType(
        codeBlock,
        codeBlock.getSelectionAfter(),
        "code-block"
      );
      const newEditorStateWithCodeBlock = EditorState.push(
        editorState,
        newContentState,
        "split-block"
      );
      setEditorState(newEditorStateWithCodeBlock);
      return "handled";
    }
    return "not-handled";
  };

  const handleSave = () => {
    setLoading(true);

    const contentState = editorState.getCurrentContent();
    const contentStateJSON = JSON.stringify(convertToRaw(contentState));

    // Save content to localStorage
    localStorage.setItem("editorContent", contentStateJSON);
    setTimeout(() => {
      setLoading(false);
    }, 1500);
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
        <button onClick={handleSave} className="save-button" disabled={loading}>
          {loading ? "SAVED" : "SAVE"}
        </button>
      </div>
      <div>
        <Editor
          editorState={editorState}
          handleKeyCommand={handleKeyCommand}
          keyBindingFn={mapKeyToEditorCommand}
          handlePastedText={(text, editorState) =>
            handlePastedText(text, editorState)
          }
          onChange={(newEditorState) => onEditorChange(newEditorState)}
          blockStyleFn={blockStyleFn}
        />
      </div>
    </div>
  );
};

export default App;
