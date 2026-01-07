import { Schema } from 'mongoose';
import { OrderStatus, PaymentStatus, PaymentMethod } from '../libs/enums/order.enum';

const OrderSchema = new Schema(
    {
        orderStatus: {
            type: String,
            enum: OrderStatus,
            default: OrderStatus.PENDING,
        },

        paymentStatus: {
            type: String,
            enum: PaymentStatus,
            default: PaymentStatus.PENDING,
        },

        orderNumber: {
            type: String,
            required: true,
            unique: true,
        },

        totalAmount: {
            type: Number,
            required: true,
        },

        memberId: {
            type: Schema.Types.ObjectId,
            required: true,
            ref: 'Member',
        },

        items: [{
            propertyId: {
                type: Schema.Types.ObjectId,
                required: true,
                ref: 'Property',
            },
            propertyTitle: {
                type: String,
                required: true,
            },
            propertyPrice: {
                type: Number,
                required: true,
            },
            quantity: {
                type: Number,
                default: 1,
            },
        }],

        paymentMethod: {
            type: String,
            enum: ['CARD', 'PAYPAL', 'WALLET'],
            default: 'CARD',
        },

        paymentId: {
            type: String,
            sparse: true,
        },

        paymentIntentId: {
            type: String,
            sparse: true,
        },

        transactionId: {
            type: String,
            sparse: true,
        },

        shippingAddress: {
            fullName: String,
            address: String,
            city: String,
            postalCode: String,
            country: String,
        },

        notes: {
            type: String,
        },

        completedAt: {
            type: Date,
        },

        cancelledAt: {
            type: Date,
        },
    },
    { timestamps: true, collection: 'orders' },
);

OrderSchema.index({ memberId: 1, createdAt: -1 });
OrderSchema.index({ orderNumber: 1 }, { unique: true });
OrderSchema.index({ paymentIntentId: 1 }, { sparse: true });

export default OrderSchema;