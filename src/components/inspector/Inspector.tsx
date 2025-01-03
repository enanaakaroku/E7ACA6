"use client";

import { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import {
	canSetDimensions,
	createControlLayer,
	moveHandleEvent,
	removeControlLayer,
	resizeHandleEvent,
} from "@/utils/pub";
import { lengthUnitList, borderStyles } from "@/lib/utils";
import "@/styles/inspector.css";
import { Label } from "../ui/label";
import { InputWithSelect } from "../form-controls/InputWithSelect";
import { PlainSelect } from "../form-controls/PlainSelect";

export const Inspector = () => {
	const rteContainer = useRef<HTMLElement>(null);
	const [editingElement, setEditingElement] = useState<HTMLElement | null>(null);
	const [highlight] = useState<Element | null>(null);

	const handleEditElement = (event: React.MouseEvent<HTMLElement>) => {
		const target = event.target as HTMLElement;
		console.log(target);

		if (target === event.currentTarget) {
			// eslint-disable-next-line @typescript-eslint/no-unused-expressions
			editingElement && removeControlLayer(editingElement);
			setEditingElement(null);
			return;
		}
		if (!editingElement) {
			if (canSetDimensions(target)) {
				setEditingElement(target);
				createControlLayer(target);
			}
		} else {
			// 点了同一个
			if (target === editingElement) return;
			// 点了元素内部
			if (target.parentElement === editingElement) {
				// 点了handle
				if (target.dataset.handleType) {
					if (target.dataset.handleType === "move") {
						moveHandleEvent(event, target);
					} else if (target.dataset.handleType === "resize") {
						resizeHandleEvent(event, target);
					}
				} else {
					removeControlLayer(editingElement);
					if (canSetDimensions(target)) {
						setEditingElement(target);
						createControlLayer(target);
					}
				}
			}
			// 点了别的元素
			else {
				removeControlLayer(editingElement);
				if (canSetDimensions(target)) {
					setEditingElement(target);
					createControlLayer(target);
				}
			}
		}
	};

	useEffect(() => {
		if (highlight) {
			highlight.classList.add("ring-2", "ring-blue-500");
		}
		return () => {
			if (highlight) {
				highlight.classList.remove("ring-2", "ring-blue-500");
			}
		};
	}, [highlight]);

	return (
		<div className="border h-[600px] w-[900px] flex">
			<section className={clsx("glow")} ref={rteContainer} onMouseDown={handleEditElement}>
				<p>
					Lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptatum voluptas minus et maiores a,
					similique natus expedita tenetur quibusdam officia hic tempore atque iure odit error, veniam
					consequatur, sequi eligendi.
				</p>
			</section>
			<aside className="w-[260px] shrink-0 border-l px-2">
				{/* <div className="margin-area bg-orange-200">
						<div className="padding-area bg-green-200">
							<div className={clsx("content-area bg-blue-200")}>110 &times; 140</div>
						</div>
					</div> */}
				<div className="grid grid-cols-6 gap-x-2 gap-y-1">
					<div className="col-span-3">
						<Label htmlFor="width">Width</Label>
						<InputWithSelect
							id="width"
							type="number"
							min={0}
							defaultValue={0}
							selectOptions={lengthUnitList}
						/>
					</div>
					<div className="col-span-3">
						<Label htmlFor="height">Height</Label>
						<InputWithSelect
							id="height"
							type="number"
							min={0}
							defaultValue={0}
							selectOptions={lengthUnitList}
						/>
					</div>
					<Label className="col-span-6">Margin</Label>

					<div className="col-span-3 flex items-center space-x-1 justify-between">
						<Label className="shrink-0 w-3" htmlFor="margin-top" title="Top">
							T
						</Label>
						<InputWithSelect
							size="sm"
							id="margin-top"
							type="number"
							min={0}
							defaultValue={0}
							selectOptions={lengthUnitList}
						/>
					</div>
					<div className="col-span-3 flex items-center space-x-1 justify-between">
						<Label className="shrink-0 w-3" htmlFor="margin-right" title="Right">
							R
						</Label>
						<InputWithSelect
							size="sm"
							id="margin-right"
							type="number"
							min={0}
							defaultValue={0}
							selectOptions={lengthUnitList}
						/>
					</div>
					<div className="col-span-3 flex items-center space-x-1 justify-between">
						<Label className="shrink-0 w-3" htmlFor="margin-bottom" title="Bottom">
							B
						</Label>
						<InputWithSelect
							size="sm"
							id="margin-bottom"
							type="number"
							min={0}
							defaultValue={0}
							selectOptions={lengthUnitList}
						/>
					</div>
					<div className="col-span-3 flex items-center space-x-1 justify-between">
						<Label className="shrink-0 w-3" htmlFor="margin-left" title="Left">
							L
						</Label>
						<InputWithSelect
							size="sm"
							id="margin-left"
							type="number"
							min={0}
							defaultValue={0}
							selectOptions={lengthUnitList}
						/>
					</div>

					<Label className="col-span-6">Padding</Label>

					<div className="col-span-3 flex items-center space-x-1 justify-between">
						<Label className="shrink-0 w-3" htmlFor="padding-top" title="Top">
							T
						</Label>
						<InputWithSelect
							size="sm"
							id="padding-top"
							type="number"
							min={0}
							defaultValue={0}
							selectOptions={lengthUnitList}
						/>
					</div>
					<div className="col-span-3 flex items-center space-x-1 justify-between">
						<Label className="shrink-0 w-3" htmlFor="padding-right" title="Right">
							R
						</Label>
						<InputWithSelect
							size="sm"
							id="padding-right"
							type="number"
							min={0}
							defaultValue={0}
							selectOptions={lengthUnitList}
						/>
					</div>
					<div className="col-span-3 flex items-center space-x-1 justify-between">
						<Label className="shrink-0 w-3" htmlFor="padding-bottom" title="Bottom">
							B
						</Label>
						<InputWithSelect
							size="sm"
							id="padding-bottom"
							type="number"
							min={0}
							defaultValue={0}
							selectOptions={lengthUnitList}
						/>
					</div>
					<div className="col-span-3 flex items-center space-x-1 justify-between">
						<Label className="shrink-0 w-3" htmlFor="padding-left" title="Left">
							L
						</Label>
						<InputWithSelect
							size="sm"
							id="padding-left"
							type="number"
							min={0}
							defaultValue={0}
							selectOptions={lengthUnitList}
						/>
					</div>

					<Label className="col-span-6">Border</Label>

					<div className="col-span-6 flex items-center space-x-1 justify-between">
						<Label className="shrink-0 w-3" htmlFor="border-top" title="Top">
							T
						</Label>
						<InputWithSelect
							size="sm"
							id="border-top"
							type="number"
							min={0}
							defaultValue={0}
							selectOptions={lengthUnitList}
						/>
						<PlainSelect options={borderStyles} size="sm"></PlainSelect>
					</div>
					<div className="col-span-6 flex items-center space-x-1 justify-between">
						<Label className="shrink-0 w-3" htmlFor="border-right" title="Right">
							R
						</Label>
						<InputWithSelect
							size="sm"
							id="border-right"
							type="number"
							min={0}
							defaultValue={0}
							selectOptions={lengthUnitList}
						/>
					</div>
					<div className="col-span-6 flex items-center space-x-1 justify-between">
						<Label className="shrink-0 w-3" htmlFor="border-bottom" title="Bottom">
							B
						</Label>
						<InputWithSelect
							size="sm"
							id="border-bottom"
							type="number"
							min={0}
							defaultValue={0}
							selectOptions={lengthUnitList}
						/>
					</div>
					<div className="col-span-6 flex items-center space-x-1 justify-between">
						<Label className="shrink-0 w-3" htmlFor="border-left" title="Left">
							L
						</Label>
						<InputWithSelect
							size="sm"
							id="border-left"
							type="number"
							min={0}
							defaultValue={0}
							selectOptions={lengthUnitList}
						/>
					</div>
				</div>
			</aside>
		</div>
	);
};
