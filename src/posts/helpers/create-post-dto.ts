export class CreatePostDto {
    content: string;
    wallType: WallType;
    city: string;
    area: string;
}

export enum WallType {
    STREET = 'STREET',
    COUNCIL = 'COUNCIL'
}