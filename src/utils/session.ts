// src/utils/session.ts
export const getOrCreateUserId = (): string => {
    let userId = localStorage.getItem('userId');

    if (!userId) {
        // Генерируем новый уникальный ID
        userId = crypto.randomUUID();
        // Сохраняем в localStorage
        localStorage.setItem('userId', userId);
        // Можно отправить на сервер для регистрации сессии
        // registerNewUserSession(userId);
    }

    return userId;
};