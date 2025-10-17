import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { MemberService } from '../member/member.service';
import { PropertyService } from '../property/property.service';
import { BoardArticleService } from '../board-article/board-article.service';
import { CommentInput, CommentsInquiry } from '../../libs/dto/comment/comment.input';
import { Comment, Comments } from '../../libs/dto/comment/comment';
import { Direction, Message } from '../../libs/enums/common.enum';
import { T } from '../../libs/types/common';
import { CommentGroup, CommentStatus } from '../../libs/enums/comment.enum';
import { CommentUpdate } from '../../libs/dto/comment/comment.update';
import { lookupMember, shapeIntoMongoObjectId } from '../../libs/config';
import { NotificationService } from '../notification/notification.service';
import { NotificationInput } from '../../libs/dto/notification/notification.input';
import { NotificationGroup, NotificationType } from '../../libs/enums/notification.enum';
import { Property } from '../../libs/dto/property/property';
import { Member } from '../../libs/dto/member/member';
import { BoardArticle } from '../../libs/dto/board-article/board-article';

@Injectable()
export class CommentService {
    
    constructor(
        @InjectModel('Comment') private readonly commentModel: Model<Comment>,
        @InjectModel('Property') private readonly propertyModel: Model<Property>,
        @InjectModel('Member') private readonly memberModel: Model<Member>,
        @InjectModel('BoardArticle') private readonly boardArticleModel: Model<BoardArticle>,
        private readonly memberService: MemberService,
        private readonly propertyService: PropertyService,
        private readonly boardArticleService: BoardArticleService,
        private readonly notificationService: NotificationService,
    ) {}

    public async createComment (memberId: ObjectId, input: CommentInput): Promise<Comment> {
        input.memberId = memberId;

        let result = null;
        let property = null;
        let member = null;
        let article = null;
        try {
            result = await this.commentModel.create(input);
            if( input.commentGroup === 'PROPERTY') {
                property = await this.propertyModel.findOne({_id: input.commentRefId}).exec();
            } else if ( input.commentGroup === 'MEMBER') {
                member = await this.memberModel.findOne({_id: input.commentRefId})
            } else {
                article = await this.boardArticleModel.findOne({_id: input.commentRefId})
            }
        } catch (err) {
            console.log("Error, createComment", err.message);
            throw new BadRequestException(Message.CREATE_FAILED);
        }

        switch (input.commentGroup) {
            case CommentGroup.PROPERTY:

                const notificationPropertyInput: NotificationInput = {
                    notificationType: NotificationType.COMMENT,
                    notificationGroup: NotificationGroup.PROPERTY,
                    notificationTitle:'Comment property',
                    receiverId: shapeIntoMongoObjectId(property.memberId),
                    propertyId: shapeIntoMongoObjectId(input.commentRefId),
                    notificationDesc: input.commentContent,
                }
                await this.notificationService.createNotification(memberId, notificationPropertyInput);

                await this.propertyService.propertyStatsEditor({
                    _id: result.commentRefId,
                    targetKey: 'propertyComments',
                    modifier: 1,
                });
                break;
            case CommentGroup.ARTICLE:

                const notificationArticleInput: NotificationInput = {
                    notificationType: NotificationType.COMMENT,
                    notificationGroup: NotificationGroup.ARTICLE,
                    notificationTitle:'Comment Article',
                    receiverId: shapeIntoMongoObjectId(article.memberId),
                    articleId: shapeIntoMongoObjectId(input.commentRefId),
                    notificationDesc: input.commentContent,
                }
                await this.notificationService.createNotification(memberId, notificationArticleInput);

                await this.boardArticleService.articleStatsEditor({
                    _id: result.commentRefId,
                    targetKey: 'articleComments',
                    modifier: 1,
                });
                break;
            case CommentGroup.MEMBER:
                
                const notificationMemberInput: NotificationInput = {
                    notificationType: NotificationType.COMMENT,
                    notificationGroup: NotificationGroup.MEMBER,
                    notificationTitle:'Comment Member',
                    receiverId: shapeIntoMongoObjectId(member._id),
                    notificationDesc: input.commentContent,
                }
                await this.notificationService.createNotification(memberId, notificationMemberInput);

                await this.memberService.memberStatsEditor({
                    _id: result.commentRefId,
                    targetKey: 'memberComments',
                    modifier: 1,
                });
                break;
        }

        if(!result) throw new InternalServerErrorException(Message.CREATE_FAILED);
        return result;
    }

    public async updateComment(memberId: ObjectId, input: CommentUpdate): Promise<Comment> {
        const { _id } = input;

        const result = await this.commentModel
            .findOneAndUpdate(
                {
                    _id: _id,
                    memberId: memberId,
                    commentStatus: CommentStatus.ACTIVE,
                },
                input,
                {
                    new: true,
                }
            )
            .exec();

        if(!result) throw new InternalServerErrorException(Message.UPDATE_FAILED);

        return result;
    }

    public async getComments(memberId: ObjectId, input: CommentsInquiry): Promise<Comments> {
        const { commentRefId } = input.search;
        const match: T = { commentRefId: commentRefId, commentStatus: CommentStatus.ACTIVE };
        const sort: T = {[input?.sort ?? 'createdAt']: input?.direction ?? Direction.DESC};

        const result: Comments[] = await this.commentModel
        .aggregate([
            {$match: match},
            {$sort: sort},
            {
                $facet: {
                    list: [
                        {$skip: (input.page - 1)*input.limit},
                        {$limit: input.limit},
                        // meliked
                        lookupMember,
                        {$unwind: '$memberData'},
                    ],
                    metaCounter: [{ $count: 'total'}],
                }
            }
        ])
        .exec();
        console.log("result: ", result);
        if (!result.length) throw new InternalServerErrorException(Message.NO_DATA_FOUND);

        return result[0];
    }

    public async removeCommentByAdmin(commentId: ObjectId): Promise<Comment> {
        const search: T = { _id: commentId, propertyStatus: CommentStatus.DELETE };
        console.log("result: ",search);
        const result = await this.commentModel.findByIdAndDelete(search).exec();
        if(!result) throw new InternalServerErrorException(Message.REMOVE_FAILED);

        return result;
    }
}
