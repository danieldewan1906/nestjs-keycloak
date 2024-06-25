import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

@Schema()
export class User extends Document {
    @Prop({required: true, unique: true})
    username: string;

    @Prop({required: true, unique: true})
    email: string;

    @Prop({required: false})
    password?: string;

    @Prop({required: true})
    firstName: string;

    @Prop({required: false})
    lastName: string;

    @Prop({required: false, enum: ["user"]})
    role?: string;

    @Prop({required: true})
    isActive: boolean;

    @Prop({required: true, default: Date.now()})
    createdAt: Date;

    @Prop({required: false})
    updatedAt?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);