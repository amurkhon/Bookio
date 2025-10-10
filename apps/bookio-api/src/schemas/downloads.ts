import { Schema } from 'mongoose';

const DownloadSchema = new Schema(
    {
        propertyId: {
            type: Schema.Types.ObjectId,
            required: true,
            ref: 'Property'
        },

        memberId: {
            type: Schema.Types.ObjectId,
            required: true,
            ref: 'Member',
        },
    },
    { timestamps: true, collection: 'downloads' },
);

export default DownloadSchema;