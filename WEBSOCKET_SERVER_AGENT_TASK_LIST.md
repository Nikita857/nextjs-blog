# Задача для агента Gemini: Реализация WebSocket-сервера для чата

## Контекст проекта

Это Next.js приложение, использующее TypeScript, Prisma (PostgreSQL) для работы с базой данных и NextAuth.js для аутентификации.

**Цель:** Реализовать отдельный WebSocket-сервер на Node.js с использованием `socket.io` для обеспечения функционала чата в реальном времени.

## Существующие модели базы данных (Prisma)

В `prisma/schema.prisma` определены следующие модели, относящиеся к чату:

```prisma
// Модель для чата между двумя пользователями
model Conversation {
  id        String    @id @default(uuid())
  user1Id   String
  user1     User      @relation("User1Conversations", fields: [user1Id], references: [id])
  user2Id   String
  user2     User      @relation("User2Conversations", fields: [user2Id], references: [id])
  messages  Message[]
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt

  @@unique([user1Id, user2Id])
  @@map("conversations")
}

// Модель для сообщений в чате
model Message {
  id             String       @id @default(uuid())
  conversationId String
  conversation   Conversation @relation(fields: [conversationId], references: [id], onDelete: Cascade)
  senderId       String
  sender         User         @relation(fields: [senderId], references: [id])
  content        String       @db.Text
  createdAt      DateTime     @default(now())

  @@map("messages")
}

// Модель User (сокращенно, только релевантные части)
model User {
  id                     String       @id @default(uuid())
  email                  String       @unique
  // ... другие поля ...
  user1Conversations Conversation[] @relation("User1Conversations")
  user2Conversations Conversation[] @relation("User2Conversations")
  sentMessages           Message[]      @relation("SentMessages")
  // ...
}
```

## Существующие Server Actions (для управления чатом)

На фронтенде будут использоваться Server Actions для создания чатов и получения истории. WebSocket-сервер будет отвечать за отправку и получение сообщений в реальном времени.

## Задача для WebSocket-сервера

**1. Создание файла сервера:**
   *   Создать файл `websocket-server.ts` в корне проекта.
   *   Установить необходимые зависимости: `npm install socket.io @prisma/client ts-node` (если `ts-node` еще не установлен).

**2. Базовая настройка Socket.IO сервера:**
   *   Запустить Socket.IO сервер на отдельном порту (например, `3001` или `3002`, чтобы не конфликтовать с Next.js).
   *   Настроить CORS, чтобы Next.js приложение могло к нему подключаться.
   *   Интегрировать `PrismaClient` для работы с базой данных.

**3. Обработка соединений:**
   *   Слушать событие `connection` для новых клиентов.
   *   Слушать событие `disconnect` для отключения клиентов.
   *   **Аутентификация:** При подключении клиента, необходимо аутентифицировать пользователя. Это можно сделать, передавая токен (например, JWT) в handshake-запросе Socket.IO. Сервер должен будет верифицировать этот токен и связать сокет с `userId`.

**4. Управление комнатами (Conversations):**
   *   Клиенты должны присоединяться к "комнатам", соответствующим `conversationId`.
   *   При подключении клиента, после аутентификации, сервер должен определить, в каких чатах состоит пользователь, и присоединить его ко всем соответствующим комнатам.
   *   Событие `joinConversation`: Клиент может явно запросить присоединение к комнате чата.

**5. Отправка сообщений:**
   *   Слушать событие `sendMessage` от клиента. Ожидаемый payload: `{ conversationId: string, content: string }`.
   *   **Валидация:** Проверить, что отправитель (`userId` из аутентификации) является участником `conversationId`.
   *   **Сохранение в БД:** Сохранить сообщение в модель `Message` через Prisma.
   *   **Трансляция:** Отправить сообщение всем участникам соответствующей комнаты (`io.to(conversationId).emit('receiveMessage', message)`). Payload для `receiveMessage` должен включать `id` сообщения, `conversationId`, `senderId`, `content`, `createdAt`.

**6. Получение сообщений:**
   *   Клиент будет слушать событие `receiveMessage`.

**7. Обработка ошибок:**
   *   Логировать ошибки сервера и клиента.

**8. Запуск сервера:**
   *   Сервер должен запускаться как отдельный Node.js процесс. Например, командой `ts-node websocket-server.ts` или `node websocket-server.js` (после компиляции).
