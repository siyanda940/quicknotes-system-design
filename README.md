# QuickNotes System Design

## Project Overview

QuickNotes is a lightweight web application that allows users to view, create, and delete notes. The project demonstrates frontend development, REST API integration, input validation, error handling, and basic system design documentation.

## Features

- View sample notes retrieved from an API.
- Create notes using a form.
- Delete notes from the current interface.
- Validate required fields before submission.
- Display loading, success, and error messages.
- Responsive layout for different screen sizes.

## Technologies Used

- HTML5
- CSS3
- JavaScript
- JSONPlaceholder REST API
- Git and GitHub

## Project Structure

```text
quicknotes-system-design/
├── index.html
├── style.css
├── api.js
├── README.md
└── docs/
    ├── api-design.md
    ├── data-model.md
    └── architecture.md
```

## Getting Started

1. Download or clone the repository.
2. Open the project folder in your code editor.
3. Open `index.html` in a browser, or use a local development server such as VS Code Live Server.
4. Ensure you have an internet connection so the application can communicate with the external API.

No backend installation or database setup is required for this prototype.

## API Integration

The application uses JSONPlaceholder:

`https://jsonplaceholder.typicode.com/posts`

It uses GET to retrieve sample records, POST to simulate creating a record, and DELETE to simulate deleting a record.

## Important Limitations

JSONPlaceholder is a testing API. Create and delete operations are simulated rather than permanently saved on the server. The application manages these changes in browser memory, so they may not persist after refreshing the page.

The prototype does not currently include user authentication or a dedicated backend database.

## System Design Documentation

Detailed documentation is available in the `docs/` directory:

- `api-design.md` — API endpoints, request handling, and validation.
- `data-model.md` — note fields, constraints, and data management.
- `architecture.md` — system components, data flow, and limitations.

## Future Improvements

- Add a backend service and permanent database storage.
- Implement user accounts and authentication.
- Add automated tests.
- Improve data persistence and API error handling.

## Author

Developed as a system design and web development project.
