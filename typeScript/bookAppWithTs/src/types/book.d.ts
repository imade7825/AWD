export type Isbn = string;

export interface Book {
  isbn: Isbn;
  title: string;
  author: string;
  publisher: string;
  subtitle?: string;
  abstract?: string;
  pages?: number;
  cover?: string; //URL
}

export interface CreateBookPayload extends Book {}
export interface UpdateBookPayload extends Book {}

export type books = Book[];
