import { Request } from "express";
import { Connection } from "typeorm";

/**
 * Request context
 */
export interface Context {
    req: Request; // Http request
    conn: Connection; // TypeORM connection
}
