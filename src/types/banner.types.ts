export interface IBanner {
    id: string;
    imageUrl: string;
    displayOrder: number;
    isDeleted: boolean;
    deletedAt: string | null;
    createdAt: string;
}