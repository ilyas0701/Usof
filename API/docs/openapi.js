const string = {type: "string"};
const integer = {type: "integer", minimum: 1};
const dateTime = {type: "string", format: "date-time"};
const status = {type: "string", enum: ["active", "inactive"]};
const role = {type: "string", enum: ["user", "admin"]};
const reaction = {type: "string", enum: ["like", "dislike"]};
const databaseBoolean = {type: "integer", enum: [0, 1]};
const reference = name => ({$ref: `#/components/schemas/${name}`});
const object = (properties, required = []) => ({type: "object", properties, ...(required.length ? {required} : {})});
const array = items => ({type: "array", items});

const schemas = {
    Error: object({message: string}, ["message"]),
    Message: object({message: string}, ["message"]),
    User: object({id: integer, login: string, full_name: {type: "string", nullable: true}, email: {type: "string", format: "email"}, profile_picture: {type: "string", nullable: true}, rating: {type: "integer"}, role, email_verified: databaseBoolean}),
    Post: object({id: integer, author_id: {...integer, nullable: true}, author_login: string, title: string, publish_date: dateTime, status, is_locked: databaseBoolean, content: string, like_count: {type: "integer"}}),
    Category: object({id: integer, title: string, description: {type: "string", nullable: true}}),
    Comment: object({id: integer, post_id: integer, parent_id: {...integer, nullable: true}, author_id: {...integer, nullable: true}, publish_date: dateTime, content: string, status, is_locked: databaseBoolean}),
    Like: object({id: integer, author_id: integer, publish_date: dateTime, post_id: {...integer, nullable: true}, comment_id: {...integer, nullable: true}, type: reaction}),
    Image: object({id: integer, post_id: integer, image_path: string, url: string}),
    PostPage: object({posts: array(reference("Post")), total: {type: "integer"}, page: integer, pageSize: integer}),
    Registration: object({login: {type: "string", minLength: 3, maxLength: 255, pattern: "^[a-zA-Z0-9_]+$"}, email: {type: "string", format: "email"}, password: {type: "string", format: "password", minLength: 8}, passwordConfirmation: {type: "string", format: "password"}}, ["login", "email", "password", "passwordConfirmation"]),
    PostInput: object({status, title: {type: "string", maxLength: 255}, content: string, categories: {type: "array", minItems: 1, uniqueItems: true, items: integer}}, ["title", "content", "categories"]),
    CategoryInput: object({title: {type: "string", maxLength: 255}, description: {type: "string", nullable: true}}, ["title"]),
    LikeInput: object({type: reaction}, ["type"])
};

const paths = {};
const json = schema => ({content: {"application/json": {schema}}});
const query = (name, schema, description) => ({name, in: "query", schema, ...(description ? {description} : {})});

function add(method, path, tag, summary, options = {}) {
    const parameters = [...path.matchAll(/\{([^}]+)\}/g)].map(([, name]) => ({
        name,
        in: "path",
        required: true,
        schema: name.endsWith("token") ? string : integer
    }));

    const responseCode = options.created ? "201" : options.noContent ? "204" : "200";
    const responses = {
        [responseCode]: options.noContent
            ? {description: "No content"}
            : {description: "Success", ...(options.response ? {content: {[options.responseType ?? "application/json"]: {schema: options.response}}} : {})},
        "400": {description: "Invalid request", ...json(reference("Error"))},
        "401": {description: "Authentication required", ...json(reference("Error"))},
        "403": {description: "Access denied", ...json(reference("Error"))},
        "404": {description: "Resource not found", ...json(reference("Error"))}
    };

    if (options.conflict) {
        responses["409"] = {description: "Resource already exists", ...json(reference("Error"))};
    }

    paths[path] ??= {};
    paths[path][method] = {
        tags: [tag],
        summary,
        ...(options.description ? {description: options.description} : {}),
        ...(options.auth ? {security: [{bearerAuth: []}]} : options.optionalAuth ? {security: [{bearerAuth: []}, {}]} : {}),
        ...(parameters.length || options.query ? {parameters: [...parameters, ...(options.query ?? [])]} : {}),
        ...(options.body ? {requestBody: {required: true, content: {[options.multipart ? "multipart/form-data" : "application/json"]: {schema: options.body}}}} : {}),
        responses
    };
}

const postQuery = [
    query("categories", {type: "string"}, "Comma-separated category IDs. Matches any selected category, up to 100 IDs."),
    query("author", integer, "Filter posts by author ID. Visibility rules still apply."),
    query("page", {...integer, default: 1}),
    query("pageSize", {...integer, maximum: 100, default: 10}),
    query("q", {type: "string", minLength: 1, maxLength: 100}, "Search post titles and content. Relevance is the default sort when q is set."),
    query("sort", {type: "string", enum: ["likes", "date", "relevance"]}, "Relevance requires q. Without q, the default is likes."),
    query("status", status, "Inactive posts are visible only to their author or an admin."),
    query("dateFrom", {type: "string", format: "date"}),
    query("dateTo", {type: "string", format: "date"})
];

const searchQuery = [
    {...query("q", {type: "string", minLength: 1, maxLength: 100}), required: true},
    ...postQuery.filter(parameter => parameter.name !== "q" && parameter.name !== "sort"),
    query("sort", {type: "string", enum: ["relevance", "likes", "date"], default: "relevance"}),
    query("category", integer)
];

add("post", "/api/auth/register", "Authentication", "Register a user and send a verification email", {body: reference("Registration"), response: object({id: integer, login: string, email: string}), created: true});
add("get", "/api/auth/verify-email/{token}", "Authentication", "Verify an email address", {response: reference("Message")});
add("post", "/api/auth/login", "Authentication", "Log in with a verified account", {body: object({login: string, password: {type: "string", format: "password"}}, ["login", "password"]), response: object({token: string})});
add("post", "/api/auth/logout", "Authentication", "Log out on the client", {auth: true, response: reference("Message"), description: "The server does not revoke the JWT. Remove the token from the client."});
add("post", "/api/auth/password-reset", "Authentication", "Request a password reset email", {body: object({email: {type: "string", format: "email"}}, ["email"]), response: reference("Message")});
add("post", "/api/auth/password-reset/{confirm_token}", "Authentication", "Set a new password", {body: object({newPassword: {type: "string", format: "password", minLength: 8}, newPasswordConfirmation: {type: "string", format: "password"}}, ["newPassword", "newPasswordConfirmation"]), response: reference("Message")});

add("get", "/api/users", "Users", "Get all users", {auth: true, response: array(reference("User"))});
add("get", "/api/users/{id}", "Users", "Get a user", {auth: true, response: reference("User")});
add("post", "/api/users", "Users", "Create a user as an admin", {auth: true, description: "Admin only. The new user starts with the user role and must verify their email.", body: reference("Registration"), response: object({id: integer, login: string, email: string}), created: true});
add("patch", "/api/users/avatar", "Users", "Upload your avatar", {auth: true, body: object({avatar: {type: "string", format: "binary"}}, ["avatar"]), multipart: true, response: reference("User")});
add("patch", "/api/users/{id}", "Users", "Update a user profile", {auth: true, description: "The user or an admin can change login, full name or email. A changed email must be verified again.", body: object({login: string, full_name: {type: "string", nullable: true}, email: {type: "string", format: "email"}}), response: reference("User")});
add("patch", "/api/users/{id}/role", "Users", "Change a user role as an admin", {auth: true, body: object({role}, ["role"]), response: reference("User")});
add("delete", "/api/users/{id}", "Users", "Delete a user as an admin", {auth: true, noContent: true});

add("get", "/api/posts", "Posts", "Get a page of posts", {optionalAuth: true, query: [...postQuery, query("category", integer)], response: reference("PostPage")});
add("get", "/api/posts/search", "Posts", "Search post titles and content", {optionalAuth: true, description: "A literal, case-insensitive search. Exact and partial title matches appear before content-only matches when sorted by relevance. Public users see active posts only.", query: searchQuery, response: reference("PostPage")});
add("get", "/api/posts/favorites", "Posts", "Get your favorite posts", {auth: true, description: "Posts are ordered by the time they were saved. Inactive posts are visible only to their author or an admin.", query: [query("page", {...integer, default: 1}), query("pageSize", {...integer, maximum: 100, default: 10})], response: reference("PostPage")});
add("get", "/api/posts/subscriptions", "Posts", "Get posts you follow", {auth: true, description: "Inactive posts are visible only to their author or an admin.", query: [query("page", {...integer, default: 1}), query("pageSize", {...integer, maximum: 100, default: 10})], response: reference("PostPage")});
add("post", "/api/posts", "Posts", "Create a post", {auth: true, body: reference("PostInput"), response: reference("Post"), created: true});
add("get", "/api/posts/{id}", "Posts", "Get a post", {optionalAuth: true, response: reference("Post")});
add("get", "/api/posts/{id}/events", "Posts", "Subscribe to live comment updates", {optionalAuth: true, description: "SSE stream with ready and comments-changed events. Refresh comments on either event, including after reconnecting. Send the access token in the Authorization header for protected posts.", response: string, responseType: "text/event-stream"});
add("patch", "/api/posts/{id}", "Posts", "Update a post", {auth: true, description: "The author can edit text. The author or admin can change categories and lock state. The author or admin can change status.", body: object({title: string, content: string, categories: array(integer), status, is_locked: {type: "boolean"}}), response: reference("Post")});
add("delete", "/api/posts/{id}", "Posts", "Delete a post", {auth: true, noContent: true});
add("get", "/api/posts/{id}/categories", "Posts", "Get the categories of a post", {optionalAuth: true, response: array(reference("Category"))});
add("get", "/api/posts/{id}/comments", "Posts", "Get the comments of a post", {optionalAuth: true, response: array(reference("Comment"))});
add("post", "/api/posts/{id}/comments", "Posts", "Add a comment or reply to a post", {auth: true, description: "Set parent_id to reply to an active, unlocked comment in this post. Omit it or send null for a top-level comment.", body: object({content: string, parent_id: {...integer, nullable: true}}, ["content"]), response: reference("Comment"), created: true});
add("get", "/api/posts/{id}/images", "Posts", "Get the images of a post", {optionalAuth: true, response: array(reference("Image"))});
add("get", "/api/posts/{id}/images/{imageId}/file", "Posts", "Download a post image", {optionalAuth: true, response: {type: "string", format: "binary"}, responseType: "image/*"});
add("delete", "/api/posts/{id}/images/{imageId}", "Posts", "Delete a post image", {auth: true, description: "The author or admin can delete an image belonging to this post.", noContent: true});
add("post", "/api/posts/{id}/images", "Posts", "Upload post images", {auth: true, description: "The author or admin can upload up to five JPEG, PNG, WebP or GIF images, at most 5 MB each.", body: object({images: {type: "array", maxItems: 5, items: {type: "string", format: "binary"}}}, ["images"]), multipart: true, response: array(reference("Image")), created: true});
add("get", "/api/posts/{id}/like", "Posts", "Get reactions to a post", {optionalAuth: true, response: array(reference("Like"))});
add("post", "/api/posts/{id}/like", "Posts", "React to a post", {auth: true, body: reference("LikeInput"), response: reference("Like"), created: true});
add("delete", "/api/posts/{id}/like", "Posts", "Remove your reaction to a post", {auth: true, noContent: true});
add("post", "/api/posts/{id}/favorite", "Posts", "Add a post to your favorites", {auth: true, response: reference("Post"), created: true, conflict: true});
add("delete", "/api/posts/{id}/favorite", "Posts", "Remove a post from your favorites", {auth: true, noContent: true});
add("post", "/api/posts/{id}/subscribe", "Posts", "Follow a post", {auth: true, description: "You will receive emails for post updates, image uploads, new comments and deletion. Verify your email address to receive them.", response: reference("Post"), created: true, conflict: true});
add("delete", "/api/posts/{id}/subscribe", "Posts", "Stop following a post", {auth: true, noContent: true});

add("get", "/api/categories", "Categories", "Get all categories", {response: array(reference("Category"))});
add("get", "/api/categories/{id}", "Categories", "Get a category", {response: reference("Category")});
add("get", "/api/categories/{id}/posts", "Categories", "Get posts in a category", {optionalAuth: true, query: postQuery, response: reference("PostPage")});
add("post", "/api/categories", "Categories", "Create a category as an authenticated user", {auth: true, body: reference("CategoryInput"), response: reference("Category"), created: true});
add("patch", "/api/categories/{id}", "Categories", "Update a category as an admin", {auth: true, body: object({title: string, description: {type: "string", nullable: true}}), response: reference("Category")});
add("delete", "/api/categories/{id}", "Categories", "Delete a category as an admin", {auth: true, noContent: true});

add("get", "/api/comments/{id}", "Comments", "Get a comment", {optionalAuth: true, response: reference("Comment")});
add("patch", "/api/comments/{id}", "Comments", "Update a comment", {auth: true, description: "The author or an admin can edit content or lock the comment. The author or admin can change status.", body: object({content: string, status, is_locked: {type: "boolean"}}), response: reference("Comment")});
add("delete", "/api/comments/{id}", "Comments", "Delete a comment", {auth: true, noContent: true});
add("get", "/api/comments/{id}/like", "Comments", "Get reactions to a comment", {optionalAuth: true, response: array(reference("Like"))});
add("post", "/api/comments/{id}/like", "Comments", "React to a comment", {auth: true, body: reference("LikeInput"), response: reference("Like"), created: true});
add("delete", "/api/comments/{id}/like", "Comments", "Remove your reaction to a comment", {auth: true, noContent: true});

add("get", "/api/admin/comments", "Admin", "Get all comments as an admin", {auth: true, response: array(reference("Comment"))});
add("get", "/api/admin/likes", "Admin", "Get all reactions as an admin", {auth: true, response: array(reference("Like"))});
add("delete", "/api/admin/likes/{id}", "Admin", "Delete a reaction as an admin", {auth: true, noContent: true});

const openapi = {
    openapi: "3.0.3",
    info: {
        title: "USOF API",
        version: "1.0.0",
        description: "API for developer questions, posts, categories, comments and reactions. Log in to get a Bearer token for protected requests."
    },
    servers: [{url: "/"}],
    tags: ["Authentication", "Users", "Posts", "Categories", "Comments", "Admin"].map(name => ({name})),
    paths,
    components: {
        securitySchemes: {bearerAuth: {type: "http", scheme: "bearer", bearerFormat: "JWT"}},
        schemas
    }
};

export default openapi;

