# Notes

1. Using Docker compose to init a postgres database and the Nextjs app.
1. Using the "npm create t3-app@latest" to create a Nextjs app since it is one of the leading standard and opinionated [learn more from the founder himself](https://www.youtube.com/@t3dotgg).
1. Make it into docker project: <https://create.t3.gg/en/deployment/docker>. (Took a whole day since I was trying to seed the database with the docker-compose.yml file but looks like my understanding of docker it wrong.).
1. Added Email auth since it is easy and logging the login link so we don't use a email service to send real emails to users to login but to send real emails to users we only need to configure the email service in the [auth.ts](./app/src/server/auth.ts) file adding the missing values in EmailProvider config object.
1. Implemented the seed data base logic which should be run after the db is only. I still have some problems getting the docker to run the seeding logic but I will find a way around it late and I should fix the date to be in utc always when parsed. Make sure to run ```yarn prisma db seed```
1. Now I will try to build the trpc routes:
    To render patient page:
        - I need to get the patient info.
        - I need to get the patient data points. Sort them with the ORM query by date_testing so we don't have to do it in the js logic.
    To render the compare page:
        - I need to get the all patient info (maybe it should be limit to 100 and implement Pagination).
        - I need to get the all patient info for a search value to help with filtering them faster (maybe it should be limited to 100).
        - I need one to get all data points of a list of patients. Sort them with the ORM query by date_testing so we don't have to do it in the js logic.
