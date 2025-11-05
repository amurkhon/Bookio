import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { NoticeInput, NoticeInquiry } from '../../libs/dto/notice/notice.input';
import { Notice, Notices } from '../../libs/dto/notice/notice';
import { Message } from '../../libs/enums/common.enum';
import { T } from '../../libs/types/common';
import { NoticeStatus } from '../../libs/enums/notice.enum';
import { UpdateNotice } from '../../libs/dto/notice/notice.update';
import { lookupMember } from '../../libs/config';
import { MemberService } from '../member/member.service';

@Injectable()
export class NoticeService {

    constructor (
        @InjectModel('Notice') private readonly noticeModel: Model<Notice>,
        private memberService: MemberService,
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

    public async getNotice( input: string): Promise<Notice> {
        const result =  await this.noticeModel.findOne({_id: input});
        if(!result) throw new InternalServerErrorException(Message.NO_DATA_FOUND);

        result.memberData = await this.memberService.getMember(null, result.memberId);

        return result;
    }

    public async getNotices(input: NoticeInquiry): Promise<Notices> {
        const { text, noticeCategory, noticeStatus } = input.search;
        const match: T = noticeStatus ? { noticeStatus: noticeStatus } : {};
        const sort: T = { createdAt: -1};

        if(text) match.noticeTitle = { $regex: new RegExp(text, 'i') };
        if(noticeCategory) match.noticeCategory = noticeCategory;

        const result = await this.noticeModel
            .aggregate([
                { $match: match },
                { $sort: sort },
                {
                    $facet: {
                        list: [
                            { $skip: (input.page - 1) * input.limit},
                            { $limit: input.limit },
                            lookupMember,
                            {$unwind: '$memberData'}
                        ],
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
        console.log("input",input);

        const result = await this.noticeModel.findOneAndUpdate({_id: _id},input, { new: true}).exec();

        if(!result) throw new InternalServerErrorException(Message.UPDATE_FAILED);

        return result;
    }
}