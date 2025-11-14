<?php

namespace App\Http\Controllers;

use App\Models\Publisher;
use Illuminate\Http\Request;

class PublisherController extends Controller
{
    public function index(Request $request)
    {
        $query = Publisher::query();

        // Support both 'name' and 'search' parameters for backward compatibility
        $name = $request->query('name') ?? $request->query('search');
        if ($name) {
            $query->where('name', 'ilike', "%{$name}%");
        }

        $publishers = $query->paginate($request->get('limit', 10));
        return response()->json($publishers);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'address' => 'nullable|string',
        ]);

        $publisher = Publisher::create($validated);
        return response()->json($publisher, 201);
    }

    public function show(Publisher $publisher)
    {
        return response()->json($publisher);
    }

    public function update(Request $request, Publisher $publisher)
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'address' => 'nullable|string',
        ]);

        $publisher->update($validated);
        return response()->json($publisher);
    }

    public function destroy(Publisher $publisher)
    {
        $publisher->delete();
        return response()->json(['message' => 'Publisher deleted']);
    }
}