import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { MemberType } from '../../libs/enums/member.enum';
import { Roles } from '../auth/decorators/roles.decorator';
import { NoticeService } from './notice.service';
import { Notice, Notices } from '../../libs/dto/notice/notice';
import { NoticeInput, NoticeInquiry } from '../../libs/dto/notice/notice.input';
import { AuthMember } from '../auth/decorators/authMember.decorator';
import { ObjectId } from 'mongoose';
import { UpdateNotice } from '../../libs/dto/notice/notice.update';

@Resolver()
export class NoticeResolver {

    constructor (
        private readonly noticeService: NoticeService,
    ) {}

    @UseGuards(AuthGuard)
    @Mutation((returns) => Notice)
    public async createNotice(
        @Args('input') input: NoticeInput,
        @AuthMember('_id') memberId: ObjectId
    ): Promise<Notice> {
        return await this.noticeService.createNotice(memberId, input);
    }

    @UseGuards(AuthGuard)
    @Query((returns) => Notices)
    public async getNotices(
        @Args('input') input: NoticeInquiry,
    ): Promise<Notices> {
        return await this.noticeService.getNotices(input);
    }

    @Roles(MemberType.ADMIN)
    @UseGuards(RolesGuard)
    @Mutation((returns) => Notice)
    public async updateNotice(
        @Args('input') input: UpdateNotice,
    ): Promise<Notice> {
        return await this.noticeService.updateNotice(input);
    }
}
