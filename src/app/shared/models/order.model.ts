export class Order {
    _id?: string;
    user?: string;

    constructor(public products: Array<string> | string, public numbers: Array<number> | string) {}
}
