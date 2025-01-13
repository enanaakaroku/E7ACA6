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

interface ITreeNode {
	id: string; // 唯一标识
	type: string | null; // 节点类型，如 "div" 或 "p"
	props?: Record<string, any>; // 组件的 props（包括 style、className 等）
	children?: TreeNode[]; // 子节点列表
	text?: string; // 文本节点的内容
}
type TreeNode = {
	type: string;
	text?: string;
	children: TreeNode[];
	props?: { [key: string]: string }; // 用来存储元素的属性
	id: string; // 唯一的ID
};
