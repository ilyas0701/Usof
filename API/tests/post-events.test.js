import test from "node:test";
import assert from "node:assert/strict";
import { publishPostEvent, subscribeToPost } from "../services/PostEvents.js";

function client(writable = true) {
    return {
        messages: [],
        ended: false,
        write(message) {
            this.messages.push(message);
            return writable;
        },
        end() {
            this.ended = true;
        }
    };
}

test("delivers events only to subscribers of the changed post", () => {
    const first = client();
    const second = client();
    const other = client();
    const cleanup = [subscribeToPost(1, first), subscribeToPost("1", second), subscribeToPost(2, other)];
    try {
        publishPostEvent(1);
        assert.deepEqual(first.messages, ["event: comments-changed\ndata: {}\n\n"]);
        assert.deepEqual(second.messages, first.messages);
        assert.deepEqual(other.messages, []);
    } finally {
        cleanup.forEach(unsubscribe => unsubscribe());
    }
});

test("disconnecting one subscriber keeps other connections active", () => {
    const first = client();
    const second = client();
    const unsubscribeFirst = subscribeToPost(3, first);
    const unsubscribeSecond = subscribeToPost(3, second);
    unsubscribeFirst();
    try {
        publishPostEvent(3);
        assert.equal(first.messages.length, 0);
        assert.equal(second.messages.length, 1);
    } finally {
        unsubscribeSecond();
    }
    publishPostEvent(3);
    assert.equal(second.messages.length, 1);
});

test("closes a slow connection so it can reconnect and resynchronize", () => {
    const slow = client(false);
    const unsubscribe = subscribeToPost(4, slow);
    try {
        publishPostEvent(4);
        assert.equal(slow.ended, true);
    } finally {
        unsubscribe();
    }
});
