import { Course } from "./course.type";
import { Member } from "./member.type";

export interface Wishlist {
    id: string,
    createAt: string,
    course: Course,
    member: Member
}