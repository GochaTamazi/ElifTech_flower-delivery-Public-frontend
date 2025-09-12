export interface Flower {
    Id: number;
    ShopId: number;
    Name: string;
    Description: string;
    Price: number;
    DateAdded: string;
    ImageUrl: string;
    IsFavorite: number;
}

export interface Shop {
    Id: number;
    Name: string;
}

export interface CartItem extends Omit<Flower, 'ShopId' | 'DateAdded'> {
    quantity: number;
}

export interface OrderForm {
    name: string;
    email: string;
    phone: string;
    address: string;
    DeliveryDateTime: string; // ISO string with timezone
}

export interface ShopResponse {
    Id: number;
    Name: string;
    Address: string;
    Latitude: number;
    Longitude: number;
    flowers: Flower[];
}
