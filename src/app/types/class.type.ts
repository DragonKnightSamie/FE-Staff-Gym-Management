import { Trainer } from "./trainer.type";

export interface Class {
    id: string,
    name: string,
    description: string,
    thumbnailUrl: string,
    trainer: Trainer,
    totalLesson: number,
    totalMember: number,
    lessonCount: number,
    participant: number,
    lessonTime: string,
    from: string,
    to: string,
    status: string,
}