import { Status } from "@src/models/constants";
import mongoose, { Model, Document, SaveOptions, QueryOptions } from "mongoose";

export abstract class BaseRepository<T extends Document> {
    constructor(protected readonly model: Model<T>) {}

    async create(dto: Partial<T>, options?: SaveOptions): Promise<T> {
        return this.model.create([dto], options).then((res) => res[0]);
    }

    async findById(
        id: mongoose.Types.ObjectId,
        options?: QueryOptions
    ): Promise<T | null> {
        return this.model.findById(id, options).exec();
    }

    async update(
        id: mongoose.Types.ObjectId,
        dto: Partial<T>,
        options?: QueryOptions
    ): Promise<T | null> {
        return this.model
            .findByIdAndUpdate(id, dto, { new: true, ...options })
            .exec();
    }

    // soft delete
    async delete(
        id: mongoose.Types.ObjectId,
        options?: QueryOptions
    ): Promise<T | null> {
        return this.model
            .findByIdAndUpdate(
                id,
                { status: Status.DELETED } as any, // Cast to 'any' if status doesn't exist in T
                { new: true, ...options }
            )
            .exec();
    }

    async hardDelete(
        id: mongoose.Types.ObjectId,
        options?: QueryOptions
    ): Promise<T | null> {
        return this.model.findByIdAndDelete(id, options).exec();
    }
}
