INSERT INTO DbPost
    (id, author_id, title, publish_date, status, content)
VALUES
    (1, 2, 'How does async await work?', '2026-10-20 10:00:00', 'active',
     'I am trying to understand asynchronous programming in JavaScript.'),

    (2, 3, 'How to connect Node.js to MySQL?', '2026-10-23 15:30:00', 'active',
     'What is the best way to connect a Node.js application to MySQL?'),

    (3, 4, 'Express middleware problem', NOW(), 'active',
     'I do not understand how middleware works in Express.'),

    (4, 5, 'MySQL JOIN explanation', NOW(), 'active',
     'What is a N + 1 problem. How EF fix it?'),

    (5, 2, 'Node.js project structure', NOW(), 'inactive',
     'What is difference between double and float in C#?')
ON DUPLICATE KEY UPDATE id = id;
