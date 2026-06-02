export interface Note {
    id: string;
    title: string;
    content: string;
    type: 'note' | 'reminder';
    notify: boolean;
    reminder_at?: number;
    repeat_days?: string;
    created_at: number;
    updated_at: number;
}

export type CreateNoteDTO = Omit<Note, 'id' | 'created_at' | 'updated_at'>;
export type UpdateNoteDTO = Partial<CreateNoteDTO>;
