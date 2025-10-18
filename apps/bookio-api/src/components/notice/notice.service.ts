import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { NoticeInput, NoticeInquiry } from '../../libs/dto/notice/notice.input';
import { Notice, Notices } from '../../libs/dto/notice/notice';
import { Message } from '../../libs/enums/common.enum';
import { T } from '../../libs/types/common';
import { NoticeStatus } from '../../libs/enums/notice.enum';
import { UpdateNotice } from '../../libs/dto/notice/notice.update';

@Injectable()
export class NoticeService {

    constructor (
        @InjectModel('Notice') private readonly noticeModel: Model<Notice>,
    ) {}

    public async createNotice(memberId: ObjectId, input: NoticeInput): Promise<Notice> {
        input.memberId = memberId;
        try {
            return await this.noticeModel.create(input);
        } catch (err) {
            console.log("Error, createNotice: ", err.message);
            throw new BadRequestException(Message.CREATE_FAILED);
        }
    }

    public async getNotices(input: NoticeInquiry): Promise<Notices> {
        const { text } = input.search;
        const match: T = {noticeStatus: NoticeStatus.ACTIVE};
        const sort: T = { createdAt: -1};

        if(text) match.noticeTitle = { $regex: new RegExp(text, 'i') };

        const result = await this.noticeModel
            .aggregate([
                { $match: match },
                { $sort: sort },
                {
                    $facet: {
                        list: [{ $skip: (input.page - 1) * input.limit}, { $limit: input.limit }],
                        metaCounter: [{ $count: 'total' }],
                    }
                }
            ])
            .exec()
        if(!result.length) throw new InternalServerErrorException(Message.NO_DATA_FOUND);

        return result[0];
    }

    public async updateNotice(input: UpdateNotice): Promise<Notice> {
        const { _id, noticeStatus } = input;

        const result = await this.noticeModel.findOneAndUpdate({_id: _id},{ noticeStatus: noticeStatus}, { new: true}).exec();

        if(!result) throw new InternalServerErrorException(Message.UPDATE_FAILED);

        return result;
    }
}