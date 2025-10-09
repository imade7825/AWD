import type { Book, Isbn, CreateBookPayload, UpdateBookPayload } from "../types/book";
export declare const API_BASE_URL: string;
export declare function mainFetch<TResponse>(path?: string, options?: RequestInit): Promise<TResponse>;
export declare function fetchAllBooks(): Promise<Book[]>;
export declare function fetchBookByIsbn(isbn: Isbn): Promise<Book>;
export declare function createBook(payload: CreateBookPayload): Promise<Book>;
export declare function updateBookByIsbn(isbn: Isbn, fullBookObject: UpdateBookPayload): Promise<Book>;
export declare function deleteBookByIsbn(isbn: Isbn): Promise<boolean>;
//# sourceMappingURL=api.d.ts.map