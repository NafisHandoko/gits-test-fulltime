<?php

use App\Models\Author;
use App\Models\Book;

beforeEach(function () {
    $this->author = Author::factory()->create();
});

test('author has fillable attributes', function () {
    $author = new Author();
    expect($author->getFillable())->toBe(['name', 'bio']);
});

test('author can be created', function () {
    $author = Author::create([
        'name' => 'Test Author',
        'bio' => 'Test Bio',
    ]);

    expect($author->name)->toBe('Test Author');
    expect($author->bio)->toBe('Test Bio');
    expect($author->id)->toBeInt();
});

test('author has many books relationship', function () {
    $book1 = Book::factory()->create(['author_id' => $this->author->id]);
    $book2 = Book::factory()->create(['author_id' => $this->author->id]);

    expect($this->author->books)->toHaveCount(2);
    expect($this->author->books->first()->id)->toBe($book1->id);
});

test('author can be updated', function () {
    $this->author->update([
        'name' => 'Updated Author',
        'bio' => 'Updated Bio',
    ]);

    $this->author->refresh();

    expect($this->author->name)->toBe('Updated Author');
    expect($this->author->bio)->toBe('Updated Bio');
});

test('author can be deleted', function () {
    $authorId = $this->author->id;
    $this->author->delete();

    expect(Author::find($authorId))->toBeNull();
});

