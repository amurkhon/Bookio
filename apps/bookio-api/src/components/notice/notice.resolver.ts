import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { MemberType } from '../../libs/enums/member.enum';
import { Roles } from '../auth/decorators/roles.decorator';
import { NoticeService } from './notice.service';
import { Notice } from '../../libs/dto/notice/notice';
import { NoticeInput } from '../../libs/dto/notice/notice.input';
import { AuthMember } from '../auth/decorators/authMember.decorator';
import { ObjectId } from 'mongoose';

@Resolver()
export class NoticeResolver {

    constructor (
        private readonly noticeService: NoticeService,
    ) {}

    @Roles(MemberType.ADMIN)
    @UseGuards(RolesGuard)
    @Mutation((returns) => Notice)
    public async createNotice(
        @Args('input') input: NoticeInput,
        @AuthMember('_id') memberId: ObjectId
    ): Promise<Notice> {
        return await this.noticeService.createNotice(memberId, input);
    }
}
