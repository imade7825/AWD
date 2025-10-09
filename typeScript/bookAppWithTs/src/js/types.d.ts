export type Isbn = string;
export interface Book {
    isbn: string;
    title: string;
    subtitle?: string;
    abstract?: string;
    author: string;
    publisher: string;
    pages?: number;
    cover?: string;
}
export type CreateBookPayload = Book;
export type UpdateBookPayload = Book;
//# sourceMappingURL=types.d.ts.map