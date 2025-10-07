import { Schema } from 'mongoose';
import { PropertyStatus, PropertyCategory, PropertyType, PropertyLanguage } from '../libs/enums/property.enum';
import { MIN_PUBLICATION_DATE, parseDateOnlyUTC } from '../libs/dto/property/property.input';

const PropertySchema = new Schema(
	{
		propertyStatus: {
			type: String,
			enum: PropertyStatus,
			default: PropertyStatus.ACTIVE,
		},
		
		propertyType: {
			type: String,
			enum: PropertyType,
			default: PropertyType.FULL,
		},

		propertyCategory: {
			type: String,
			enum: PropertyCategory,
			required: true,
		},

		propertyTitle: {
			type: String,
			required: true,
		},

		propertyAuthor: {
			type: String,
			required: true,
		},

		propertyPrice: {
			type: Number,
			required: true,
		},

		propertyPages: {
			type: Number,
			required: true,
		},

		isbn: {
			type: String,
			required: true,
			unique: true,
			sparse: true,
		},

		propertyViews: {
			type: Number,
			default: 0,
		},

		propertyLikes: {
			type: Number,
			default: 0,
		},

		propertyComments: {
			type: Number,
			default: 0,
		},

		propertyRank: {
			type: Number,
			default: 0,
		},

		propertyDownloads: {
			type: Number,
			default: 0,
		},

		propertyLanguages: {
			type: [String],
			enum: PropertyLanguage,
			required: true,
		},

		propertyImages: {
			type: [String],
			required: true,
		},

		propertyFile: {
			type: String,
			default: '',
		},

		propertyAudio: {
			type: String,
			default: '',
		},

		propertyDesc: {
			type: String,
		},

		memberId: {
			type: Schema.Types.ObjectId,
			required: true,
			ref: 'Member',
		},

		deletedAt: {
			type: Date,
		},

		publicationDate: {
			type: Date,
			required: true,
			set: parseDateOnlyUTC,  // accepts "YYYY-MM-DD" and normalizes to 00:00:00Z
			validate: [
				{
				validator: (v: Date) => v instanceof Date && !isNaN(+v),
				message: 'publicationDate must be a valid date',
				},
				{
				validator: (v: Date) => v >= MIN_PUBLICATION_DATE,
				message: `publicationDate must be on/after ${MIN_PUBLICATION_DATE.toISOString().slice(0,10)}`,
				},
				{
				validator: (v: Date) => v <= new Date(),
				message: 'publicationDate cannot be in the future',
				},
			],
		},
	},
	{ timestamps: true, collection: 'properties' },
);

PropertySchema.index({ propertyTitle: 1, propertyPrice: 1, memberId: 1 }, { unique: true });

export default PropertySchema;
