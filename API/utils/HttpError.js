class HttpError extends Error {
    constructor(statusCode, message) {
        super(message);
        this.statusCode = statusCode;
    }
}

export function sendErrorResponse(res, error) {
    const databaseErrors = {
        ER_DUP_ENTRY: {statusCode: 409, message: "Value already exists"},
        ER_NO_REFERENCED_ROW_2: {statusCode: 400, message: "Related record does not exist"},
        ER_ROW_IS_REFERENCED_2: {statusCode: 409, message: "Record is still in use"},
        ER_DATA_TOO_LONG: {statusCode: 400, message: "Value is too long"}
    };
    const databaseError = databaseErrors[error.code];
    const statusCode = error.statusCode ?? databaseError?.statusCode ?? 500;
    const message = statusCode === 500
        ? "Internal server error"
        : databaseError?.message ?? error.message;

    return res.status(statusCode).json({message});
}

export default HttpError;
