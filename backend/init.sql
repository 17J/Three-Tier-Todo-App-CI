DROP TABLE IF EXISTS tasks;

CREATE TABLE tasks (
    id VARCHAR(36) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    priority ENUM('LOW', 'MEDIUM', 'HIGH') NOT NULL DEFAULT 'MEDIUM',
    status ENUM('TODO', 'INPROGRESS', 'DONE') NOT NULL DEFAULT 'TODO',
    category ENUM('WORK', 'PERSONAL', 'STUDY', 'OTHER') NOT NULL DEFAULT 'WORK',
    created_at DATETIME NOT NULL,
    due_date DATETIME
);

-- Sample data
INSERT INTO tasks (id, title, description, priority, status, category, created_at, due_date) VALUES
(UUID(), 'Write documentation', 'Document the backend REST APIs', 'HIGH', 'TODO', 'WORK', NOW(), DATE_ADD(NOW(), INTERVAL 7 DAY)),
(UUID(), 'Grocery shopping', 'Buy vegetables and fruits', 'MEDIUM', 'INPROGRESS', 'PERSONAL', NOW(), DATE_ADD(NOW(), INTERVAL 3 DAY)),
(UUID(), 'Study Spring Boot', 'Go through the Spring Boot crash course', 'HIGH', 'TODO', 'STUDY', NOW(), DATE_ADD(NOW(), INTERVAL 5 DAY)),
(UUID(), 'Clean workspace', 'Organize desk and files', 'LOW', 'DONE', 'OTHER', NOW(), DATE_ADD(NOW(), INTERVAL 1 DAY));
