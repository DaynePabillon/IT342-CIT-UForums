# CIT-U Forums

A full-stack forum application built with Spring Boot and React for the CIT University community.

## Description
The CIT-U Community Forums is an interactive platform designed to keep students, teachers, and employees of CIT University informed about the latest updates, announcements, and events happening within the institution. Beyond serving as an official information hub, the forum encourages active participation by allowing students to voice their concerns, share ideas, and post their anonymous confessions, fostering a safe and inclusive environment for open dialogue. With user-friendly navigation and features tailored to the needs of the CIT community, the platform promotes collaboration, engagement, and transparency, making it an essential tool for strengthening the university's sense of connection and belonging.

## Project Structure

- **Backend**: Spring Boot application with REST API
  - Location: `Backend/CIT-Forums/`
  - Features: JWT authentication, forum CRUD operations, user management
  
- **Frontend**: React application
  - Location: `FrontEnd/cit-forums-client/`
  - Features: Modern UI built with Material-UI, responsive design, client-side routing

## Main Features

1. **User Registration and Profile Management**
2. **Forum Creation and Discussions**
3. **Administrative Moderations Panel**
4. **Real Time Notifications**
5. **Private Messaging System**
6. **Events and Activities Tracker**
7. **Responsive design for mobile and desktop**

## Setup and Running

### Prerequisites

- Java 17+
- Maven
- MySQL
- Node.js and npm

### Database Setup
j
1. Create a MySQL database named `citforums`
2. Database configuration is in `application.properties`

### Running the Application (Development Mode)

#### Backend:
```
cd Backend/CIT-Forums
mvn spring-boot:run
```

#### Frontend:
```
cd FrontEnd/cit-forums-client
npm install
npm start
```

### Building and Deploying as a Single Application

To build the React frontend and deploy it to the Spring Boot static resources:

```
.\build-and-deploy.bat
```

Then run the Spring Boot application:
```
cd Backend/CIT-Forums
mvn spring-boot:run
```

Access the application at: http://localhost:8080/

## Technology Stack

- **Backend**:
  - Spring Boot
  - Spring Security with JWT
  - Spring Data JPA
  - MySQL
  
- **Frontend**:
  - React
  - React Router
  - Material-UI
  - Axios

## Development

- The application is set up with proper CORS configuration for development
- Static resources are served from the backend when deployed as a single application

## Links
- **Figma Design**: https://www.figma.com/design/OXre9E04HjwjdW58qrdoXb/CIT-U-Forums?node-id=4-4&t=D0bViFZqUt8WVdjT-0
- **ERD**: https://lucid.app/lucidchart/9e330297-fc2c-4b79-acd6-efb755b45485/edit?invitationId=inv_730980a5-f061-4679-8c4f-ebc6ae3086a7

## Team Members

### Pabillon Dayne B (BSIT-3)
I am a student at CIT-U and aspiring to be a game developer or a software engineer. 
I try to do my best doing the things I love with the skills that I have. 
I usually spend my time learning new technologies, improving my coding skills, and working on personal projects.
I enjoy developing backend systems, working with databases, and exploring game development. 
Collaborating with others on projects helps me grow both as a developer and a team player.
I aim to create meaningful software that solves real-world problems while also pursuing my passion for game development.

### Jan Raye Edbert L. Dutosme (BSIT-3)
Yello! I am MrCareerBully. I am a programmer, a rhythm gamer (gamer), and a CITU College Student.
In terms of programming skills, I excel at Java, React, and Django.

### Emmanuel A. Cagampang Jr (BSIT-3)
I am currently 21 about to turn 22 this February 24th, 
I am open to all kinds of cuisine, I am the youngest among 5 siblings,
my current favorite song is Maybe Man by AJR, I am not the best at coding, 
please bear with me if I ask many questions, I may take a little longer to grasp things,
but I'm eager to learn. just guide me in the right direction and I can get the job done!

