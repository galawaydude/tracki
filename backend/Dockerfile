# Stage 1: Use the official Python image
FROM python:3.10-slim

# Set the working directory in the container
WORKDIR /app

# Copy the requirements file and install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application code
COPY . .

# Expose the port Gunicorn will run on
EXPOSE 5001

# Command to run the application using Gunicorn
CMD ["gunicorn", "--bind", "0.0.0.0:5001", "app:app"] 