export interface Note {
    id: string;
    title: string;
    content: string;
    type: 'note' | 'reminder';
    reminder_at?: number;
    repeat_days?: string;
    is_pinned?: number;
    position?: number;
    created_at: number;
    updated_at: number;
}

export type CreateNoteDTO = Omit<Note, 'id' | 'created_at' | 'updated_at'>;
export type UpdateNoteDTO = Partial<CreateNoteDTO>;
