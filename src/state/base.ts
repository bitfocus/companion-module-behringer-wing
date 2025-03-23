export class OSCLeaf<T> {
	value: T | undefined = undefined

	constructor(public path: string) {}

	getPath(): string {
		return this.path
	}
}

export class BooleanLeaf extends OSCLeaf<boolean> {}
export class NumberLeaf extends OSCLeaf<number> {}
export class StringLeaf extends OSCLeaf<string> {}
