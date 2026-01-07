import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { OrderService } from './order.service';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/guards/auth.guard';
import { AuthMember } from '../auth/decorators/authMember.decorator';
import { ObjectId } from 'mongoose';
import { Order, Orders } from '../../libs/dto/order/order';
import { CreateOrderInput, OrdersInquiry, ConfirmPaymentInput } from '../../libs/dto/order/order.input';
import { shapeIntoMongoObjectId } from '../../libs/config';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { MemberType } from '../../libs/enums/member.enum';

@Resolver()
export class OrderResolver {
    constructor(private readonly orderService: OrderService) {}

    @UseGuards(AuthGuard)
    @Mutation(() => Order)
    public async createOrder(
        @Args('input') input: CreateOrderInput,
        @AuthMember('_id') memberId: ObjectId,
    ): Promise<Order> {
        console.log('Mutation: createOrder');
        return await this.orderService.createOrder(memberId, input);
    }

    @UseGuards(AuthGuard)
    @Query(() => Order)
    public async getOrder(
        @Args('orderId') orderId: string,
        @AuthMember('_id') memberId: ObjectId,
    ): Promise<Order> {
        console.log('Query: getOrder');
        const id = shapeIntoMongoObjectId(orderId);
        return await this.orderService.getOrder(memberId, id);
    }

    @UseGuards(AuthGuard)
    @Query(() => Orders)
    public async getOrders(
        @Args('input') input: OrdersInquiry,
        @AuthMember('_id') memberId: ObjectId,
    ): Promise<Orders> {
        console.log('Query: getOrders');
        return await this.orderService.getOrders(memberId, input);
    }

    @UseGuards(AuthGuard)
    @Mutation(() => Order)
    public async confirmPayment(
        @Args('input') input: ConfirmPaymentInput,
        @AuthMember('_id') memberId: ObjectId,
    ): Promise<Order> {
        console.log('Mutation: confirmPayment');
        return await this.orderService.confirmPayment(memberId, input);
    }

    @UseGuards(AuthGuard)
    @Mutation(() => Order)
    public async cancelOrder(
        @Args('orderId') orderId: string,
        @AuthMember('_id') memberId: ObjectId,
    ): Promise<Order> {
        console.log('Mutation: cancelOrder');
        const id = shapeIntoMongoObjectId(orderId);
        return await this.orderService.cancelOrder(memberId, id);
    }

    @UseGuards(AuthGuard)
    @Query(() => Boolean)
    public async checkPurchase(
        @Args('propertyId') propertyId: string,
        @AuthMember('_id') memberId: ObjectId,
    ): Promise<boolean> {
        console.log('Query: checkPurchase');
        const id = shapeIntoMongoObjectId(propertyId);
        return await this.orderService.checkPurchase(memberId, id);
    }

    /* Admin */
    @Roles(MemberType.ADMIN)
    @UseGuards(RolesGuard)
    @Query(() => Orders)
    public async getAllOrdersByAdmin(
        @Args('input') input: OrdersInquiry,
    ): Promise<Orders> {
        console.log('Query: getAllOrdersByAdmin');
        return await this.orderService.getAllOrdersByAdmin(input);
    }
}
