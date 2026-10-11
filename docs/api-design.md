# QuickNotes System Design: API Design

## 1. Overview

QuickNotes is a responsive notes application that allows users to retrieve, create, and delete notes. The frontend is built with HTML, CSS, and JavaScript.

The application uses JSONPlaceholder as a mock REST API. This service allows us to demonstrate HTTP requests without building a separate backend.

**Base URL:** `https://jsonplaceholder.typicode.com`

## 2. API Endpoints

| Operation      | HTTP Method | Endpoint      | Purpose                             |
| -------------- | ----------- | ------------- | ----------------------------------- |
| Retrieve notes | GET         | `/posts`      | Fetch example notes from the API    |
| Create a note  | POST        | `/posts`      | Submit a new note                   |
| Delete a note  | DELETE      | `/posts/{id}` | Request deletion of a selected note |

### GET /posts

Retrieves a collection of example posts to display as notes.

**Expected response:** HTTP 200 OK with a JSON array of posts.

The frontend displays the first eight posts to keep the interface manageable.

### POST /posts

Submits a new note to the API.

**Request body:**

```json
{
  "title": "My first QuickNote",
  "body": "Today I built my first notes application!",
  "userId": 1
}
```

**Expected response:** HTTP 201 Created with a JSON representation of the submitted post.

The frontend displays the returned note and shows a success message. JSONPlaceholder simulates this operation and does not permanently store the new post.

### DELETE /posts/{id}

Sends a DELETE request for the selected note.

**Example:** `DELETE /posts/1`

**Expected response:** HTTP 200 OK with a simulated response.

After a successful response, the frontend removes the note from the current view. JSONPlaceholder does not permanently modify its underlying dataset.

## 3. Data Format

Requests and responses use JSON (JavaScript Object Notation).

POST requests include the following header:

`Content-Type: application/json`

The application uses JavaScript's `fetch()` API with `async/await` and `try/catch` to handle HTTP requests and errors.

## 4. Validation

Before submitting a note, the frontend checks that:

- The title is not empty.
- The note body is not empty.
- Leading and trailing whitespace is removed.
- The title is limited to 100 characters.
- The note body is limited to 2,000 characters.

The HTML form uses required fields, while JavaScript performs additional validation before making the POST request.

## 5. Error Handling

The application handles errors as follows:

- **Loading:** Displays a message while notes are being retrieved.
- **HTTP errors:** Checks the response status and handles unsuccessful requests.
- **Network errors:** Uses `try/catch` and displays a helpful message if a request fails.
- **Validation errors:** Prevents submission when required fields are missing.
- **Success:** Displays confirmation after a successful create or delete request.

The interface does not expose technical error details to the user. Developers can inspect the browser console for debugging information.

## 6. API Limitations

JSONPlaceholder is a demonstration service, not a production database. Its write operations are simulated. New notes and deletions are maintained in the frontend's current session state and are not permanently saved by the API.

A production version would require a backend, persistent database, authentication, authorization, and appropriate request validation.

## 7. Future Improvements

Potential improvements include:

- User authentication and private notes.
- Persistent storage in a database.
- Search, sorting, and editing features.
- Pagination for larger note collections.
- Automated API and frontend tests.
- Rate limiting and stronger server-side validation.

## 8. Conclusion

The API design demonstrates how a frontend client communicates with a REST API using GET, POST, and DELETE requests. It also demonstrates input validation, loading states, error handling, and the limitations of a mock backend.
