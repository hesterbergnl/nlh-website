declare module 'config' {
    const config: {
        POSTGRES_URI: string;
        PORT: number;
    };
    export default config;
}