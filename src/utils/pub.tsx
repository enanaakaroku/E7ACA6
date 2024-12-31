export function generateRandomId() {
	return `${Math.random().toString(36).slice(2, 11)}`;
}

export function setElementsKey(list: HTMLElement[]) {
	return list.map((v) => {
		if (!v.dataset.key) {
			v.dataset.key = generateRandomId();
		}
		return v;
	});
}
// 获取鼠标在元素中的相对坐标 (包含边框)
export function getMousePositionInElement(event: MouseEvent, element: HTMLElement) {
	const rect = element.getBoundingClientRect();
	return {
		x: event.clientX - rect.left, // 鼠标在元素内的X坐标
		y: event.clientY - rect.top, // 鼠标在元素内的Y坐标
	};
}
export function getMousePositionInElementArea(event: MouseEvent, element: HTMLElement) {
	const { x, y } = getMousePositionInElement(event, element);
	const { offsetWidth: w, offsetHeight: h } = element;
	// 将坐标系转成以元素中心为原点的直角坐标系
	const nx = x - w / 2;
	const ny = -y + h / 2;
	// 对角线系数
	const k = h / w;
	if (nx < 0 && ny > k * nx && ny <= -k * nx) {
		return "l";
	} else if (nx >= 0 && ny >= -k * nx && ny < k * nx) {
		return "r";
	} else if (ny >= 0 && nx > ny / -k && nx <= ny / k) {
		return "t";
	} else {
		return "b";
	}
}
export function insertAfter(newElement: HTMLElement, referenceElement: HTMLElement) {
	const parent = referenceElement.parentElement;
	if (referenceElement.nextSibling) {
		parent?.insertBefore(newElement, referenceElement.nextSibling);
	} else {
		parent?.appendChild(newElement);
	}
}
export function canSetDimensions(element: HTMLElement) {
	const computedStyle = window.getComputedStyle(element);

	// 直接检查不可设置宽高的 inline 元素
	if (computedStyle.display === "inline" && element.tagName !== "IMG") {
		return false;
	}
	return true;
}
export function checkElementAncestor(element: HTMLElement, ancestor: HTMLElement) {}
