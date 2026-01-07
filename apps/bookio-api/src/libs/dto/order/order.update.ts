import { Field, InputType } from '@nestjs/graphql';
import { OrderStatus, PaymentStatus } from '../../enums/order.enum';

@InputType()
export class OrderUpdate {
    @Field(() => String)
    _id: string;

    @Field(() => OrderStatus, { nullable: true })
    orderStatus?: OrderStatus;

    @Field(() => PaymentStatus, { nullable: true })
    paymentStatus?: PaymentStatus;

    @Field(() => String, { nullable: true })
    paymentId?: string;

    @Field(() => String, { nullable: true })
    transactionId?: string;

    @Field(() => String, { nullable: true })
    notes?: string;
}