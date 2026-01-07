import { Field, ObjectType } from '@nestjs/graphql';
import { OrderStatus, PaymentStatus, PaymentMethod } from '../../enums/order.enum';
import { Member, TotalCounter } from '../member/member';
import { Property } from '../property/property';

@ObjectType()
export class OrderItem {
    @Field(() => String)
    propertyId: string;

    @Field(() => String)
    propertyTitle: string;

    @Field(() => Number)
    propertyPrice: number;

    @Field(() => Number)
    quantity: number;

    @Field(() => Property, { nullable: true })
    propertyData?: Property;
}

@ObjectType()
export class ShippingAddress {
    @Field(() => String, { nullable: true })
    fullName?: string;

    @Field(() => String, { nullable: true })
    address?: string;

    @Field(() => String, { nullable: true })
    city?: string;

    @Field(() => String, { nullable: true })
    postalCode?: string;

    @Field(() => String, { nullable: true })
    country?: string;
}

@ObjectType()
export class Order {
    @Field(() => String)
    _id: string;

    @Field(() => OrderStatus)
    orderStatus: OrderStatus;

    @Field(() => PaymentStatus)
    paymentStatus: PaymentStatus;

    @Field(() => String)
    orderNumber: string;

    @Field(() => Number)
    totalAmount: number;

    @Field(() => String)
    memberId: string;

    @Field(() => [OrderItem])
    items: OrderItem[];

    @Field(() => PaymentMethod)
    paymentMethod: PaymentMethod;

    @Field(() => String, { nullable: true })
    paymentId?: string;

    @Field(() => String, { nullable: true })
    paymentIntentId?: string;

    @Field(() => String, { nullable: true })
    transactionId?: string;

    @Field(() => ShippingAddress, { nullable: true })
    shippingAddress?: ShippingAddress;

    @Field(() => String, { nullable: true })
    notes?: string;

    @Field(() => Date, { nullable: true })
    completedAt?: Date;

    @Field(() => Date, { nullable: true })
    cancelledAt?: Date;

    @Field(() => Date)
    createdAt: Date;

    @Field(() => Date)
    updatedAt: Date;

    @Field(() => Member, { nullable: true })
    memberData?: Member;
}

@ObjectType()
export class Orders {
    @Field(() => [Order])
    list: Order[];

    @Field(() => [TotalCounter], { nullable: true })
    metaCounter: TotalCounter[];
}