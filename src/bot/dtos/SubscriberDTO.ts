//dto class for subscriber
export class SubscriberDTO {
    constructor(
        public userId: string,
        public username: string,
    ) {
        this.userId = userId;
        this.username = username;
    }
}