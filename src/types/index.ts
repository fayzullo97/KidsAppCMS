export interface Topic {
    id: string;
    name: string;
    description: string | null;
    age_range: string | null;
    icon_url: string | null;
    created_at: string;
}

export interface KnowledgeUnit {
    id: string;
    topic_id: string;
    name: string;
    mastery_threshold: number;
    thumbnail_url: string | null;
    created_at: string;
}

export interface Video {
    id: string;
    knowledge_unit_id: string;
    video_url: string;
    duration_seconds: number | null;
    file_size: number | null;
    created_at: string;
    upload_status: string | null;
}

export interface Question {
    id: string;
    knowledge_unit_id: string;
    question_text: string;
    question_type: string;
    correct_answer: string;
    incorrect_answers: string[] | null;
    created_at: string;
}
