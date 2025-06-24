# Tracki - Problem Solving Tracker

Tracki is a full-stack web application designed to help you track and organize your solved competitive programming and DSA problems.

## Features

-   **User Authentication:** Secure user registration and login.
-   **Add Problems:** A detailed form to add problems, including title, URL, platform, difficulty, custom tags, logic, and notes.
-   **Dynamic Inputs:** Autocomplete for platforms, difficulties, and tags, with the ability to create new ones on the fly.
-   **Problem Dashboard:** A comprehensive, searchable, and filterable view of all your solved problems.
-   **Data Export:** Export your problem data to a CSV file.

## Tech Stack

-   **Frontend:** Next.js (React) with TypeScript & Tailwind CSS
-   **Backend:** Flask (Python)
-   **Database:** PostgreSQL
-   **Containerization:** Docker

---

## Prerequisites

Before you begin, ensure you have the following installed on your system:

-   **Git:** [Installation Guide](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git)
-   **Python 3:** [Installation Guide](https://www.python.org/downloads/)
-   **Node.js (with npm):** [Installation Guide](https://nodejs.org/en/download/)
-   **Docker Desktop:** [Installation Guide](https://www.docker.com/products/docker-desktop/)

---

## Setup and Installation

### 1. Clone the Repository

First, clone the project repository to your local machine:

```bash
git clone <your-repository-url>
cd tracki
```

### 2. Configure Environment Variables

The project uses `.env` files for configuration.

-   **Backend:** In the `backend` directory, there is a `.env` file. Review it and change the `JWT_SECRET_KEY` to a new, random string. No other changes are needed if you are running the project locally with the default settings.

-   **Frontend:** In the `frontend` directory, there is a `.env.local` file. No changes are required for local setup.

### 3. Running the Application

We have provided convenient scripts to start all services (database, backend, and frontend).

#### For Windows Users

Use the `start.bat` script. You can run it by simply double-clicking the file or by running the following command in your terminal (like Command Prompt or PowerShell):

```bash
start.bat
```

This will:
1.  Start the PostgreSQL database using Docker.
2.  Open a new terminal for the backend, install dependencies, and run the Flask server.
3.  Open another new terminal for the frontend, install dependencies, and run the Next.js development server.

#### For macOS and Linux Users

Use the `start.sh` script. Make sure it's executable first:

```bash
chmod +x start.sh
```

Then run it:

```bash
./start.sh
```

This script performs the same actions as the Windows version.

---

## Accessing the Application

Once all services are running:

-   **Frontend (Your App):** Open your browser and go to `http://localhost:3000`
-   **Backend API:** The API is running at `http://localhost:5001`

To stop all services, go to the terminal where you ran the start script and press `Ctrl+C`. 