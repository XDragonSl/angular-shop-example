import { Product } from '../interfaces/product.interface';

export class ProductInBasket implements Product {
    _id?: string
    cost: number;
    name: string;

    constructor(product: Product, public number: number = 0) {
        this._id = product._id;
        this.name = product.name;
        this.cost = product.cost;
    }
}
