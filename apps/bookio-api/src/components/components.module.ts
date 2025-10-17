import { Module } from '@nestjs/common';
import { MemberModule } from './member/member.module';
import { PropertyModule } from './property/property.module';
import { AuthModule } from './auth/auth.module';
import { CommentModule } from './comment/comment.module';
import { LikeModule } from './like/like.module';
import { ViewModule } from './view/view.module';
import { FollowModule } from './follow/follow.module';
import { BoardArticleModule } from './board-article/board-article.module';
import { DownloadModule } from './download/download.module';
import { NotificationModule } from './notification/notification.module';
import { NoticeModule } from './notice/notice.module';

@Module({
  imports: [
    MemberModule,
    AuthModule,
    PropertyModule,
    BoardArticleModule,
    CommentModule,
    LikeModule,
    ViewModule,
    FollowModule,
    DownloadModule,
    NotificationModule,
    NoticeModule,
  ],
})
export class ComponentsModule {}
