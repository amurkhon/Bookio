import { registerEnumType } from "@nestjs/graphql";
import { register } from "module";

export enum Message {
    SOMETHING_WENT_WRONG = "Something went wrong!",
    NO_DATA_FOUND = "No data is found!",
    CREATE_FAILED = "Create is failed!",
    UPDATE_FAILED = "Update is failed!",
    REMOVE_FAILED = "Remove failed!",
    UPLOAD_FAILED = "Upload failed!",
    BAD_REQUEST = "Bad Request!",

    USED_MEMBER_NICK_OR_PHONE = "Already used member nick or phone!",
    NO_MEMBER_NICK = "No member with that member nick!",
    BLOCKED_USER = "You have been blocked!",
    WRONG_PASSWORD = "Wrong password, please try again!",
    NOT_AUTHENTICATED = "You are not authenticated, Please login first!",
    TOKEN_NOT_EXIST = "Bearer Token is not Allowed!",
    ONLY_SPECIFIC_ROLES_ALLOWED = "Allow only for members with specific roles!",
    NOT_ALLOWED_REQUEST = "Not Allowed Request!",
    PROVIDE_ALLOWED_FORMAT = "Please provide jpg, jpeg or png images!",
    SELF_SUBSCRIPTION_DENIED = "Self subscription is denied!",
    MUST_PURCHASE_BEFORE_DOWNLOADING = "You must purchase this book before downloading!",
    ALREADY_DOWNLOADED = "You have already downloaded this book!",
    ORDER_NOT_FOUND = "Order not found!",
    ALREADY_PURCHASED = "You have already purchased this item!",
    PAYMENT_FAILED = "Payment processing failed!",
    ORDER_CANCELLED = "Order has been cancelled!",
    ORDER_COMPLETED = "Order has been completed!",
    ORDER_PROCESSING = "Order is being processed!",
    ORDER_PENDING = "Order is pending!",
    ORDER_REFUNDED = "Order has been refunded!",
    ORDER_FAILED = "Order has failed!",
    ORDER_SUCCESS = "Order has been successful!",
    ORDER_CREATED = "Order has been created!",
}

export enum Direction {
    ASC = 1,
    DESC = -1,
}
registerEnumType(Direction, {
    name: 'Direction',
});