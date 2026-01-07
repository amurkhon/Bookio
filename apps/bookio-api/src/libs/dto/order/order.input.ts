import { Field, InputType, Int } from '@nestjs/graphql';
import { IsNotEmpty, IsArray, ValidateNested, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { PaymentMethod } from '../../enums/order.enum';

@InputType()
export class OrderItemInput {
    @IsNotEmpty()
    @Field(() => String)
    propertyId: string;

    @Field(() => Int, { defaultValue: 1 })
    @Min(1)
    quantity: number;
}

@InputType()
export class ShippingAddressInput {
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

@InputType()
export class CreateOrderInput {
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => OrderItemInput)
    @Field(() => [OrderItemInput])
    items: OrderItemInput[];

    @Field(() => PaymentMethod, { defaultValue: PaymentMethod.CARD })
    paymentMethod: PaymentMethod;

    @Field(() => ShippingAddressInput, { nullable: true })
    shippingAddress?: ShippingAddressInput;

    @Field(() => String, { nullable: true })
    notes?: string;
}

@InputType()
export class OrdersSearchInput {
    @Field(() => String, { nullable: true })
    orderStatus?: string;

    @Field(() => String, { nullable: true })
    paymentStatus?: string;

    @Field(() => String, { nullable: true })
    orderNumber?: string;
}

@InputType()
export class OrdersInquiry {
    @Field(() => Int, { defaultValue: 1 })
    page: number;

    @Field(() => Int, { defaultValue: 10 })
    limit: number;

    @Field(() => String, { nullable: true })
    sort?: string;

    @Field(() => Int, { nullable: true })
    direction?: number;

    @Field(() => OrdersSearchInput, { nullable: true })
    search?: OrdersSearchInput;
}

@InputType()
export class ConfirmPaymentInput {
    @IsNotEmpty()
    @Field(() => String)
    orderId: string;

    @IsNotEmpty()
    @Field(() => String)
    paymentIntentId: string;
}