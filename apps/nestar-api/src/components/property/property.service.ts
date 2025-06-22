import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { PropertyInput } from '../../libs/dto/property/property.input';
import { Property } from '../../libs/dto/property/property';
import { Message } from '../../libs/enums/common.enum';
import { MemberService } from '../member/member.service';
import { StatisticModifier, T } from '../../libs/types/common';
import { PropertyStatus } from '../../libs/enums/property.enum';
import { ViewService } from '../view/view.service';
import { ViewInput } from '../../libs/dto/view/view.input';
import { ViewGroup } from '../../libs/enums/view.enum';
import { PropertyUpdateInput } from '../../libs/dto/property/property.update';
import * as moment from 'moment';

@Injectable()
export class PropertyService {
    constructor(
        @InjectModel('Property') private readonly propertyModel: Model<Property>,
        private memberSerivice: MemberService,
        private viewService: ViewService,
    ) {}

    public async createProperty(input: PropertyInput): Promise<Property> {
        try {
            const result: Property =  await this.propertyModel.create(input);
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

    public async getProperty(
        memberId: ObjectId,
        propertyId: ObjectId
    ): Promise<Property> {
        const search: T = {
            _id: propertyId,
            propertyStatus: PropertyStatus.ACTIVE,
        }
        const targetProperty: Property = await this.propertyModel
            .findOne(search)
            .lean()
            .exec();
        if(!targetProperty) throw new InternalServerErrorException(Message.NO_DATA_FOUND)

        if(memberId) {
            // check and create view
            const viewInput: ViewInput = {
                viewGroup: ViewGroup.PROPERTY,
                viewRefId: targetProperty._id,
                memberId: memberId,

            }
            const view = await this.viewService.recordView(viewInput);

            if(view) {
                await this.propertyStatsEditor({
                    _id: propertyId,
                    targetKey: 'propertyViews',
                    modifier: 1,
                });
                targetProperty.propertyViews++;
            }
            // me likied
        }
        targetProperty.memberData = await this.memberSerivice.getMember(null, targetProperty.memberId);
        return targetProperty;
    }

    public async updateProperty(memberId: ObjectId, input: PropertyUpdateInput): Promise<Property> {
        
        let {propertyStatus, soldAt, deletedAt} = input;
        
        const search: T = {
            _id: input._id,
            memberId: memberId,
            propertyStatus: PropertyStatus.ACTIVE,
        };

        if(propertyStatus === PropertyStatus.SOLD) input.soldAt = moment().toDate();
        else if (propertyStatus === PropertyStatus.DELETE) input.deletedAt = moment().toDate();

        const updatedProperty: Property = await this.propertyModel
            .findOneAndUpdate(search, input, {new: true})
            .exec();

        if(!updatedProperty) throw new InternalServerErrorException(Message.UPDATE_FAILED);
        
        if(soldAt || deletedAt) {
            await this.memberSerivice.memberStatsEditor({
                _id: memberId,
                targetKey: 'memberProperties',
                modifier: -1,
            });
        }

        return updatedProperty;
    }

    public async propertyStatsEditor(input: StatisticModifier): Promise<Property> {
            const { _id, targetKey, modifier } = input;
            return await this.propertyModel.findOneAndUpdate(
                _id,
                {$inc: {[targetKey]: modifier}},
                {new: true}
            )
            .exec();
        }
}
