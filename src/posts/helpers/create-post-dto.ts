export class CreatePostDto {
    content: string;
    wallType: WallType;
}

export enum WallType {
    STREET = 'STREET',
    COUNCIL = 'COUNCIL'
}