## How to Run the App

To get the app up and running, follow these steps. This assumes you have [Node.js](https://nodejs.org/) and npm installed on your machine.

1. **Install Dependencies**  
   Make sure all the required packages are installed by running:  
   ```bash
   cd frontend
   npm install
   ```

    ```bash
   cd ..
   cd backend
   npm install
   ```
2. **Start the backend**
    Move into the `backend` folder and launch the server:
    ```
    cd backend
    npm start
    ```
    This'll start the backend server (on http://localhost:5001)

    **Note**: If you get an error saying that the port is already in use make sure to change it in both the `server.js` file and in the `Gamescreen.js` file.

3. **start the Frontend**
    Open a seperate terminal, navigate to the frontend folder, and run:
    ```
    cd frontend 
    npm start
    ```
    This will launch the frontend (on http://localhost:3000) which connects to the backend

