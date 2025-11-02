export declare const config: {
    readonly port: number;
    readonly frontendUrl: string;
    readonly jwt: {
        readonly accessTokenSecret: string;
        readonly accessTokenExpiresIn: string;
        readonly refreshTokenSecret: string;
        readonly refreshTokenExpiresIn: string;
    };
    readonly cors: {
        readonly origin: string[];
    };
    readonly rateLimit: {
        readonly windowMs: number;
        readonly max: number;
    };
    readonly security: {
        readonly staffRegistrationKey: string;
    };
    readonly cloudinary: {
        readonly cloudName: string;
        readonly apiKey: string;
        readonly apiSecret: string;
    };
};
export default config;
//# sourceMappingURL=index.d.ts.map