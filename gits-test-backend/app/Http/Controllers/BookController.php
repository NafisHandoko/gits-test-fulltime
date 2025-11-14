<?php

namespace App\Http\Controllers;

use App\Models\Book;
use Illuminate\Http\Request;

class BookController extends Controller
{
    public function index(Request $request)
    {
        $query = Book::with(['author', 'publisher']);

        // Support both 'title' and 'search' parameters for backward compatibility
        $title = $request->query('title') ?? $request->query('search');
        if ($title) {
            $query->where('title', 'ilike', "%{$title}%");
        }

        if ($authorId = $request->query('author_id')) {
            $query->where('author_id', $authorId);
        }

        if ($publisherId = $request->query('publisher_id')) {
            $query->where('publisher_id', $publisherId);
        }

        $books = $query->orderBy($request->get('sort_by', 'id'), $request->get('order', 'asc'))
                       ->paginate($request->get('limit', 10));

        return response()->json($books);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'author_id' => 'required|exists:authors,id',
            'publisher_id' => 'required|exists:publishers,id',
        ]);

        $book = Book::create($validated);
        return response()->json($book, 201);
    }

    public function show(Book $book)
    {
        $book->load(['author', 'publisher']);
        return response()->json($book);
    }

    public function update(Request $request, Book $book)
    {
        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'author_id' => 'sometimes|exists:authors,id',
            'publisher_id' => 'sometimes|exists:publishers,id',
        ]);

        $book->update($validated);
        return response()->json($book);
    }

    public function destroy(Book $book)
    {
        $book->delete();
        return response()->json(['message' => 'Book deleted']);
    }
}
