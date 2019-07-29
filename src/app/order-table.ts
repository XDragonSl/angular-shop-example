import { ProductInBasket } from './product-in-basket';

export class OrderTable {
    _id: string;
    products: Array<ProductInBasket>;
    user: string;
}
