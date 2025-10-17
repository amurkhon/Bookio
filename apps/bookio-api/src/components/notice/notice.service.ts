import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { NoticeInput } from '../../libs/dto/notice/notice.input';
import { Notice } from '../../libs/dto/notice/notice';
import { Message } from '../../libs/enums/common.enum';

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
}
