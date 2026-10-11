# QuickNotes Data Model

## 1. Overview

The QuickNotes application stores notes containing a title and body. It uses the JSONPlaceholder REST API to retrieve example notes and simulate creating and deleting notes.

## 2. Note Entity

Each note contains the following fields:

| Field    | Data Type | Description                                         |
| -------- | --------- | --------------------------------------------------- |
| `id`     | Number    | Unique identifier for a note                        |
| `title`  | String    | The title of the note                               |
| `body`   | String    | The main content of the note                        |
| `userId` | Number    | Identifier for the user associated with an API note |

## 3. Validation Rules

- The title is required and must not exceed 100 characters.
- The note body is required and must not exceed 2,000 characters.
- Leading and trailing spaces are removed before submission.
- Each note must have an identifier so that it can be managed in the interface.

## 4. Data Management

The frontend uses JavaScript to manage the notes displayed on the page.

- **Read:** Notes are retrieved from the JSONPlaceholder API.
- **Create:** A new note is submitted to the API using a POST request.
- **Delete:** A note is deleted through a DELETE request and removed from the current interface state.

## 5. Storage Limitations

JSONPlaceholder is a testing API. It simulates creating and deleting records but does not permanently save those changes on its server.

New notes and deleted-note tracking are therefore managed in the browser's current session. Reloading the page may restore the original sample notes, and newly created notes may not remain available.

## 6. Future Improvements

A production version could use a database to permanently store notes, associate notes with authenticated users, and validate data on the server.
