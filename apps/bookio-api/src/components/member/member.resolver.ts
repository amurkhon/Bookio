import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { MemberService } from './member.service';
import { UseGuards } from '@nestjs/common';
import { AuthorsInquiry, LoginInput, MemberInput, MembersInquiry } from '../../libs/dto/member/member.input';
import { Member, Members } from '../../libs/dto/member/member';
import { AuthGuard } from '../auth/guards/auth.guard';
import { AuthMember } from '../auth/decorators/authMember.decorator';
import { ObjectId } from 'mongoose';
import { MemberType } from '../../libs/enums/member.enum';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { MemberUpdate } from '../../libs/dto/member/member.update';
import { getSerialForFile, shapeIntoMongoObjectId, validAudioTypes, validMimeTypes, validPdfTypes } from '../../libs/config';
import { WithoutGuard } from '../auth/guards/without.guard';
import { GraphQLUpload, FileUpload } from 'graphql-upload';
import { createWriteStream } from 'fs';
import { Message } from '../../libs/enums/common.enum';
import { S3Client } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';

@Resolver()
export class MemberResolver {
    constructor(private readonly memberService: MemberService) {}

    @Mutation(() => Member)
    public async signup(@Args('input') input: MemberInput): Promise<Member> {
        console.log('Mutation: signup');
        return await this.memberService.signup(input);
    }

    @Mutation(() => Member)
    public async login(@Args('input') input: LoginInput): Promise<Member> {
        console.log('Mutation: login');
        return await this.memberService.login(input);
    }

    @UseGuards(AuthGuard)
    @Mutation(() => String)
    public async checkAuth(
        @AuthMember("memberNick") memberNick: string
    ): Promise<string> {
        console.log('Mutation: updateMember');
        console.log("memberNick: ", memberNick);
        return await `Hi ${memberNick}`;
    }

    @Roles(MemberType.USER, MemberType.AUTHOR)
    @UseGuards(RolesGuard)
    @Mutation(() => String)
    public async checkAuthRoles(
        @AuthMember("memberNick") memberNick: string
    ): Promise<string> {
        console.log('Mutation: checkAuthRoles');
        console.log("memberNick: ", memberNick);
        return await `Hi ${memberNick}`;
    }

    @UseGuards(AuthGuard)
    @Mutation(() => Member)
    public async updateMember(
        @Args('input') input: MemberUpdate,
        @AuthMember("_id") memberId: ObjectId,
    ): Promise<Member> {
        console.log('Mutation: updateMember');
        delete input._id;
        return await this.memberService.updateMember(memberId, input);
    }

    
    @UseGuards(WithoutGuard)
    @Query(() => Member)
    public async getMember(
        @Args("memberId") input: string,
        @AuthMember("_id") memberId: ObjectId,
    ): Promise<Member> {
        console.log('Query: getMember');
        const targetId = shapeIntoMongoObjectId(input);
        return await this.memberService.getMember(memberId, targetId);
    }

    @UseGuards(WithoutGuard)
    @Query(() => Members)
    public async getAuthors(
        @Args("input") input: AuthorsInquiry, 
        @AuthMember("_id") memberId: ObjectId
    ): Promise<Members> {
        console.log('Query: getAuthors')
        return await this.memberService.getAuthors(memberId, input);
    }

    @UseGuards(AuthGuard)
    @Mutation(() => Member)
    public async likeTargetMember(
        @Args('memberId') input: string,
        @AuthMember("_id") memberId: ObjectId,
    ): Promise<Member> {
        console.log('Mutation: likeTargetMember');
        const likeRefId = shapeIntoMongoObjectId(input);
        return await this.memberService.likeTargetMember(memberId, likeRefId);
    }

    /* Admin */

    @Roles(MemberType.ADMIN)
    @UseGuards(RolesGuard)
    @Query(() => Members)
    public async getAllMembersByAdmin(
        @Args('input') input: MembersInquiry
    ): Promise<Members> {
        console.log("Query: getAllMembersByAdmin");
        return await this.memberService.getAllMembersByAdmin(input);
    }

    @Roles(MemberType.ADMIN)
    @UseGuards(RolesGuard)
    @Mutation(() => Member)
    public async updateMemberByAdmin(
        @Args('input') input: MemberUpdate
    ): Promise<Member> {
        console.log('Mutation: updateMemberByAdmin');
        return await this.memberService.updateMemberByAdmin(input);
    }



    /* UPLOADER */
    
    @UseGuards(AuthGuard)
    @Mutation((returns) => String)
    public async imageUploader(
        @Args({ name: 'file', type: () => GraphQLUpload })
    { createReadStream, filename, mimetype }: FileUpload,
    @Args('target') target: String,
    ): Promise<string> {
        console.log('Mutation: imageUploader');

        if (!filename) throw new Error(Message.UPLOAD_FAILED);
        const validMime = validMimeTypes.includes(mimetype);
        if (!validMime) throw new Error(Message.PROVIDE_ALLOWED_FORMAT);

        const imageName = getSerialForFile(filename);
        const url = `uploads/${target}/${imageName}`;
        console.log("url: ", url);
        const stream = createReadStream();

        const result = await new Promise((resolve, reject) => {
            stream
                .pipe(createWriteStream(url))
                .on('finish', async () => resolve(true))
                .on('error', (err) => {console.log("err: ",err); reject(false)});
        });
        if (!result) throw new Error(Message.UPLOAD_FAILED);

        return url;
    }

    @UseGuards(AuthGuard)
    @Mutation((returns) => [String])
    public async imagesUploader(
        @Args('files', { type: () => [GraphQLUpload] })
    files: Promise<FileUpload>[],
    @Args('target') target: String,
    ): Promise<string[]> {
        console.log('Mutation: imagesUploader');

        const uploadedImages = [];
        const promisedList = files.map(async (img: Promise<FileUpload>, index: number): Promise<Promise<void>> => {
            try {
                const { filename, mimetype, encoding, createReadStream } = await img;

                const validMime = validMimeTypes.includes(mimetype);
                if (!validMime) throw new Error(Message.PROVIDE_ALLOWED_FORMAT);

                const imageName = getSerialForFile(filename);
                const url = `uploads/${target}/${imageName}`;
                const stream = createReadStream();

                const result = await new Promise((resolve, reject) => {
                    stream
                        .pipe(createWriteStream(url))
                        .on('finish', () => resolve(true))
                        .on('error', () => reject(false));
                });
                if (!result) throw new Error(Message.UPLOAD_FAILED);

                uploadedImages[index] = url;
            } catch (err) {
                console.log('Error, file missing!');
            }
        });

        await Promise.all(promisedList);
        return uploadedImages;
    }
    
    @UseGuards(AuthGuard)
    @Mutation((returns) => String)
    public async pdfUploader(
        @Args({ name: 'file', type: () => GraphQLUpload })
    { createReadStream, filename, mimetype }: FileUpload,
    @Args('target') target: String,
    ): Promise<string> {
        console.log('Mutation: pdfUploader');

        if (!filename) throw new Error(Message.UPLOAD_FAILED);
        const validMime = validPdfTypes.includes(mimetype);
        if (!validMime) throw new Error(Message.PROVIDE_ALLOWED_FORMAT);

        const s3Client = new S3Client({
            region: process.env.region,
            endpoint: process.env.endpoint_url,
            forcePathStyle: true,
            credentials: {
                accessKeyId: process.env.aws_access_key_id,
                secretAccessKey: process.env.aws_secret_access_key,
            },
        });

        const pdfName = getSerialForFile(filename);
        const url = `${pdfName}`;
        const stream = createReadStream();

        const upload = new Upload({
            client: s3Client,
            params: {
                Bucket: 'pdf',
                Key: url,
                ContentType: 'application/pdf',
                Body: stream,
            },
        });

        await upload.done();
        if (!upload) throw new Error(Message.UPLOAD_FAILED);


        return url;
    }

    @UseGuards(AuthGuard)
    @Mutation((returns) => String)
    public async audioUploader(
        @Args({ name: 'file', type: () => GraphQLUpload })
    { createReadStream, filename, mimetype }: FileUpload,
    @Args('target') target: String,
    ): Promise<string> {
        console.log('Mutation: pdfUploader');

        if (!filename) throw new Error(Message.UPLOAD_FAILED);
        const validMime = validAudioTypes.includes(mimetype);
        if (!validMime) throw new Error(Message.PROVIDE_ALLOWED_FORMAT);
        
        const s3Client = new S3Client({
            region: process.env.region,
            endpoint: process.env.endpoint_url,
            forcePathStyle: true,
            credentials: {
                accessKeyId: process.env.aws_access_key_id,
                secretAccessKey: process.env.aws_secret_access_key,
            },
        });

        const pdfName = getSerialForFile(filename);
        const url = `${pdfName}`;
        const stream = createReadStream();

        const upload = new Upload({
            client: s3Client,
            params: {
                Bucket: 'audio',
                Key: url,
                ContentType: 'application/zip',
                Body: stream,
            },
        });

        await upload.done();
        if (!upload) throw new Error(Message.UPLOAD_FAILED);

        return url;
    }
    
}
