<?php

use App\Models\User;
use App\Models\Book;
use App\Models\Author;
use App\Models\Publisher;

beforeEach(function () {
    $this->user = User::factory()->create();
    $this->token = auth('api')->login($this->user);
    $this->author = Author::factory()->create();
    $this->publisher = Publisher::factory()->create();
});

test('unauthenticated user cannot access books', function () {
    // Clear any authentication state
    auth('api')->logout();
    
    // Make request without authentication header
    $response = $this->withoutHeader('Authorization')
        ->getJson('/api/books');

    $response->assertStatus(401);
});

test('authenticated user can list books', function () {
    Book::factory()->count(3)->create([
        'author_id' => $this->author->id,
        'publisher_id' => $this->publisher->id,
    ]);

    $response = $this->withHeader('Authorization', "Bearer {$this->token}")
        ->getJson('/api/books');

    $response->assertStatus(200)
        ->assertJsonStructure([
            'data' => [
                '*' => ['id', 'title', 'description', 'author_id', 'publisher_id', 'author', 'publisher'],
            ],
            'current_page',
            'total',
        ]);

    expect($response->json('data'))->toHaveCount(3);
});

test('authenticated user can filter books by title', function () {
    Book::factory()->create([
        'title' => 'Laravel Guide',
        'author_id' => $this->author->id,
        'publisher_id' => $this->publisher->id,
    ]);
    Book::factory()->create([
        'title' => 'PHP Basics',
        'author_id' => $this->author->id,
        'publisher_id' => $this->publisher->id,
    ]);

    $response = $this->withHeader('Authorization', "Bearer {$this->token}")
        ->getJson('/api/books?search=Laravel');

    $response->assertStatus(200);
    expect($response->json('data'))->toBeArray();
    expect($response->json('data.0.title'))->toContain('Laravel');
});

test('authenticated user can filter books by author_id', function () {
    $author2 = Author::factory()->create();
    Book::factory()->create([
        'author_id' => $this->author->id,
        'publisher_id' => $this->publisher->id,
    ]);
    Book::factory()->create([
        'author_id' => $author2->id,
        'publisher_id' => $this->publisher->id,
    ]);

    $response = $this->withHeader('Authorization', "Bearer {$this->token}")
        ->getJson("/api/books?author_id={$this->author->id}");

    $response->assertStatus(200);
    expect($response->json('data'))->toHaveCount(1);
    expect($response->json('data.0.author_id'))->toBe($this->author->id);
});

test('authenticated user can filter books by publisher_id', function () {
    $publisher2 = Publisher::factory()->create();
    Book::factory()->create([
        'author_id' => $this->author->id,
        'publisher_id' => $this->publisher->id,
    ]);
    Book::factory()->create([
        'author_id' => $this->author->id,
        'publisher_id' => $publisher2->id,
    ]);

    $response = $this->withHeader('Authorization', "Bearer {$this->token}")
        ->getJson("/api/books?publisher_id={$this->publisher->id}");

    $response->assertStatus(200);
    expect($response->json('data'))->toHaveCount(1);
    expect($response->json('data.0.publisher_id'))->toBe($this->publisher->id);
});

test('authenticated user can create book', function () {
    $response = $this->withHeader('Authorization', "Bearer {$this->token}")
        ->postJson('/api/books', [
            'title' => 'New Book',
            'description' => 'Book Description',
            'author_id' => $this->author->id,
            'publisher_id' => $this->publisher->id,
        ]);

    $response->assertStatus(201)
        ->assertJson([
            'title' => 'New Book',
            'description' => 'Book Description',
            'author_id' => $this->author->id,
            'publisher_id' => $this->publisher->id,
        ]);

    $this->assertDatabaseHas('books', [
        'title' => 'New Book',
        'author_id' => $this->author->id,
        'publisher_id' => $this->publisher->id,
    ]);
});

test('creating book requires title, author_id, and publisher_id', function () {
    $response = $this->withHeader('Authorization', "Bearer {$this->token}")
        ->postJson('/api/books', [
            'description' => 'Book Description',
        ]);

    $response->assertStatus(422)
        ->assertJsonValidationErrors(['title', 'author_id', 'publisher_id']);
});

test('creating book requires valid author_id', function () {
    $response = $this->withHeader('Authorization', "Bearer {$this->token}")
        ->postJson('/api/books', [
            'title' => 'New Book',
            'author_id' => 99999,
            'publisher_id' => $this->publisher->id,
        ]);

    $response->assertStatus(422)
        ->assertJsonValidationErrors(['author_id']);
});

test('authenticated user can get book by id', function () {
    $book = Book::factory()->create([
        'author_id' => $this->author->id,
        'publisher_id' => $this->publisher->id,
    ]);

    $response = $this->withHeader('Authorization', "Bearer {$this->token}")
        ->getJson("/api/books/{$book->id}");

    $response->assertStatus(200)
        ->assertJsonStructure([
            'id',
            'title',
            'description',
            'author_id',
            'publisher_id',
            'author' => ['id', 'name'],
            'publisher' => ['id', 'name'],
        ]);
});

test('authenticated user can update book', function () {
    $book = Book::factory()->create([
        'title' => 'Old Title',
        'author_id' => $this->author->id,
        'publisher_id' => $this->publisher->id,
    ]);

    $response = $this->withHeader('Authorization', "Bearer {$this->token}")
        ->putJson("/api/books/{$book->id}", [
            'title' => 'Updated Title',
            'description' => 'Updated Description',
        ]);

    $response->assertStatus(200)
        ->assertJson([
            'title' => 'Updated Title',
            'description' => 'Updated Description',
        ]);

    $this->assertDatabaseHas('books', [
        'id' => $book->id,
        'title' => 'Updated Title',
    ]);
});

test('authenticated user can delete book', function () {
    $book = Book::factory()->create([
        'author_id' => $this->author->id,
        'publisher_id' => $this->publisher->id,
    ]);

    $response = $this->withHeader('Authorization', "Bearer {$this->token}")
        ->deleteJson("/api/books/{$book->id}");

    $response->assertStatus(200)
        ->assertJson(['message' => 'Book deleted']);

    $this->assertDatabaseMissing('books', ['id' => $book->id]);
});

