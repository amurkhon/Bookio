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
	NOVEL='NOVEL',
	BUSINESS='BUSINESS',
	FICTION='FICTION',
	SCIENCE='SCIENCE',
	MEDICAL='MEDICAL',
	COMPUTERS='COMPUTERS',
	COOKING='COOKING',
	DRAMA='DRAMA',
	PSYCHOLOGY='PSYCHOLOGY',
	NATURE='NATURE',
	ROMANCE='ROMANCE'
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