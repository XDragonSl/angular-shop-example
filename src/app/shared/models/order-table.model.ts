import { ProductInBasket } from './product-in-basket.model';
import { Order } from './order.model';

export class OrderTable {
    _id: string;
    user: string;

    constructor(order: Order, public products: Array<ProductInBasket> = new Array<ProductInBasket>()) {
        this._id = order._id!;
        this.user = order.user!;
    }
}
