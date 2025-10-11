import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { DownloadService } from './download.service';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/guards/auth.guard';
import { Download } from '../../libs/dto/download/download';
import { AuthMember } from '../auth/decorators/authMember.decorator';
import { ObjectId } from 'mongoose';
import { shapeIntoMongoObjectId } from '../../libs/config';

@Resolver()
export class DownloadResolver {
    constructor (
        private readonly downloadService: DownloadService,
    ) {}

    @UseGuards(AuthGuard)
    @Mutation((returns) => Download)
    public async download(
        @Args('input') input: string,
        @AuthMember('_id') memberId: ObjectId,
    ):Promise<Download>{
        console.log('Mutation: download');
        const propertyId = shapeIntoMongoObjectId(input);
        const down = {
            propertyId: propertyId,
            memberId: memberId,
        };
        return await this.downloadService.recordDownload(down);
    }
}
