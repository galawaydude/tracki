# Tracki Project

This project is a full-stack application with a Next.js frontend, a Flask backend, and a PostgreSQL database.

## Getting Started

This project is set up to be run with a single command for local development.

### Prerequisites

*   [Node.js](https://nodejs.org/) (v18 or later recommended)
*   [Python](https://www.python.org/downloads/) (v3.8 or later)
*   [Docker](https://www.docker.com/products/docker-desktop/)

### Running the Application

To start the entire application (database, backend, and frontend), navigate to the project's root directory and run the following command:

```bash
./start.sh
```

This script will handle everything for you:
1.  It tears down any old containers and **deletes the old database data** to ensure a clean start.
2.  It starts a fresh PostgreSQL database in a Docker container.
3.  It creates a Python virtual environment for the backend and installs its dependencies.
4.  It installs the frontend's Node.js dependencies.
5.  It starts the backend and frontend servers.

You can then access the application in your browser:
*   **Frontend:** [http://localhost:3000](http://localhost:3000)
*   **Backend API:** [http://localhost:5001](http://localhost:5001)

To stop all the services, press `Ctrl+C` in the terminal where the script is running. The script will automatically shut down the database and all servers. 