<?php

use App\Models\Book;
use App\Models\Author;
use App\Models\Publisher;

beforeEach(function () {
    $this->author = Author::factory()->create();
    $this->publisher = Publisher::factory()->create();
    $this->book = Book::factory()->create([
        'author_id' => $this->author->id,
        'publisher_id' => $this->publisher->id,
    ]);
});

test('book has fillable attributes', function () {
    $book = new Book();
    expect($book->getFillable())->toBe(['title', 'description', 'author_id', 'publisher_id']);
});

test('book can be created', function () {
    $book = Book::create([
        'title' => 'Test Book',
        'description' => 'Test Description',
        'author_id' => $this->author->id,
        'publisher_id' => $this->publisher->id,
    ]);

    expect($book->title)->toBe('Test Book');
    expect($book->description)->toBe('Test Description');
    expect($book->author_id)->toBe($this->author->id);
    expect($book->publisher_id)->toBe($this->publisher->id);
});

test('book belongs to author', function () {
    expect($this->book->author)->toBeInstanceOf(Author::class);
    expect($this->book->author->id)->toBe($this->author->id);
});

test('book belongs to publisher', function () {
    expect($this->book->publisher)->toBeInstanceOf(Publisher::class);
    expect($this->book->publisher->id)->toBe($this->publisher->id);
});

test('book can be updated', function () {
    $this->book->update([
        'title' => 'Updated Book',
        'description' => 'Updated Description',
    ]);

    $this->book->refresh();

    expect($this->book->title)->toBe('Updated Book');
    expect($this->book->description)->toBe('Updated Description');
});

test('book can be deleted', function () {
    $bookId = $this->book->id;
    $this->book->delete();

    expect(Book::find($bookId))->toBeNull();
});

