import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { BoardArticle, BoardArticles } from '../../libs/dto/board-article/board-article';
import { AllBoardArticlesInquiry, BoardArticleInput, BoardArticlesInquiry } from '../../libs/dto/board-article/board-article.input';
import { Direction, Message } from '../../libs/enums/common.enum';
import { StatisticModifier, T } from '../../libs/types/common';
import { MemberService } from '../member/member.service';
import { ViewService } from '../view/view.service';
import { ViewGroup } from '../../libs/enums/view.enum';
import { BoardArticleCategory, BoardArticleStatus } from '../../libs/enums/board-article.enum';
import { BoardArticleUpdate } from '../../libs/dto/board-article/board-article.update';
import { lookupAuthMemberLiked, lookupMember, shapeIntoMongoObjectId } from '../../libs/config';
import { LikeInput } from '../../libs/dto/like/like.input';
import { LikeGroup } from '../../libs/enums/like.enum';
import { LikeService } from '../like/like.service';
import { NotificationService } from '../notification/notification.service';
import { NotificationInput } from '../../libs/dto/notification/notification.input';
import { NotificationGroup, NotificationType } from '../../libs/enums/notification.enum';

@Injectable()
export class BoardArticleService {
    constructor(
        @InjectModel('BoardArticle') private readonly boardArticleModel: Model<BoardArticle>,
        private memberService: MemberService,
        private viewService: ViewService,
        private likeService: LikeService,
        private readonly notificationService: NotificationService,
    ) {}

    public async createBoardArticle(memberId: ObjectId, input: BoardArticleInput): Promise<BoardArticle> {
        input.memberId = memberId;
        try {
            
            const result = await this.boardArticleModel.create(input);
            const edit: StatisticModifier = {
                            _id: result.memberId,
                            targetKey: 'memberArticles',
                            modifier: 1
                        };
            await this.memberService.memberStatsEditor(edit);

            return result;
        } catch(err) {
            console.log('Error, createArticleBoard: ', err.message);
            throw new BadRequestException(Message.CREATE_FAILED);
        }
    }

    public async getBoardArticle(memberId: ObjectId, articleId: ObjectId): Promise<BoardArticle> {
        const search: T = {
            _id: articleId,
            articleStatus: BoardArticleStatus.ACTIVE
        };

        const targetBoardArticle = await this.boardArticleModel.findOne(search).exec();
        if(!targetBoardArticle) throw new InternalServerErrorException(Message.NO_DATA_FOUND);

        if(memberId) {
            const newView = await this.viewService.recordView({
                viewRefId: targetBoardArticle._id,
                memberId: memberId,
                viewGroup: ViewGroup.ARTICLE,
            });
            if(newView) {
                const edit: StatisticModifier = {
                _id: targetBoardArticle._id,
                targetKey: 'articleViews',
                modifier: 1,
                };
                await this.articleStatsEditor(edit);
                targetBoardArticle.articleViews++
            }  
            
            // me liked
            const likeInput = {
                memberId: memberId,
                likeRefId: articleId,
                likeGroup: LikeGroup.ARTICLE
            };
            targetBoardArticle.meLiked = await this.likeService.checkLikeExistence(likeInput);
        }
        targetBoardArticle.memberData = await this.memberService.getMember(null, targetBoardArticle.memberId);
        return targetBoardArticle;
    }

    public async updateBoardArticle(memberId: ObjectId, input: BoardArticleUpdate): Promise<BoardArticle> {
        const { _id, articleStatus } = input;
        const search: T = {
            _id: input._id,
            memberId: memberId,
            articleStatus: BoardArticleStatus.ACTIVE,
        };

        const result = await this.boardArticleModel
        .findOneAndUpdate(
            search,
            input,
            { new: true },
        )
        .exec();

        if(!result) throw new InternalServerErrorException(Message.UPDATE_FAILED);

        if(articleStatus === BoardArticleStatus.DELETE) {
            await this.memberService.memberStatsEditor({
                _id: memberId,
                targetKey: "memberArticles",
                modifier: -1,
            });
        }

        return result;
    }

    public async getBoardArticles(memberId: ObjectId, input: BoardArticlesInquiry): Promise<BoardArticles> {
        const { articleCategory, text } = input.search;
        const match: T = { articleStatus: BoardArticleStatus.ACTIVE };
        const sort: T = { [input?.sort ?? 'createdAt']: input?.direction ?? Direction.DESC };

        if(articleCategory) match.articleCategory = articleCategory;
        if(text) match.articleTitle = {$regex: new RegExp(text, 'i')}
        if(input?.search?.memberId) match.memberId = shapeIntoMongoObjectId(input.search.memberId);

        const result = await this.boardArticleModel
            .aggregate([
                {$match: match},
                {$sort: sort},
                {
                    $facet: {
                        list: [
                            {$skip: (input.page - 1)*input.limit},
                            {$limit: input.limit},
                            lookupAuthMemberLiked(memberId),
                            lookupMember,
                            {$unwind: '$memberData'}
                        ],
                        metaCounter: [
                            {$count: 'total'}
                        ]
                    }
                }
            ])
            .exec()

        console.log("result: ", result);

        if (!result.length) throw new InternalServerErrorException(Message.NO_DATA_FOUND);

        return result[0];
    }

    public async likeTargetBoardArticle(memberId: ObjectId, likeRefId: ObjectId): Promise<BoardArticle> {
        const target: BoardArticle = await this.boardArticleModel
            .findOne({_id: likeRefId, articleStatus: BoardArticleStatus.ACTIVE})
            .exec();
        
        if(!target) throw new InternalServerErrorException(Message.NO_DATA_FOUND);

        const input: LikeInput = {
            memberId: memberId,
            likeRefId: likeRefId,
            likeGroup: LikeGroup.ARTICLE,
        };

        // Like Toggle via Like modules
        const modifier: number = await this.likeService.toggleLike(input);


        // Creating notification
        
        const notificationInput: NotificationInput = {
            notificationType: NotificationType.LIKE,
            notificationGroup: NotificationGroup.ARTICLE,
            notificationTitle:'New Like',
            receiverId: shapeIntoMongoObjectId(target.memberId),
            articleId: shapeIntoMongoObjectId(target._id),
            notificationDesc: 'liked your post'
        }

        if( modifier > 0)
            await this.notificationService.createNotification(memberId, notificationInput);

        const result = await this.articleStatsEditor({
            _id: likeRefId,
            targetKey: 'articleLikes',
            modifier: modifier
        });

        if(!result) throw new InternalServerErrorException(Message.CREATE_FAILED);

        return result;
    }

    /* Admin */ 

    public async getAllBoardArticlesByAdmin(memberId: ObjectId, input: AllBoardArticlesInquiry): Promise<BoardArticles> {
        const { articleStatus, articleCategory } = input.search;
        const match: T = {};
        const sort: T = {[input?.sort ?? 'createdAt']: input?.direction ?? Direction.DESC};

        if(articleStatus) match.articleStatus = articleStatus;
        if(articleCategory) match.articleCategory = articleCategory;

        const result = await this.boardArticleModel
            .aggregate([
                { $match: match },
                { $sort: sort },
                {
                    $facet: {
                        list: [
                            { $skip: (input.page - 1)*input.limit },
                            { $limit: input.limit },
                            lookupMember,
                            { $unwind: '$memberData' },
                        ],
                        metaCounter: [{ $count: 'total'}],
                    },
                },
            ])
            .exec();
        if(!result.length) throw new InternalServerErrorException(Message.NO_DATA_FOUND);

        return result[0];
    }

    public async updateBoardArticleByAdmin(input: BoardArticleUpdate): Promise<BoardArticle> {
            
        let { _id, articleStatus } = input;

        const updatedArticle = await this.boardArticleModel
            .findOneAndUpdate({_id: _id, articleStatus: BoardArticleStatus.ACTIVE}, input, {new: true})
            .exec();

        if(!updatedArticle) throw new InternalServerErrorException(Message.UPDATE_FAILED);
        
        if(articleStatus === BoardArticleStatus.DELETE) {
            await this.memberService.memberStatsEditor({
                _id: updatedArticle.memberId,
                targetKey: 'memberArticles',
                modifier: -1,
            });
        }

        return updatedArticle;
    }

    public async removeBoardArticleByAdmin(input: ObjectId): Promise<BoardArticle> {

        const result = await this.boardArticleModel
            .findOneAndDelete({_id: input, articleStatus: BoardArticleStatus.DELETE})
            .exec();

        if(!result) throw new InternalServerErrorException(Message.REMOVE_FAILED);

        return result;
    }

    public async articleStatsEditor(input: StatisticModifier): Promise<BoardArticle> {
        const { _id, targetKey, modifier } = input;
        return await this.boardArticleModel.findOneAndUpdate(
            _id,
            {$inc: {[targetKey]: modifier}},
            {new: true}
        )
        .exec();
    }
}
