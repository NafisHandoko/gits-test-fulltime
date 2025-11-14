<?php

use App\Models\User;
use App\Models\Author;

beforeEach(function () {
    $this->user = User::factory()->create();
    $this->token = auth('api')->login($this->user);
});

test('unauthenticated user cannot access authors', function () {
    // Clear any authentication state
    auth('api')->logout();
    
    // Make request without authentication header
    $response = $this->withoutHeader('Authorization')
        ->getJson('/api/authors');

    $response->assertStatus(401);
});

test('authenticated user can list authors', function () {
    Author::factory()->count(3)->create();

    $response = $this->withHeader('Authorization', "Bearer {$this->token}")
        ->getJson('/api/authors');

    $response->assertStatus(200)
        ->assertJsonStructure([
            'data' => [
                '*' => ['id', 'name', 'bio'],
            ],
            'current_page',
            'total',
        ]);

    expect($response->json('data'))->toHaveCount(3);
});

test('authenticated user can filter authors by name', function () {
    Author::factory()->create(['name' => 'John Doe']);
    Author::factory()->create(['name' => 'Jane Smith']);
    Author::factory()->create(['name' => 'Bob Johnson']);

    $response = $this->withHeader('Authorization', "Bearer {$this->token}")
        ->getJson('/api/authors?search=John');

    $response->assertStatus(200);
    // Search uses ilike, so it should find "John Doe" and "Bob Johnson" (contains "John")
    expect($response->json('data'))->toBeArray();
    expect($response->json('data.0.name'))->toContain('John');
});

test('authenticated user can create author', function () {
    $response = $this->withHeader('Authorization', "Bearer {$this->token}")
        ->postJson('/api/authors', [
            'name' => 'New Author',
            'bio' => 'Author Biography',
        ]);

    $response->assertStatus(201)
        ->assertJson([
            'name' => 'New Author',
            'bio' => 'Author Biography',
        ]);

    $this->assertDatabaseHas('authors', [
        'name' => 'New Author',
        'bio' => 'Author Biography',
    ]);
});

test('creating author requires name', function () {
    $response = $this->withHeader('Authorization', "Bearer {$this->token}")
        ->postJson('/api/authors', [
            'bio' => 'Author Biography',
        ]);

    $response->assertStatus(422)
        ->assertJsonValidationErrors(['name']);
});

test('authenticated user can get author by id', function () {
    $author = Author::factory()->create();

    $response = $this->withHeader('Authorization', "Bearer {$this->token}")
        ->getJson("/api/authors/{$author->id}");

    $response->assertStatus(200)
        ->assertJson([
            'id' => $author->id,
            'name' => $author->name,
            'bio' => $author->bio,
        ]);
});

test('authenticated user can update author', function () {
    $author = Author::factory()->create(['name' => 'Old Name']);

    $response = $this->withHeader('Authorization', "Bearer {$this->token}")
        ->putJson("/api/authors/{$author->id}", [
            'name' => 'Updated Name',
            'bio' => 'Updated Bio',
        ]);

    $response->assertStatus(200)
        ->assertJson([
            'name' => 'Updated Name',
            'bio' => 'Updated Bio',
        ]);

    $this->assertDatabaseHas('authors', [
        'id' => $author->id,
        'name' => 'Updated Name',
        'bio' => 'Updated Bio',
    ]);
});

test('authenticated user can delete author', function () {
    $author = Author::factory()->create();

    $response = $this->withHeader('Authorization', "Bearer {$this->token}")
        ->deleteJson("/api/authors/{$author->id}");

    $response->assertStatus(200)
        ->assertJson(['message' => 'Author deleted']);

    $this->assertDatabaseMissing('authors', ['id' => $author->id]);
});

