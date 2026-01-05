//dto class for user
export class UserDTO {
    constructor(
        public userId: string,
        public username: string,
        public hasBotStarted: boolean,
        public lang: string
    ) {
        this.userId = userId;
        this.username = username;
        this.hasBotStarted = hasBotStarted;
        this.lang = lang;
    }
}