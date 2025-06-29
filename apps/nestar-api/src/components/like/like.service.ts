import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Like } from '../../libs/dto/like/like';
import { Model, ObjectId } from 'mongoose';
import { Message } from '../../libs/enums/common.enum';
import { LikeInput } from '../../libs/dto/like/like.input';
import { T } from '../../libs/types/common';

@Injectable()
export class LikeService {
    constructor ( @InjectModel('Like') private readonly likeModel: Model<Like>) {}

    public async toggleLike(input: LikeInput): Promise<number> {
        const search: T = { memberId: input.memberId, likeRefId: input.likeRefId },
            exist = await this.likeModel.findOne(search);
        let modifier = 1;

        if(exist) {
            await this.likeModel.findOneAndDelete(search).exec();
            modifier = -1;
        } else {
            try {
                await this.likeModel.create(input);
            } catch(err) {
                console.log("Error, Service.model: ", err.message);
                throw new BadRequestException(Message.CREATE_FAILED);
            }
        }
        return modifier;
        
    }
}
