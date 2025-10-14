import { ObjectId } from "mongoose";
import { NotificationStatus } from "../enums/notification.enum";

export interface T {
    [key: string] : any;
}

export interface StatisticModifier {
    _id: ObjectId;
    targetKey: string;
    modifier: number;
}

export interface NotificationStatusModifier {
    _id: ObjectId;
    targetKey: string;
    modifier: NotificationStatus;
}