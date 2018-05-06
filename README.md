# Grapevine
## What is it?
Want to listen to new music without the hassle of searching through hundreds of tracks? Now you can with Grapevine! Grapevine allows you to search for new music based on your personal preferences, or from some of Spotify's newest emerging genres!

## Screenshots
Main Page/Login:
![alt text](/screenshots/main.JPG?raw=true "Main Page/Login")
Register:
![alt text](/screenshots/register.JPG?raw=true "Register")
Base User Profile Creation:
![alt text](/screenshots/profile.JPG?raw=true "Base User Profile Creation")
Listening Choice:
![alt text](/screenshots/listen.JPG?raw=true "Listening Choice")
Suggestion:
![alt text](/screenshots/suggestion.JPG?raw=true "Suggestion")

## Development Tools
To create this application, I used Node.js + Express, along with the following modules: body-parser, ejs, mysql, npm, querystring, request, spotify-web-api-node. For the frontend, HTML and CSS with EJS templates were used. For databasing, a MySQL database running on Amazon RDS was utilized, and the application was hosted using Heroku.

## What I Learned
Overall, I was able to learn a lot about various backend web development topics, such has API integration, authentication, cloud databasing and hosting, as well as developing in Node.js.

## Future Goals
Firstly, I want to incorporate more integration with the data collected from users and what the application recommends. For example, I want to add a playlist recommendation feature that bases its suggestion from what other users are listening to depending on the current playlist found (think Amazon's 'Customers who bought this item also purchased').

Secondly, and more prominently, I want to further explore how a potential developer would use the data collected in this web application for meaningful analysis. For example, creating a developer tool that allows them to view and explore the data which would greatly improve their ability to use it and make decisions in their development.

## How to Use
To use all the files, use npm to install the required modules. Make sure to also change starred fields (such as usernames, AWS endpoints etc) to real values, such as a local database.
