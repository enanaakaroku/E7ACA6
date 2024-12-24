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
