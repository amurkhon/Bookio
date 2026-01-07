import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { Order, Orders } from '../../libs/dto/order/order';
import { CreateOrderInput, OrdersInquiry, ConfirmPaymentInput } from '../../libs/dto/order/order.input';
import { OrderStatus, PaymentStatus } from '../../libs/enums/order.enum';
import { Message, Direction } from '../../libs/enums/common.enum';
import { PropertyService } from '../property/property.service';
import { PropertyStatus } from '../../libs/enums/property.enum';
import { shapeIntoMongoObjectId, lookupMember } from '../../libs/config';
import { T } from '../../libs/types/common';
import { v4 as uuidv4 } from 'uuid';
import * as moment from 'moment';
import { MemberService } from '../member/member.service';

@Injectable()
export class OrderService {
    constructor(
        @InjectModel('Order') private readonly orderModel: Model<Order>,
        private propertyService: PropertyService,
        private memberService: MemberService,
    ) {}

    public async createOrder(memberId: ObjectId, input: CreateOrderInput): Promise<Order> {
        // Validate and fetch properties
        const orderItems = [];
        let totalAmount = 0;

        for (const item of input.items) {
            const propertyId = shapeIntoMongoObjectId(item.propertyId);
            const property = await this.propertyService.getProperty(null, propertyId);

            if (property.propertyStatus !== PropertyStatus.ACTIVE) {
                throw new BadRequestException(`Property ${property.propertyTitle} is not available`);
            }

            // Check if user already purchased this property
            const existingOrder = await this.orderModel.findOne({
                memberId: memberId,
                'items.propertyId': propertyId,
                orderStatus: { $in: [OrderStatus.COMPLETED, OrderStatus.PROCESSING] },
                paymentStatus: PaymentStatus.PAID,
            }).exec();

            if (existingOrder) {
                throw new BadRequestException(`You have already purchased ${property.propertyTitle}`);
            }

            const itemTotal = property.propertyPrice * item.quantity;
            totalAmount += itemTotal;

            orderItems.push({
                propertyId: propertyId,
                propertyTitle: property.propertyTitle,
                propertyPrice: property.propertyPrice,
                quantity: item.quantity,
            });
        }

        if (orderItems.length === 0) {
            throw new BadRequestException(Message.BAD_REQUEST);
        }

        // Generate unique order number
        const orderNumber = `ORD-${Date.now()}-${uuidv4().substring(0, 8).toUpperCase()}`;

        // Create order
        const orderData = {
            orderNumber,
            memberId,
            items: orderItems,
            totalAmount,
            paymentMethod: input.paymentMethod,
            shippingAddress: input.shippingAddress,
            notes: input.notes,
            orderStatus: OrderStatus.PENDING,
            paymentStatus: PaymentStatus.PENDING,
        };

        try {
            const order = await this.orderModel.create(orderData);
            order.memberData = await this.memberService.getMember(null, memberId);
            return order;
        } catch (err) {
            console.log('Error creating order:', err.message);
            throw new BadRequestException(Message.CREATE_FAILED);
        }
    }

    public async getOrder(memberId: ObjectId, orderId: ObjectId): Promise<Order> {
        const order = await this.orderModel
            .findOne({
                _id: orderId,
                memberId: memberId,
            })
            .lean()
            .exec();

        if (!order) {
            throw new InternalServerErrorException(Message.NO_DATA_FOUND);
        }
        order.memberData = await this.memberService.getMember(null, memberId);

        return order;
    }

    public async getOrders(memberId: ObjectId, input: OrdersInquiry): Promise<Orders> {
        const match: T = { memberId: memberId };
        const sort: T = { [input?.sort ?? 'createdAt']: input?.direction ?? Direction.DESC };

        const { orderStatus, paymentStatus, orderNumber } = input.search || {};

        if (orderStatus) match.orderStatus = orderStatus;
        if (paymentStatus) match.paymentStatus = paymentStatus;
        if (orderNumber) match.orderNumber = { $regex: new RegExp(orderNumber, 'i') };

        const result = await this.orderModel
            .aggregate([
                { $match: match },
                { $sort: sort },
                {
                    $facet: {
                        list: [
                            { $skip: (input.page - 1) * input.limit },
                            { $limit: input.limit },
                            lookupMember,
                            { $unwind: '$memberData' },
                        ],
                        metaCounter: [{ $count: 'total' }],
                    },
                },
            ])
            .exec();

        if (!result.length) {
            throw new InternalServerErrorException(Message.NO_DATA_FOUND);
        }

        return result[0];
    }

    public async confirmPayment(memberId: ObjectId, input: ConfirmPaymentInput): Promise<Order> {
        const orderId = shapeIntoMongoObjectId(input.orderId);
        const order = await this.orderModel.findOne({
            _id: orderId,
            memberId: memberId,
        }).exec();

        if (!order) {
            throw new InternalServerErrorException(Message.NO_DATA_FOUND);
        }

        if (order.paymentStatus === PaymentStatus.PAID) {
            throw new BadRequestException('Order is already paid');
        }

        // Update order status
        const updatedOrder = await this.orderModel
            .findOneAndUpdate(
                { _id: orderId },
                {
                    paymentStatus: PaymentStatus.PAID,
                    orderStatus: OrderStatus.COMPLETED,
                    paymentIntentId: input.paymentIntentId,
                    completedAt: moment().toDate(),
                },
                { new: true },
            )
            .exec();

        if (!updatedOrder) {
            throw new InternalServerErrorException(Message.UPDATE_FAILED);
        }
        updatedOrder.memberData = await this.memberService.getMember(null, memberId);

        return updatedOrder;
    }

    public async cancelOrder(memberId: ObjectId, orderId: ObjectId): Promise<Order> {
        const order = await this.orderModel.findOne({
            _id: orderId,
            memberId: memberId,
        }).exec();

        if (!order) {
            throw new InternalServerErrorException(Message.NO_DATA_FOUND);
        }

        if (order.orderStatus === OrderStatus.COMPLETED) {
            throw new BadRequestException('Cannot cancel completed order');
        }

        const cancelledOrder = await this.orderModel
            .findOneAndUpdate(
                { _id: orderId },
                {
                    orderStatus: OrderStatus.CANCELLED,
                    cancelledAt: moment().toDate(),
                },
                { new: true },
            )
            .exec();

        if (!cancelledOrder) {
            throw new InternalServerErrorException(Message.UPDATE_FAILED);
        }
        cancelledOrder.memberData = await this.memberService.getMember(null, memberId);

        return cancelledOrder;
    }

    public async checkPurchase(memberId: ObjectId, propertyId: ObjectId): Promise<boolean> {
        const order = await this.orderModel.findOne({
            memberId: memberId,
            'items.propertyId': propertyId,
            orderStatus: OrderStatus.COMPLETED,
            paymentStatus: PaymentStatus.PAID,
        }).exec();

        return !!order;
    }

    public async getAllOrdersByAdmin(input: OrdersInquiry): Promise<Orders> {
        const match: T = {};
        const sort: T = { [input?.sort ?? 'createdAt']: input?.direction ?? Direction.DESC };

        const { orderStatus, paymentStatus, orderNumber } = input.search || {};

        if (orderStatus) match.orderStatus = orderStatus;
        if (paymentStatus) match.paymentStatus = paymentStatus;
        if (orderNumber) match.orderNumber = { $regex: new RegExp(orderNumber, 'i') };

        const result = await this.orderModel
            .aggregate([
                { $match: match },
                { $sort: sort },
                {
                    $facet: {
                        list: [
                            { $skip: (input.page - 1) * input.limit },
                            { $limit: input.limit },
                            lookupMember,
                            { $unwind: '$memberData' },
                        ],
                        metaCounter: [{ $count: 'total' }],
                    },
                },
            ])
            .exec();

        if (!result.length) {
            throw new InternalServerErrorException(Message.NO_DATA_FOUND);
        }

        return result[0];
    }
}
