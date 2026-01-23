# Деплой AI Chat в Digital Ocean

## Что уже сделано ✅
- ✅ Создан бэкенд (`server.js`)
- ✅ Добавлен чат-виджет в интерфейс
- ✅ Настроен System Prompt для ИИ
- ✅ Исправлен скролл в чате
- ✅ Модалка не появляется, если открыт чат

## Следующие шаги для деплоя:

### 1. Обновить `.env` с новым API ключом
После создания нового ключа в Perplexity, открой файл `.env` и вставь его:
```
PERPLEXITY_API_KEY=твой_новый_ключ
```

### 2. Протестировать локально
```bash
npm start
```
Открой http://localhost:3000 и проверь чат.

### 3. Закоммитить изменения в Git
```bash
git add .
git commit -m "Add AI chat widget with Virtual Azim"
git push origin main
```

### 4. Настроить Digital Ocean App Platform

#### Шаг 1: Зайди в панель управления
- Перейди на https://cloud.digitalocean.com/apps
- Выбери свой проект (copilot)

#### Шаг 2: Проверь настройки компонента
- Перейди в **Settings** → **Components**
- Убедись, что **Build Command** пустой (или `npm install`)
- Убедись, что **Run Command** = `npm start`

#### Шаг 3: Добавь переменные окружения
- Перейди в **Settings** → **App-Level Environment Variables**
- Нажми **Edit**
- Добавь следующие переменные:
  1. **Key:** `PERPLEXITY_API_KEY` | **Value:** `твой_ключ_от_perplexity`
  2. **Key:** `TELEGRAM_BOT_TOKEN` | **Value:** `8427673032:AAFsEK6O90s24SH_GN9T5o1EGjdXEoSsP7c`
  3. **Key:** `TELEGRAM_CHAT_ID` | **Value:** `5586955727`
- **Encrypt:** ✅ (включи шифрование для всех)
- Нажми **Save**

#### Шаг 4: Дождись автоматического деплоя
После push в GitHub, Digital Ocean автоматически:
1. Скачает новый код
2. Установит зависимости (`npm install`)
3. Запустит сервер (`npm start`)

### 5. Проверить работу
Открой свой сайт и проверь:
- ✅ Чат открывается
- ✅ Можно отправить сообщение
- ✅ ИИ отвечает
- ✅ Модалка не мешает

## Важные заметки:
- ⚠️ Файл `.env` НЕ попадет в Git (защищен `.gitignore`)
- ⚠️ API ключ хранится только в Digital Ocean (зашифрован)
- ⚠️ Если чат не работает — проверь логи в Digital Ocean (Runtime Logs)

## Стоимость API
Perplexity API платный. Следи за использованием на https://www.perplexity.ai/settings/api

## Контакты для помощи
Если что-то не работает:
1. Проверь логи в Digital Ocean
2. Проверь, что API ключ добавлен в Environment Variables
3. Убедись, что `npm start` работает локально
