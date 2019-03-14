import { ObjectSchemaOptions } from "./ObjectSchemaOptions";
var util = require("../util");
/**
 * Connection is a single database ORM connection to a specific database.
 * Its not required to be a database connection, depend on database type it can create connection pool.
 * You can have multiple connections to multiple databases in your application.
 */
export class ObjectSchema {

    extend(options: ObjectSchemaOptions) {
        util.extend(this.schema, options);
    }

    // -------------------------------------------------------------------------
    // Constructor
    // -------------------------------------------------------------------------

    constructor(options: ObjectSchemaOptions) {
        this.name = options.name;
        this.schema = options;
        this.options.push(options);
    }

    // -------------------------------------------------------------------------
    // Public Readonly Properties
    // -------------------------------------------------------------------------
    /**
     * Connection name.
     */
    readonly name: string;

    /**
     * ObjectSchema options.
     */
    readonly options: ObjectSchemaOptions[] = [];
    readonly schema: ObjectSchemaOptions;
}