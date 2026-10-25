const subscribers = new Map();

export function subscribeToPost(postId, response) {
    const key = String(postId);
    if (!subscribers.has(key)) subscribers.set(key, new Set());
    const clients = subscribers.get(key);
    clients.add(response);

    return () => {
        clients.delete(response);
        if (!clients.size) subscribers.delete(key);
    };
}

export function publishPostEvent(postId) {
    for (const response of subscribers.get(String(postId)) ?? []) {
        if (!response.write("event: comments-changed\ndata: {}\n\n")) response.end();
    }
}
