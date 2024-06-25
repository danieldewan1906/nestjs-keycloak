import * as dotenv from 'dotenv';

export class ConfigurationService {
    private readonly envConfig: Record<string, string>;
    constructor() {
        const result = dotenv.config();
        if (result.error) {
            this.envConfig = process.env;
        } else {
            this.envConfig = result.parsed;
        }
    }

    public get(key: string): string {
        return this.envConfig[key];
    }

    public async getMongoConfig() {
        let mongodbUrl = `mongodb://${this.get('MONGO_USER')}:${this.get('MONGO_PASSWORD')}@${this.get('MONGO_HOST')}/${this.get('MONGO_DATABASE')}?authSource=admin`;
        return {
            uri: mongodbUrl,
            useNewUrlParser: true
        }
    }
}
