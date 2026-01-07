import { Module } from '@nestjs/common';
import { OrderResolver } from './order.resolver';
import { OrderService } from './order.service';
import { MongooseModule } from '@nestjs/mongoose';
import OrderSchema from '../../schemas/Order.model';
import { PropertyModule } from '../property/property.module';
import { AuthModule } from '../auth/auth.module';
import { PaymentModule } from '../payment/payment.module';
import { MemberModule } from '../member/member.module';

@Module({
    imports: [
        MongooseModule.forFeature([
            {
                name: 'Order',
                schema: OrderSchema,
            },
        ]),
        PropertyModule,
        AuthModule, 
        PaymentModule,
        MemberModule,
    ],
    providers: [OrderResolver, OrderService],
    exports: [OrderService],
})
export class OrderModule {}
