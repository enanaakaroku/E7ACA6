export type ElementBoxStyle = Pick<
	CSSStyleDeclaration,
	| "width"
	| "height"
	| "marginLeft"
	| "marginTop"
	| "marginRight"
	| "marginBottom"
	| "paddingLeft"
	| "paddingTop"
	| "paddingRight"
	| "paddingBottom"
	| "borderLeftWidth"
	| "borderLeftStyle"
	| "borderLeftColor"
	| "borderRightWidth"
	| "borderRightStyle"
	| "borderRightColor"
	| "borderTopWidth"
	| "borderTopStyle"
	| "borderTopColor"
	| "borderBottomWidth"
	| "borderBottomStyle"
	| "borderBottomColor"
	| "borderTopLeftRadius"
	| "borderTopRightRadius"
	| "borderBottomLeftRadius"
	| "borderBottomRightRadius"
	| "position"
>;

interface NodeProps {
	className?: string;
	style?: Record<string, string>;
	[key: string]: any; // 允许额外的自定义属性
}

interface TextNode {
	type: "text";
	id?: string;
	text: string;
	sortable: boolean;
}

interface ElementNode {
	type: string;
	props?: NodeProps;
	id?: string;
	children?: TreeNode[];
	sortable: boolean;
}

type TreeNode = TextNode | ElementNode;
