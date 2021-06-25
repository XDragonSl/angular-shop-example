import { Product } from './product';

export class ProductInBasket extends Product {
    number: number;

    constructor(product: Product) {
        super();
        this._id = product._id;
        this.name = product.name;
        this.cost = product.cost;
        this.number = 0;
    }
}
