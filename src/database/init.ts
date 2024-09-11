import postgres from "postgres";
export const DatabaseConn = postgres("postgresql://" +
    process.env.DB_USERNAME + ":" +
    process.env.PASSWORD + "@" +
    process.env.HOST + ":" +
    process.env.PORT + "/" +
    process.env.DATABASE_NAME, {max: 95, idle_timeout: 20})
