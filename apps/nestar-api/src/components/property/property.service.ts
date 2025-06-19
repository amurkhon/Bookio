import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PropertyInput } from '../../libs/dto/property/property.input';
import { Property } from '../../libs/dto/property/property';
import { Message } from '../../libs/enums/common.enum';
import { MemberService } from '../member/member.service';
import { StatisticModifier } from '../../libs/types/common';

@Injectable()
export class PropertyService {
    constructor(
        @InjectModel('Property') private readonly propertyModel: Model<null>,
        private memberSerivice: MemberService,
    ) {}

    public async createProperty(input: PropertyInput): Promise<Property> {
        try {
            const result: null | Property =  await this.propertyModel.create(input);
            const edit: StatisticModifier = {
                _id: result.memberId,
                targetKey: 'memberProperties',
                modifier: 1

            };
            await this.memberSerivice.memberStatsEditor(edit)
            return result;
        } catch (err) {
            console.log("Error, Service.model: ", err.message);
            throw new BadRequestException(Message.CREATE_FAILED);
        }
    }
}
