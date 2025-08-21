# Workcity Assessment Backend
## Setup Instructions

## Prerequisites:

- Node.js (v16 or higher)
- MongoDB (running locally or via a cloud provider)
- npm 


## Installation:
- git clone https://github.com/mckent05/workcity-assessment-backend.git
- cd workcity-assessment-backend
- npm install


- Environment Variables:Create a .env file in the root directory:
- JWT_SECRET=your_jwt_secret
- MONGODB_URI="mongodb+srv://atemitope95:<password>@cluster0.ygieuvz.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"


## Running the Application:
- ```npm run dev```


## Running Tests:
- ```npm test```


## Assumptions

- JWT secret is a simple string for development; in production, use a secure key.
- The API runs on port 3000.
- Only admin users can perform Delete operations (not fully enforced in this version for simplicity).
- Unit tests cover only the Create Client and Update Project endpoints as specified.

## Endpoints

- POST /api/auth/signup - Register a new user
- POST /api/auth/login - Login and receive JWT
- POST /api/clients - Create a client
- GET /api/clients - List all clients
- GET /api/clients/:id - Get client details
- PUT /api/clients/:id - Update a client
- DELETE /api/clients/:id - Delete a client
- POST /api/projects - Create a project
- GET /api/projects - List all projects
- GET /api/projects/client/:clientId - List projects by client
- PUT /api/projects/:id - Update a project
- DELETE /api/projects/:id - Delete a project
