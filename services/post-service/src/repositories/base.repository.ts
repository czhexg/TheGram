import { Model, Document } from "mongoose";

export abstract class BaseRepository<T extends Document> {
    constructor(protected readonly model: Model<T>) {}

    async create(dto: any): Promise<T> {
        return this.model.create(dto);
    }

    async findById(id: string): Promise<T | null> {
        return this.model.findById(id).exec();
    }

    async update(id: string, dto: Partial<T>): Promise<T | null> {
        return this.model.findByIdAndUpdate(id, dto, { new: true }).exec();
    }

    async delete(id: string): Promise<T | null> {
        return this.model
            .findByIdAndUpdate(
                id,
                { status: "deleted" } as any, // Cast to 'any' if status doesn't exist in T
                { new: true }
            )
            .exec();
    }

    async hardDelete(id: string): Promise<T | null> {
        return this.model.findByIdAndDelete(id).exec();
    }
}
