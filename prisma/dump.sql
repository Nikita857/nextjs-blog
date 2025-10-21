-- Очистка существующих данных (опционально, если таблицы не пустые)
-- Порядок важен из-за внешних ключей
DELETE FROM "reactions";
DELETE FROM "friendships";
DELETE FROM "posts";
DELETE FROM "categories";
DELETE FROM "users";

-- Сброс последовательностей ID, если используются (для UUID не всегда нужно, но для безопасности)
-- ALTER SEQUENCE users_id_seq RESTART WITH 1;
-- ALTER SEQUENCE categories_id_seq RESTART WITH 1;
-- ALTER SEQUENCE posts_id_seq RESTART WITH 1;
-- ALTER SEQUENCE reactions_id_seq RESTART WITH 1;
-- ALTER SEQUENCE friendships_id_seq RESTART WITH 1;


-- Вставка пользователей
INSERT INTO "users" (id, name, email, password, image, "created_at", "updated_at") VALUES
('user1_uuid', 'Алиса Смит', 'alice@example.com', 'password123', 'https://i.pravatar.cc/150?img=1', NOW(), NOW()),
('user2_uuid', 'Боб Джонсон', 'bob@example.com', 'password123', 'https://i.pravatar.cc/150?img=2', NOW(), NOW()),
('user3_uuid', 'Чарли Браун', 'charlie@example.com', 'password123', 'https://i.pravatar.cc/150?img=3', NOW(), NOW());

-- Вставка категорий
INSERT INTO "categories" (id, name) VALUES
('cat1_uuid', 'Технологии'),
('cat2_uuid', 'Жизнь'),
('cat3_uuid', 'Программирование');

-- Вставка постов
INSERT INTO "posts" (id, title, content, published, "created_at", "updated_at", "authorId") VALUES
('post1_uuid', 'Как начать программировать на Next.js', 'Next.js - это мощный фреймворк для React, который позволяет создавать полнофункциональные веб-приложения. Начните с установки Node.js и затем используйте команду `npx create-next-app`.', TRUE, NOW(), NOW(), 'user1_uuid'),
('post2_uuid', '10 советов для продуктивной работы', 'Продуктивность - это не только количество сделанного, но и качество. Попробуйте метод Помодоро, делайте перерывы и не забывайте о физической активности.', TRUE, NOW(), NOW(), 'user2_uuid'),
('post3_uuid', 'Будущее искусственного интеллекта', 'Искусственный интеллект продолжает развиваться семимильными шагами, меняя все сферы нашей жизни. От автономных автомобилей до персонализированных рекомендаций - ИИ уже здесь.', FALSE, NOW(), NOW(), 'user1_uuid'),
('post4_uuid', 'Мой первый опыт с Prisma', 'Prisma - это современный ORM, который значительно упрощает работу с базами данных в Node.js и TypeScript. Мне очень понравился его синтаксис и типобезопасность.', TRUE, NOW(), NOW(), 'user3_uuid');

-- Связывание постов с категориями (таблица _CategoryToPost)
INSERT INTO "_CategoryToPost" ("A", "B") VALUES
('cat1_uuid', 'post1_uuid'),
('cat3_uuid', 'post1_uuid'),
('cat2_uuid', 'post2_uuid'),
('cat1_uuid', 'post3_uuid'),
('cat3_uuid', 'post4_uuid');

-- Вставка реакций
INSERT INTO "reactions" (id, "userId", "postId", type, "created_at") VALUES
('reaction1_uuid', 'user2_uuid', 'post1_uuid', 'LIKE', NOW()),
('reaction2_uuid', 'user3_uuid', 'post1_uuid', 'LIKE', NOW()),
('reaction3_uuid', 'user1_uuid', 'post2_uuid', 'DISLIKE', NOW());

-- Вставка запросов на дружбу
INSERT INTO "friendships" (id, "senderId", "receiverId", status, "created_at", "updated_at") VALUES
('friendship1_uuid', 'user1_uuid', 'user2_uuid', 'ACCEPTED', NOW(), NOW()),
('friendship2_uuid', 'user2_uuid', 'user3_uuid', 'PENDING', NOW(), NOW());
