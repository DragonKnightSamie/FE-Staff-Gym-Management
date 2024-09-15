import { Category } from "./category.type";
import { Class } from "./class.type";

export interface Course {
    id: string,
    name: string,
    description: string,
    thumbnailUrl: string,
    category: Category,
    totalSlot: number,
    totalMember: number,
    lessonTime: string,
    createAt: string,
    classes: Class[]
}