# QuickNotes System Architecture

## 1. Overview

QuickNotes is a lightweight web application that allows users to view, create, and delete notes. It uses HTML, CSS, and JavaScript for the frontend and the JSONPlaceholder REST API for sample data and simulated write operations.

## 2. System Components

### Frontend

- **HTML:** Defines the page structure, note form, and notes list.
- **CSS:** Provides the visual design, layout, and responsive styling.
- **JavaScript:** Handles form validation, API requests, note rendering, and error messages.

### External API

The application communicates with the JSONPlaceholder API at:

`https://jsonplaceholder.typicode.com/posts`

The API provides sample note-like records and accepts simulated create and delete requests.

### Data Storage

The current application does not have its own backend or database. Notes created or deleted by the user are managed in browser memory during the current session.

## 3. Main Data Flow

### Loading Notes

1. The user opens the application.
2. JavaScript sends a GET request to retrieve sample posts.
3. The API returns data.
4. JavaScript displays the notes on the page.
5. If the request fails, the application displays an error message.

### Creating a Note

1. The user enters a title and body.
2. JavaScript validates the input.
3. The application sends a POST request.
4. The new note is added to the current interface state.
5. A success or error message is displayed.

### Deleting a Note

1. The user selects the delete button on a note.
2. JavaScript sends a DELETE request.
3. When the request succeeds, the note is removed from the current interface state.
4. The interface updates to reflect the change.

## 4. Architecture Diagram

The application's basic communication flow is:

User → Web Interface → JavaScript → JSONPlaceholder API

The API response returns to JavaScript, which updates the web interface.

## 5. Error Handling

The application handles common problems, including:

- Empty or invalid form fields.
- Failed API requests.
- Loading states while notes are retrieved.
- Feedback after successful or unsuccessful operations.

## 6. Security Considerations

- User input is validated before submission.
- API-provided text is escaped before being inserted into the HTML interface.
- API requests use HTTPS.
- The application does not currently implement authentication or authorization.
- A production system should validate inputs on the server and apply appropriate access controls.

## 7. Limitations and Future Improvements

The current project uses a mock API rather than a dedicated backend. Data changes are not permanently stored by JSONPlaceholder.

Future improvements could include a backend service, a database, user accounts, persistent note storage, and automated tests.
