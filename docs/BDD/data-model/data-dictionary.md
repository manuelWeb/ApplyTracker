# Dictionnaire de données

## Objectif

Décrit les données manipulées par l'application afin de préparer le MPD, les entités TypeORM, les DTOs NestJS et le seed.

## Tables / entités

### user

| Column        | Type         | Required | Key    | Default        | Description            | Constraints                |
| ------------- | ------------ | -------- | ------ | -------------- | ---------------------- | -------------------------- |
| user_id       | int          | yes      | PK     | auto_increment | Unique user identifier | positive                   |
| email         | varchar(255) | yes      | UNIQUE |                | User login email       | valid email                |
| password_hash | varchar(255) | yes      |        |                | Hashed password        | never store plain password |

### application

| Column          | Type         | Required | Key | Default        | Description                       | Constraints                      |
| --------------- | ------------ | -------- | --- | -------------- | --------------------------------- | -------------------------------- |
| application_id  | int          | yes      | PK  | auto_increment | Unique application identifier     | positive                         |
| job_title       | varchar(255) | yes      |     |                | Job title for the application     | max chars 255                    |
| job_domain      | varchar(255) | no       |     |                | Domain related to the job         | max chars 255                    |
| project_goal    | text         | no       |     |                | Main goal of the related project  |                                  |
| job_description | text         | no       |     |                | Job offer description             |                                  |
| score           | int          | no       |     | 0              | Application score                 | between 0 and 100                |
| job_url         | text         | no       |     |                | Original job offer URL            | valid URL                        |
| location        | varchar(255) | no       |     |                | Job location                      | max 255 chars                    |
| company_id      | int          | yes      | FK  |                | Related company                   | references COMPANY(company_id)   |
| user_id         | int          | yes      | FK  |                | Owner of the application          | references USER(user_id)         |
| contract_id     | int          | yes      | FK  |                | Contract type                     | references CONTRACT(contract_id) |
| status_id       | int          | yes      | FK  |                | Current status of the application | references STATUS(status_id)     |

### company

| Column     | Type         | Required | Key | Default        | Description               | Constraints              |
| ---------- | ------------ | -------- | --- | -------------- | ------------------------- | ------------------------ |
| company_id | int          | yes      | PK  | auto_increment | Unique company identifier | positive                 |
| name       | varchar(255) | yes      |     |                | Company name              | max chars 255            |
| website    | varchar(255) | no       |     |                | Company website URL       | valid URL, max chars 255 |

### contact

| Column     | Type         | Required | Key | Default        | Description                    | Constraints                      |
| ---------- | ------------ | -------- | --- | -------------- | ------------------------------ | -------------------------------- |
| contact_id | int          | yes      | PK  | auto_increment | Unique contact identifier      | positive                         |
| first_name | varchar(255) | yes      |     |                | Contact's first name           | max chars 255                    |
| last_name  | varchar(255) | yes      |     |                | Contact's last name            | max chars 255                    |
| email      | varchar(255) | yes      |     |                | Contact's email                | valid email, max chars 255       |
| phone      | varchar(20)  | no       |     |                | Contact's phone number         | valid phone format, max chars 20 |
| role       | varchar(255) | no       |     |                | Contact's role in company      | max chars 255                    |
| notes      | text         | no       |     |                | Additional notes about contact |                                  |
| company_id | int          | yes      | FK  |                | Related company                | references COMPANY(company_id)   |

### email_template

| Column            | Type         | Required | Key | Default        | Description                      | Constraints              |
| ----------------- | ------------ | -------- | --- | -------------- | -------------------------------- | ------------------------ |
| email_template_id | int          | yes      | PK  | auto_increment | Unique email template identifier | positive                 |
| name              | varchar(255) | yes      |     |                | Name of the email template       | max chars 255            |
| subject           | varchar(255) | yes      |     |                | Subject line of the email        | max chars 255            |
| body              | text         | yes      |     |                | Body content of the email        |                          |
| user_id           | int          | yes      | FK  |                | Owner of the email template      | references USER(user_id) |

## event

| Column         | Type         | Required | Key | Default           | Description                       | Constraints                            |
| -------------- | ------------ | -------- | --- | ----------------- | --------------------------------- | -------------------------------------- |
| event_id       | int          | yes      | PK  | auto_increment    | Unique event identifier           | positive                               |
| event_type     | varchar(255) | yes      |     |                   | Type of the event                 | max chars 255                          |
| occurred_at    | timestamp    | yes      |     | CURRENT_TIMESTAMP | Date and time when event occurred |                                        |
| application_id | int          | yes      | FK  |                   | Related application               | references APPLICATION(application_id) |

## document

| Column        | Type         | Required | Key | Default        | Description                           | Constraints     |
| ------------- | ------------ | -------- | --- | -------------- | ------------------------------------- | --------------- |
| document_id   | int          | yes      | PK  | auto_increment | Unique document identifier            | positive        |
| name          | varchar(255) | yes      |     |                | Name of the document                  | max chars 255   |
| document_type | varchar(255) | yes      |     |                | Type of the document (ex: CV, letter) | max chars 255   |
| file_path     | text         | yes      |     |                | File path to the stored document      | valid file path |

## comment

| Column     | Type      | Required | Key | Default           | Description                  | Constraints                |
| ---------- | --------- | -------- | --- | ----------------- | ---------------------------- | -------------------------- |
| comment_id | int       | yes      | PK  | auto_increment    | Unique comment identifier    | positive                   |
| content    | text      | yes      |     |                   | Content of the comment       |                            |
| created_at | timestamp | yes      |     | CURRENT_TIMESTAMP | Date of the comment creation |                            |
| event_id   | int       | yes      | FK  |                   | Related event                | references EVENT(event_id) |

## statuses

| Column        | Type         | Required | Key | Default        | Description                      | Constraints            |
| ------------- | ------------ | -------- | --- | -------------- | -------------------------------- | ---------------------- |
| status_id     | int          | yes      | PK  | auto_increment | Unique status identifier         | positive               |
| display_order | int          | yes      |     |                | Display order in the kanban flow | positive, unique       |
| name          | varchar(255) | yes      |     |                | Name of the status               | max chars 255 , unique |

## tag

| Column | Type         | Required | Key | Default        | Description           | Constraints           |
| ------ | ------------ | -------- | --- | -------------- | --------------------- | --------------------- |
| tag_id | int          | yes      | PK  | auto_increment | Unique tag identifier | positive              |
| name   | varchar(255) | yes      |     |                | Name of the tag       | max chars 255, unique |

## contract

| Column      | Type         | Required | Key | Default        | Description                | Constraints   |
| ----------- | ------------ | -------- | --- | -------------- | -------------------------- | ------------- |
| contract_id | int          | yes      | PK  | auto_increment | Unique contract identifier | positive      |
| name        | varchar(255) | yes      |     |                | Name of the contract       | max chars 255 |

## Pivot tables

> Join table for many-to-many relationship ()

## application_tag

| Column         | Type | Required | Key | Default | Description         | Constraints                            |
| -------------- | ---- | -------- | --- | ------- | ------------------- | -------------------------------------- |
| application_id | int  | yes      | FK  |         | Related application | references APPLICATION(application_id) |
| tag_id         | int  | yes      | FK  |         | Related tag         | references TAG(tag_id)                 |

## document_tag

| Column      | Type | Required | Key | Default | Description      | Constraints                      |
| ----------- | ---- | -------- | --- | ------- | ---------------- | -------------------------------- |
| document_id | int  | yes      | FK  |         | Related document | references DOCUMENT(document_id) |
| tag_id      | int  | yes      | FK  |         | Related tag      | references TAG(tag_id)           |

## email_template_tag

| Column            | Type | Required | Key | Default | Description            | Constraints                                  |
| ----------------- | ---- | -------- | --- | ------- | ---------------------- | -------------------------------------------- |
| email_template_id | int  | yes      | FK  |         | Related email template | references EMAIL_TEMPLATE(email_template_id) |
| tag_id            | int  | yes      | FK  |         | Related tag            | references TAG(tag_id)                       |

## application_document

| Column         | Type | Required | Key | Default | Description         | Constraints                            |
| -------------- | ---- | -------- | --- | ------- | ------------------- | -------------------------------------- |
| application_id | int  | yes      | FK  |         | Related application | references APPLICATION(application_id) |
| document_id    | int  | yes      | FK  |         | Related document    | references DOCUMENT(document_id)       |
