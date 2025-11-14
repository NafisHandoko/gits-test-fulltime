<?php

namespace App\Http\Controllers;

use App\Models\Author;
use Illuminate\Http\Request;

class AuthorController extends Controller
{
    public function index(Request $request)
    {
        $query = Author::query();

        // Support both 'name' and 'search' parameters for backward compatibility
        $name = $request->query('name') ?? $request->query('search');
        if ($name) {
            $query->where('name', 'ilike', "%{$name}%");
        }

        $authors = $query->paginate($request->get('limit', 10));
        return response()->json($authors);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'bio' => 'nullable|string',
        ]);

        $author = Author::create($validated);
        return response()->json($author, 201);
    }

    public function show(Author $author)
    {
        return response()->json($author);
    }

    public function update(Request $request, Author $author)
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'bio' => 'nullable|string',
        ]);

        $author->update($validated);
        return response()->json($author);
    }

    public function destroy(Author $author)
    {
        $author->delete();
        return response()->json(['message' => 'Author deleted']);
    }
}
