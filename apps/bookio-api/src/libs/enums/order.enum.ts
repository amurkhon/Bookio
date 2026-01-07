import { registerEnumType } from '@nestjs/graphql';

export enum OrderStatus {
    PENDING = 'PENDING',
    PROCESSING = 'PROCESSING',
    COMPLETED = 'COMPLETED',
    CANCELLED = 'CANCELLED',
    REFUNDED = 'REFUNDED',
}

registerEnumType(OrderStatus, {
    name: 'OrderStatus',
});

export enum PaymentStatus {
    PENDING = 'PENDING',
    PROCESSING = 'PROCESSING',
    PAID = 'PAID',
    FAILED = 'FAILED',
    REFUNDED = 'REFUNDED',
}

registerEnumType(PaymentStatus, {
    name: 'PaymentStatus',
});

export enum PaymentMethod {
    CARD = 'CARD',
    PAYPAL = 'PAYPAL',
    WALLET = 'WALLET',
}

registerEnumType(PaymentMethod, {
    name: 'PaymentMethod',
});