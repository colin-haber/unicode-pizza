"use strict";
interface String {
	applyShiftMaps(...maps: Array<ShiftMapping>): string;
}
class ShiftMapping {
	validate: (codepoint: number) => boolean;
	shift: (codepoint: number) => number;
	constructor(validator: (codepoint: number) => boolean, shifter: (codepoint: number) => number) {
		this.validate = validator;
		this.shift = shifter;
	}
}
class OffsetRangeMapping extends ShiftMapping {
	constructor(min: number, max: number, offset: number) {
		super(
			(codepoint: number) => min <= codepoint && codepoint <= max,
			(codepoint: number) => codepoint + offset
		);
	}
}
String.prototype.applyShiftMaps = function (this: string, ...maps: Array<ShiftMapping>) {
	const codepoints = new Array<number>();
	for (let si = 0, ci = 0; si < this.length; si++) {
		let codepoint = this.charCodeAt(si);
		if (0xD800 <= codepoint && codepoint <= 0xDBFF) {
			si++;
			codepoint = (codepoint - 0xD800) * 0x400 + this.charCodeAt(si) - 0xDC00 + 0x10000;
		}
		codepoints[ci] = codepoint;
		ci++;
	}
	for (const map of maps) {
		for (let i = 0; i < codepoints.length; i++) {
			if (map.validate(codepoints[i])) {
				codepoints[i] = map.shift(codepoints[i]);
			}
		}
	}
	return String.fromCodePoint(...codepoints);
}
class Topping {
	isEnabled: boolean;
	opposites: Topping[];
	transform: (text: string) => string;
	constructor(transform: (text: string) => string) {
		this.opposites = new Array<Topping>();
		this.isEnabled = false;
		this.transform = transform;
	}
}

var toppings = {
	/* ASCII */
	uppercase: new Topping(String.prototype.toUpperCase),
	lowercase: new Topping(String.prototype.toLowerCase),
	/* Exclusive */
	doublestruck: new Topping((text: string) => text.applyShiftMaps(
		new OffsetRangeMapping(0x30, 0x39, 0x1D7D8 - 0x30),
		new OffsetRangeMapping(0x41, 0x5A, 0x1D538 - 0x41),
		new OffsetRangeMapping(0x61, 0x7A, 0x1D552 - 0x61),
	)),
	fraktur: new Topping((text: string) => text.applyShiftMaps(
		new OffsetRangeMapping(0x41, 0x5A, 0x1D504 - 0x41),
		new OffsetRangeMapping(0x61, 0x7A, 0x1D51E - 0x61),
	)),
	fullwidth: new Topping((text: string) => text.applyShiftMaps(
		new OffsetRangeMapping(0x20, 0x20, 0x3000 - 0x20),
		new OffsetRangeMapping(0x21, 0x7E, 0xFF01 - 0x21),
	)),
	mono: new Topping((text: string) => text.applyShiftMaps(
		new OffsetRangeMapping(0x30, 0x39, 0x1D7F6 - 0x30),
		new OffsetRangeMapping(0x41, 0x5A, 0x1D670 - 0x41),
		new OffsetRangeMapping(0x61, 0x7A, 0x1D68A - 0x61),
	)),
	sans: new Topping((text: string) => text.applyShiftMaps(
		new OffsetRangeMapping(0x30, 0x39, 0x1D7E2 - 0x30),
		new OffsetRangeMapping(0x41, 0x5A, 0x1D5A0 - 0x41),
		new OffsetRangeMapping(0x61, 0x7A, 0x1D5BA - 0x61),
	)),
	script: new Topping((text: string) => text.applyShiftMaps(
		new OffsetRangeMapping(0x41, 0x5A, 0x1D49C - 0x41),
		new OffsetRangeMapping(0x61, 0x7A, 0x1D4B6 - 0x61),
	)),
	/* Combining */
	bold: new Topping((text: string) => text.applyShiftMaps(
		new OffsetRangeMapping(   0x30,    0x39, 0x1D7CE -    0x30), // Numerals
		new OffsetRangeMapping(   0x41,    0x5A, 0x1D400 -    0x41), // Uppercase
		new OffsetRangeMapping(   0x61,    0x7A, 0x1D41A -    0x61), // Lowercase
		new OffsetRangeMapping(0x1D49C, 0x1D4CF, 0x1D4D0 - 0x1D49C), // Script
		new OffsetRangeMapping(0x1D504, 0x1D537, 0x1D56C - 0x1D504), // Fraktur
		new OffsetRangeMapping(0x1D5A0, 0x1D5D3, 0x1D5D4 - 0x1D5A0), // Sans
		new OffsetRangeMapping(0x1D7E2, 0x1D7EB, 0x1D7EC - 0x1D7E2), // Sans numerals
	)),
	italic: new Topping((text: string) => text.applyShiftMaps(
		new OffsetRangeMapping(   0x41,    0x5A, 0x1D434 -    0x41), // Uppercase
		new OffsetRangeMapping(   0x61,    0x7A, 0x1D44E -    0x61), // Lowercase
		new OffsetRangeMapping(0x1D400, 0x1D433, 0x1D468 - 0x1D400), // Bold
		new OffsetRangeMapping(0x1D5A0, 0x1D5D3, 0x1D608 - 0x1D5A0), // Sans
		new OffsetRangeMapping(0x1D5D4, 0x1D607, 0x1D63C - 0x1D5D4), // Sans bold
	)),
}
toppings.uppercase.opposites.push(toppings.lowercase);
toppings.lowercase.opposites.push(toppings.uppercase);
const exclusiveTransforms = [
	toppings.doublestruck,
	toppings.fraktur,
	toppings.fullwidth,
	toppings.mono,
	toppings.sans,
	toppings.script,
];
exclusiveTransforms.forEach((topping: Topping) => topping.opposites.push(...exclusiveTransforms.filter((oppTopping: Topping) => topping !== oppTopping)));
toppings.doublestruck.opposites.push(toppings.bold, toppings.italic);
toppings.fraktur.opposites.push(toppings.italic);
toppings.fullwidth.opposites.push(toppings.bold, toppings.italic);
toppings.mono.opposites.push(toppings.bold, toppings.italic);
toppings.script.opposites.push(toppings.italic);
toppings.bold.opposites.push(toppings.doublestruck, toppings.fullwidth, toppings.mono);
toppings.italic.opposites.push(toppings.doublestruck, toppings.fraktur, toppings.fullwidth, toppings.mono, toppings.script);

navigator.serviceWorker.register("/worker.js");
document.forms.namedItem("pizza").addEventListener("submit", function (event: Event) {
	event.preventDefault();
});
const updateToggleStates = function () {
	Object.keys(toppings).forEach((key: string) => {
		const topping = <Topping>toppings[key];
		const toggle = <HTMLButtonElement>document.querySelector(`button[data-topping=${key}]`);
		if (toggle) {
			toggle.disabled = new Boolean(topping.opposites.find(opposite => opposite.isEnabled)).valueOf();
		} else {
			console.error(`No toggle with the name "${key}".`, topping);
		}
	});
};
const input = <HTMLTextAreaElement>document.querySelector("#pizza-input");
const output = <HTMLTextAreaElement>document.querySelector("#pizza-output");
const updateOutputText = function () {
	output.value = Object.values(toppings).filter((topping: Topping) => topping.isEnabled).reduce((text: String, topping: Topping) => topping.transform.apply(text, [text]), input.value);
};
input.addEventListener("input", updateOutputText);
document.querySelectorAll("button[data-topping]").forEach((toggle: HTMLButtonElement) => {
	const toppingName = toggle.dataset["topping"];
	if (toppings[toppingName]) {
		const name = toggle.textContent;
		toggle.title = name;
		toggle.textContent = toppings[toppingName].transform.apply(name, [name]);
		toggle.addEventListener("click", function (event: Event) {
			const topping = <Topping>toppings[this.dataset["topping"]];
			topping.isEnabled = this.classList.toggle("_enabled");
			updateToggleStates();
			updateOutputText();
		});
	} else {
		toggle.classList.add("_error");
		toggle.disabled = true;
		console.error(`No topping with the name "${toppingName}".`, toggle);
	}
});
updateToggleStates();
updateOutputText();
