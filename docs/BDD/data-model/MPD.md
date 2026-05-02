# MPD

## dbdiagram

```dbml
Table users {
  user_id int [pk, increment]
  email varchar(255) [not null, unique]
  password_hash varchar(255) [not null]
}

Table applications {
  application_id int [pk, increment]
  job_title varchar(255) [not null]
  job_domain varchar(255)
  project_goal text
  job_description text
  score int [default: 0]
  job_url text
  location varchar(255)

  user_id int [not null, ref: > users.user_id]
  company_id int [not null, ref: > companies.company_id]
  contract_id int [not null, ref: > contracts.contract_id]
  status_id int [not null,ref: > statuses.status_id]
}

Table companies {
  company_id int [pk, increment]
  name varchar(255) [not null]
  website varchar(255)
}

Table contacts {
  contact_id int [pk, increment]
  first_name varchar(255) [not null]
  last_name varchar(255) [not null]
  email varchar(255) [not null]
  phone varchar(20)
  role varchar(255)
  notes text

  company_id int [not null, ref: > companies.company_id]
}

Table email_templates {
  email_template_id int [pk, increment]
  name varchar(255) [not null]
  subject varchar(255) [not null]
  body text [not null]

  user_id int [not null, ref: > users.user_id]
}

Table events {
  event_id int [pk, increment]
  event_type varchar(255) [not null]
  occurred_at timestamp [not null, default: `CURRENT_TIMESTAMP`]

  application_id int [not null,ref: > applications.application_id]
}

Table documents {
  document_id int [pk, increment]
  name varchar(255) [not null]
  document_type varchar(255) [not null]
  file_path text [not null]

  user_id int [not null, ref: > users.user_id]
}

Table comments {
  comment_id int [pk, increment]
  content text [not null]
  created_at timestamp [not null, default: `CURRENT_TIMESTAMP`]

  event_id int [not null, ref: > events.event_id]
}

Table statuses {
  status_id int [pk, increment]
  display_order int [not null, unique]
  name varchar(255) [not null, unique]
}

Table tags {
  tag_id int [pk, increment]
  name varchar(255) [not null, unique]
}

Table contracts {
  contract_id int [pk, increment]
  name varchar(255) [not null]
}

Table application_tag {
  application_id int [not null]
  tag_id int [not null]
  indexes {
    (application_id, tag_id) [pk]
  }
}
ref: applications.application_id < application_tag.application_id
ref: tags.tag_id < application_tag.tag_id

Table document_tag {
  document_id int [not null]
  tag_id int [not null]
  indexes {
    (document_id,tag_id) [pk]
  }
}
ref: documents.document_id < document_tag.document_id
ref: tags.tag_id < document_tag.tag_id

Table email_template_tag {
  email_template_id int [not null]
  tag_id int [not null]
  indexes {
    (email_template_id, tag_id) [pk]
  }
}
ref: email_templates.email_template_id < email_template_tag.email_template_id
ref: tags.tag_id < email_template_tag.tag_id

Table application_document {
  application_id int [not null]
  document_id int [not null]
  indexes {
    (application_id, document_id) [pk]
  }
}
ref: documents.document_id < application_document.document_id
ref: applications.application_id < application_document.application_id

```

@see [dbdiagram.io] (https://dbdiagram.io/d/applyTracker-69ef4145c6a36f9c1b90dbfb)
