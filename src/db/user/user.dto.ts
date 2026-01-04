//dto class for user
export class UserDTO {
    constructor(
        public userId: string,
        public username: string,
        public hasBotStarted: boolean
    ) {
        this.userId = userId;
        this.username = username;
        this.hasBotStarted = hasBotStarted;
    }
}