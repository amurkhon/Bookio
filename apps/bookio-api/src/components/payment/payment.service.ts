import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';

@Injectable()
export class PaymentService {
    private stripe: Stripe;

    constructor() {
        this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
            apiVersion: '2025-12-15.clover',
        });
    }

    public async createPaymentIntent(orderId: string, amount: number, currency: string = 'usd') {
        const paymentIntent = await this.stripe.paymentIntents.create({
            amount: Math.round(amount * 100), // Convert to cents
            currency: currency,
            metadata: {
                orderId: orderId,
            },
        });

        return paymentIntent;
    }

    public async confirmPayment(paymentIntentId: string) {
        const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId);
        return paymentIntent.status === 'succeeded';
    }

    public async handleWebhook(payload: any, signature: string) {
        const event = this.stripe.webhooks.constructEvent(
            payload,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET,
        );

        if (event.type === 'payment_intent.succeeded') {
            const paymentIntent = event.data.object;
            // Update order status
            // This would be called from a webhook endpoint
        }

        return event;
    }
}
