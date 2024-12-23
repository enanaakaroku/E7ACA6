"use client";
import { useCallback, useMemo, useState } from "react";
import { createEditor, Transforms, Element, Editor } from "slate";

import { Slate, Editable, withReact } from "slate-react";

const CustomEditor = {
	isBoldMarkActive(editor) {
		const marks = Editor.marks(editor);
		return marks ? marks.bold === true : false;
	},

	isCodeBlockActive(editor) {
		const [match] = Editor.nodes(editor, {
			match: (n) => n.type === "code",
		});

		return !!match;
	},

	toggleBoldMark(editor) {
		const isActive = CustomEditor.isBoldMarkActive(editor);
		if (isActive) {
			Editor.removeMark(editor, "bold");
		} else {
			Editor.addMark(editor, "bold", true);
		}
	},

	toggleCodeBlock(editor) {
		const isActive = CustomEditor.isCodeBlockActive(editor);
		Transforms.setNodes(
			editor,
			{ type: isActive ? null : "code" },
			{ match: (n) => Element.isElement(n) && Editor.isBlock(editor, n) }
		);
	},
};

export function EditPanel() {
	const [editor] = useState(() => withReact(createEditor()));

  const initialValue = useMemo(() => {
    if (typeof window !== "undefined") {
      return JSON.parse(localStorage.getItem("content") ?? "");
      
    }
return [
  {
    type: "paragraph",
    children: [{ text: "A line of text in a paragraph." }],
  },
]
  }, []);

	const renderElement = useCallback((props) => {
		switch (props.element.type) {
			case "code":
				return <CodeElement {...props} />;
			default:
				return <DefaultElement {...props} />;
		}
	}, []);

	const renderLeaf = useCallback((props) => {
		return <Leaf {...props} />;
	}, []);

	return (
		<div className="w-full h-full">
			<Slate
				editor={editor}
				initialValue={initialValue}
				onChange={(value) => {
					const isAstChange = editor.operations.some((op) => "set_selection" !== op.type);
					if (isAstChange) {
						// Save the value to Local Storage.
						const content = JSON.stringify(value);
						localStorage.setItem("content", content);
					}
				}}
			>
				<div>
					<button
						onMouseDown={(event) => {
							event.preventDefault();
							CustomEditor.toggleBoldMark(editor);
						}}
					>
						Bold
					</button>
					<button
						onMouseDown={(event) => {
							event.preventDefault();
							CustomEditor.toggleCodeBlock(editor);
						}}
					>
						Code Block
					</button>
				</div>
				<Editable
					renderElement={renderElement}
					renderLeaf={renderLeaf}
					onKeyDown={(event) => {
						if (!event.ctrlKey) {
							return;
						}
						console.log(event.key);

						switch (event.key) {
							case "`": {
								event.preventDefault();
								CustomEditor.toggleCodeBlock(editor);
								break;
							}

							case "b": {
								event.preventDefault();
								CustomEditor.toggleBoldMark(editor);
								break;
							}
						}
					}}
				/>
			</Slate>
		</div>
	);
}
const CodeElement = (props) => {
	return (
		<pre {...props.attributes}>
			<code>{props.children}</code>
		</pre>
	);
};

const DefaultElement = (props) => {
	return <p {...props.attributes}>{props.children}</p>;
};
const Leaf = (props) => {
	return (
		<span {...props.attributes} style={{ fontWeight: props.leaf.bold ? "bold" : "normal" }}>
			{props.children}
		</span>
	);
};
