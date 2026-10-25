INSERT INTO DbCategory (id, title, description)
VALUES
    (1, 'JavaScript', 'Questions about JavaScript programming'),
    (2, 'Node.js', 'Questions about Node.js development'),
    (3, 'MySQL', 'Questions about MySQL databases'),
    (4, 'Entity Framework', 'Questions about the Entity Framawork'),
    (5, 'С#', 'Questions about Csharp')
ON DUPLICATE KEY UPDATE id = id;
