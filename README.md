# Tracki - Problem Solving Tracker

Tracki is a full-stack web application designed to help you track and organize your solved competitive programming and DSA problems.

---

## Table of Contents
1.  [Local Development Setup](#local-development-setup)
2.  [Azure Deployment Guide](#azure-deployment-guide)
    - [Prerequisites for Azure](#prerequisites-for-azure)
    - [Step 1: Deploy the Database](#step-1-deploy-the-database-azure-database-for-postgresql)
    - [Step 2: Deploy the Backend](#step-2-deploy-the-backend-azure-app-service)
    - [Step 3: Deploy the Frontend](#step-3-deploy-the-frontend-azure-static-web-apps)
    - [Step 4: Final Configuration](#step-4-final-configuration-connecting-the-services)
3.  [Managing Your Deployed App](#managing-your-deployed-app)

---

## Local Development Setup

### Tech Stack
-   **Frontend:** Next.js & Tailwind CSS
-   **Backend:** Flask (Python)
-   **Database:** PostgreSQL (via Docker)

### Prerequisites
-   Git, Python 3, Node.js, and Docker Desktop.

### Running Locally
This project includes scripts to automate the local setup.

-   **On Windows:** Run `start.bat`.
-   **On macOS/Linux:** Run `chmod +x start.sh` once, then `./start.sh`.

The scripts handle everything. Once running, access the app at `http://localhost:3000`.

---

## Azure Deployment Guide

This guide provides a complete walkthrough for deploying your application to a scalable, production-ready environment on Microsoft Azure.

### Prerequisites for Azure
1.  **Azure Account:** You need an Azure account with an active subscription. [Create one for free](https://azure.microsoft.com/free/).
2.  **Azure CLI:** Install the Azure CLI on your computer. [Installation Guide](https://docs.microsoft.com/cli/azure/install-azure-cli).
3.  **GitHub Repository:** Your project code must be pushed to a GitHub repository.
4.  **Log in to Azure:** Open your terminal and log in to your Azure account by running:
    ```bash
    az login
    ```

### Step 1: Deploy the Database (Azure Database for PostgreSQL)

First, we'll create a managed, production-ready PostgreSQL database.

1.  **Define Unique Names & Variables:**
    Choose unique names for your resources. Replace `"YourUniqueName"` and `"YourPassword"` in the commands below.
    ```bash
    # Variable for the resource group (a container for all your app's resources)
    RESOURCE_GROUP="tracki-rg"
    LOCATION="eastus" # Or choose a region closer to you

    # Variables for the database
    POSTGRES_SERVER_NAME="tracki-db-server-YourUniqueName"
    POSTGRES_ADMIN_USER="trackiadmin"
    POSTGRES_ADMIN_PASSWORD="YourSecurePassword123" # Must be complex
    ```

2.  **Create a Resource Group:**
    ```bash
    az group create --name $RESOURCE_GROUP --location $LOCATION
    ```

3.  **Create the PostgreSQL Server:**
    This command creates a new PostgreSQL server. We use the `B_Gen5_1` SKU, which is a cost-effective choice.
    ```bash
    az postgres flexible-server create \
      --name $POSTGRES_SERVER_NAME \
      --resource-group $RESOURCE_GROUP \
      --location $LOCATION \
      --admin-user $POSTGRES_ADMIN_USER \
      --admin-password "$POSTGRES_ADMIN_PASSWORD" \
      --sku-name Standard_B1ms \
      --tier Burstable \
      --public-access 0.0.0.0 \
      --storage-size 32 \
      --version 13
    ```
    *Note: The `--public-access 0.0.0.0` command allows all IPs to connect. We will tighten this later.*

4.  **Create the Database:**
    Now we connect to the server and create the actual `tracki` database.
    ```bash
    az postgres flexible-server db create \
      --server-name $POSTGRES_SERVER_NAME \
      --resource-group $RESOURCE_GROUP \
      --database-name tracki
    ```

5.  **Get the Database Connection String:**
    This is the most important output. We will save this URL to use in our backend's configuration.
    ```bash
    az postgres flexible-server show-connection-string -s $POSTGRES_SERVER_NAME -u $POSTGRES_ADMIN_USER -p "$POSTGRES_ADMIN_PASSWORD" -d tracki -t "Bash"
    ```
    Copy the connection string. It will look something like `postgres://trackiadmin:YourSecurePassword123@tracki-db-server-YourUniqueName.postgres.database.azure.com/tracki`. **Save this URL securely.**

### Step 2: Deploy the Backend (Azure App Service)

Next, we will deploy the containerized Flask backend.

1.  **Define Unique Names:**
    ```bash
    # Azure Container Registry (to store your Docker image)
    ACR_NAME="trackiacrYourUniqueName"

    # Azure App Service (to run your backend)
    APP_SERVICE_NAME="tracki-app-YourUniqueName"
    ```

2.  **Create an Azure Container Registry (ACR):**
    ```bash
    az acr create --name $ACR_NAME --resource-group $RESOURCE_GROUP --sku Basic --admin-enabled true
    ```

3.  **Build and Push the Docker Image:**
    These commands log you into your new container registry, build the backend Docker image, and push it up to the registry.
    ```bash
    # Log in to ACR
    az acr login --name $ACR_NAME

    # Build the image (run from the project's root directory)
    docker build -t $ACR_NAME.azurecr.io/tracki-backend:latest ./backend

    # Push the image
    docker push $ACR_NAME.azurecr.io/tracki-backend:latest
    ```

4.  **Create an App Service Plan:**
    This defines the underlying virtual server that will run your application.
    ```bash
    az appservice plan create --name "tracki-backend-plan" --resource-group $RESOURCE_GROUP --sku B1 --is-linux
    ```

5.  **Create the Web App and Configure It:**
    This command creates the App Service, points it to your Docker image in ACR, and sets up the required environment variables.
    ```bash
    az webapp create \
      --name $APP_SERVICE_NAME \
      --resource-group $RESOURCE_GROUP \
      --plan "tracki-backend-plan" \
      --deployment-container-image-name "$ACR_NAME.azurecr.io/tracki-backend:latest" \
      --docker-registry-server-url "https://$ACR_NAME.azurecr.io" \
      --docker-registry-server-user $(az acr credential show -n $ACR_NAME --query "username" -o tsv) \
      --docker-registry-server-password $(az acr credential show -n $ACR_NAME --query "passwords[0].value" -o tsv)

    # Now, set the environment variables for the app
    az webapp config appsettings set \
      --name $APP_SERVICE_NAME \
      --resource-group $RESOURCE_GROUP \
      --settings \
        "DATABASE_URL=PASTE_YOUR_DATABASE_URL_HERE" \
        "JWT_SECRET_KEY=YourNewSuperSecretKeyHere" \
        "CORS_ORIGINS=http://localhost:3000" # We will update this later
    ```
    **Important:** Replace `PASTE_YOUR_DATABASE_URL_HERE` with the URL from Step 1, and generate a new secret for `JWT_SECRET_KEY`.

6.  **Get Your Backend URL:**
    Your backend is now deployed. Find its public URL in the Azure Portal on the "Overview" page of your App Service. It will be something like `https://tracki-app-YourUniqueName.azurewebsites.net`. **Save this URL.**

### Step 3: Deploy the Frontend (Azure Static Web Apps)

Now we deploy the Next.js frontend.

1.  **Use the VS Code Azure Extension (Easiest Method):**
    -   Install the "Azure Tools" extension pack in VS Code.
    -   Open your project, go to the Azure extension tab, find "Static Web Apps", and click the `+` icon to create a new one.
    -   The wizard will guide you:
        -   **Select subscription:** Choose your Azure subscription.
        -   **Enter a name:** e.g., `tracki-frontend`.
        -   **Choose a region:** Pick the same region as your other resources (e.g., `East US 2`).
        -   **Select project structure:** Choose `Next.js`.
        -   **App location:** Enter `/frontend`.
        -   **Build location:** This will be detected automatically.
    -   After you click "Create", the extension will commit a GitHub Actions workflow file to your repository. This file tells GitHub how to build and deploy your app.

2.  **Configure the Environment Variable:**
    -   Once the Static Web App is created, find it in the Azure Portal.
    -   Go to the **Configuration** tab.
    -   Add a new application setting:
        -   **Name:** `NEXT_PUBLIC_API_URL`
        -   **Value:** Paste the backend URL you saved from Step 2 (e.g., `https://tracki-app-YourUniqueName.azurewebsites.net`).
    -   Save the changes.

3.  **Get Your Frontend URL:**
    Your frontend is now deployed. Find its public URL on the "Overview" page of your Static Web App. It will be something like `https://calm-beach-0...d6.azurestaticapps.net`. **Save this URL.**

### Step 4: Final Configuration (Connecting the Services)

Finally, we need to allow the deployed frontend to communicate with the backend.

1.  **Update Backend CORS Settings:**
    -   Go back to your **App Service** in the Azure Portal.
    -   Go to the **Configuration** tab.
    -   Find the `CORS_ORIGINS` setting and click to edit it.
    -   **Value:** Paste your **frontend URL** here. If you want to allow both local and deployed frontends, you can use a comma-separated list: `http://localhost:3000,https://your-frontend-url.azurestaticapps.net`.
    -   Save the changes. The App Service will restart.

**Your application is now fully deployed and live on Azure!**

---

## Managing Your Deployed App

-   **Viewing Logs:** To debug issues, you can view live logs from your backend App Service. Go to the "Log stream" tab in the Azure Portal.
-   **CI/CD:** Your deployment is automated. Pushing a new commit to your `main` branch on GitHub will automatically trigger a new build and deployment for your frontend. To update the backend, you need to rebuild and push the Docker image (Step 2.3) and restart the App Service.
-   **Cost Management:** To save costs, you can stop your App Service and PostgreSQL server when you are not using them. Remember to start them again when needed. 