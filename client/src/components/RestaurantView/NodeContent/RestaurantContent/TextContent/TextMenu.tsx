import { Editor } from "@tiptap/react";
import "./TextMenu.scss";

interface IEditorProps {
  editor: Editor | null;
}

export const TextMenu = (props: IEditorProps) => {
  const { editor } = props;
  if (!editor) {
    return null;
  }

  // TODO: Add a menu of buttons for your text editor here
  return (
    // <div id="textMenu">
    //   {/* add bold button */}
    //   <button
    //     onClick={() => editor.chain().focus().toggleBold().run()}
    //     disabled={!editor.can().chain().focus().toggleBold().run()}
    //     className={
    //       "textEditorButton" +
    //       (editor.isActive("bold") ? " activeTextEditorButton" : "")
    //     }
    //   >
    //     Bold
    //   </button>

    //   {/* add italic button */}
    //   <button
    //     onClick={() => editor.chain().focus().toggleItalic().run()}
    //     disabled={!editor.can().chain().focus().toggleItalic().run()}
    //     className={
    //       "textEditorButton" +
    //       (editor.isActive("italic") ? " activeTextEditorButton" : "")
    //     }
    //   >
    //     Italic
    //   </button>

    //   {/* add code button */}
    //   <button
    //     onClick={() => editor.chain().focus().toggleCode().run()}
    //     disabled={!editor.can().chain().focus().toggleCode().run()}
    //     className={
    //       "textEditorButton" +
    //       (editor.isActive("code") ? " activeTextEditorButton" : "")
    //     }
    //   >
    //     Code
    //   </button>

    //   {/* add code block button */}
    //   <button
    //     onClick={() => editor.chain().focus().toggleCodeBlock().run()}
    //     disabled={!editor.can().chain().focus().toggleCodeBlock().run()}
    //     className={
    //       "textEditorButton" +
    //       (editor.isActive("codeblock") ? " activeTextEditorButton" : "")
    //     }
    //   >
    //     Code Block
    //   </button>

    //   {/* add strike button */}
    //   <button
    //     onClick={() => editor.chain().focus().toggleStrike().run()}
    //     disabled={!editor.can().chain().focus().toggleStrike().run()}
    //     className={
    //       "textEditorButton" +
    //       (editor.isActive("strike") ? " activeTextEditorButton" : "")
    //     }
    //   >
    //     Strike
    //   </button>

    //   {/* add bullet list button */}
    //   <button
    //     onClick={() => editor.chain().focus().toggleBulletList().run()}
    //     disabled={!editor.can().chain().focus().toggleBulletList().run()}
    //     className={
    //       "textEditorButton" +
    //       (editor.isActive("bulletList") ? " activeTextEditorButton" : "")
    //     }
    //   >
    //     BulletList
    //   </button>
    //   {/* add highlight button */}
    //   {/* <button
    //     onClick={() =>
    //       editor.chain().focus().toggleHighlight({ color: "#ffc078" }).run()
    //     }
    //     disabled={!editor.can().chain().focus().toggleHighlight().run()}
    //     className={
    //       "textEditorButton" +
    //       (editor.isActive("highlight") ? " activeTextEditorButton" : "")
    //     }
    //   >
    //     Highlight
    //   </button> */}
    // </div>
    <div id="textMenu">
    </div>
  );
};
