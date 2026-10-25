INSERT INTO DbComment
    (id, post_id, author_id, publish_date, content, status)
VALUES
    (1, 1, 3, NOW(),
     'Async/await is built on top of Promises and makes asynchronous code easier to read.', 'active'),

    (2, 2, 4, NOW(),
     'You can use the mysql2 package to connect your Node.js application to MySQL.', 'active'),

    (3, 3, 5, NOW(),
     'Express middleware is executed between receiving the request and sending the response.', 'active'),

    (4, 4, 2, NOW(),
     'The N+1 problem happens when the application executes an additional query for each loaded entity.', 'inactive'),

    (5, 5, 3, NOW(),
     'Double provides more precision than float, but it also uses more memory.', 'active')
ON DUPLICATE KEY UPDATE id = id;
