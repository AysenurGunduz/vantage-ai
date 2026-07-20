# Vantage — Veritabanı İlişki Diyagramı (ERD)

Bu diyagram implementation_plan.md §4'teki taslağın görselleştirilmiş ve kesinleştirilmiş halidir. Uygulanabilir SQL şeması için: [`../backend/src/db/schema.sql`](../backend/src/db/schema.sql)

```mermaid
erDiagram
    PROFILES ||--o{ ORGANIZATION_MEMBERS : "üyedir"
    ORGANIZATIONS ||--o{ ORGANIZATION_MEMBERS : "içerir"
    ORGANIZATIONS ||--o{ PROJECTS : "sahibidir"
    PROJECTS ||--o{ PROJECT_MEMBERS : "içerir"
    PROFILES ||--o{ PROJECT_MEMBERS : "üyedir"
    PROJECTS ||--o{ TASKS : "içerir"
    TASKS ||--o{ TASKS : "alt görev"
    PROFILES ||--o{ TASKS : "atanır"
    TASKS ||--o{ TASK_COMMENTS : "sahiptir"
    TASKS ||--o{ TASK_ACTIVITY_LOG : "sahiptir"
    PROJECTS ||--o{ AI_TASK_SUGGESTIONS : "sahiptir"
    PROFILES ||--o{ WORK_STYLE_PROFILES : "sahiptir"
    PROJECTS ||--o{ PROGRESS_SUMMARIES : "sahiptir"
    TASKS ||--o{ DELAY_RISK_SCORES : "sahiptir"

    PROFILES {
        uuid id PK
        text full_name
        text avatar_url
        text title
    }

    ORGANIZATIONS {
        uuid id PK
        text name
        text slug
        uuid owner_id FK
    }

    PROJECTS {
        uuid id PK
        uuid organization_id FK
        text name
        text status
        date start_date
        date end_date
    }

    TASKS {
        uuid id PK
        uuid project_id FK
        uuid parent_task_id FK
        uuid assignee_id FK
        text title
        task_status status
        task_priority priority
        date due_date
        integer order_index
        boolean ai_generated
    }

    AI_TASK_SUGGESTIONS {
        uuid id PK
        uuid project_id FK
        jsonb suggested_tasks
        suggestion_status status
    }

    WORK_STYLE_PROFILES {
        uuid id PK
        uuid user_id FK
        jsonb traits
        text summary
    }

    DELAY_RISK_SCORES {
        uuid id PK
        uuid task_id FK
        numeric risk_score
        risk_level risk_level
    }
```
