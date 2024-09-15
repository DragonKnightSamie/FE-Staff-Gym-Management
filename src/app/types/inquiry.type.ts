import { Member } from "./member.type";

export interface Inquiry {
    id: string,
    title: string,
    message: string,
    thumbnailUrl: string,
    status: string,
    createAt: string,
    inquiryResponse: string,
    member: Member
}