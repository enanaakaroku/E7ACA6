"use client";
import { useState } from "react";
import { createEditor } from "slate";

import { Slate, Editable, withReact } from "slate-react";
export function EditPanel() {
	const [editor] = useState(() => withReact(createEditor()));

	const initialValue = [
		{
			type: "paragraph",
			children: [{ text: "A line of text in a paragraph." }],
		},
	];
	return (
		<div>
			<Slate editor={editor} initialValue={initialValue}>
				<Editable />
			</Slate>
		</div>
	);
}
