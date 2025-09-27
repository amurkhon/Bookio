import { registerEnumType } from '@nestjs/graphql';

export enum PropertyStatus {
	HOLD = 'HOLD',
	ACTIVE = 'ACTIVE',
	SOLD = 'SOLD',
	DELETE = 'DELETE',
}
registerEnumType(PropertyStatus, {
	name: 'PropertyStatus',
});

export enum PropertyCategory {
	NOVEL='Novel',
	BUSINESS='Business',
	FICTION='Fiction',
	SCIENCE='Science',
	MEDICAL='Medical',
	COMPUTERS='Computers',
	COOKING='Cooking',
	DRAMA='Drama',
	PSYCHOLOGY='Psychology',
	NATURE='Nature',
	ROMANCE='Romance'
}
registerEnumType(PropertyCategory, {
	name: 'PropertyCategory',
});

export enum PropertyType {
	PAPERBACK = 'PAPERBACK',
	HARDCOVER = 'HARDCOVER',
	FULL = 'FULL',
}
registerEnumType(PropertyType, {
	name: 'PropertyType',
});