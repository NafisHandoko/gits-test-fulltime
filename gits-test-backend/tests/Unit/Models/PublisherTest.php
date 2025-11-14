<?php

use App\Models\Publisher;
use App\Models\Book;

beforeEach(function () {
    $this->publisher = Publisher::factory()->create();
});

test('publisher has fillable attributes', function () {
    $publisher = new Publisher();
    expect($publisher->getFillable())->toBe(['name', 'address']);
});

test('publisher can be created', function () {
    $publisher = Publisher::create([
        'name' => 'Test Publisher',
        'address' => 'Test Address',
    ]);

    expect($publisher->name)->toBe('Test Publisher');
    expect($publisher->address)->toBe('Test Address');
    expect($publisher->id)->toBeInt();
});

test('publisher has many books relationship', function () {
    $author = \App\Models\Author::factory()->create();
    $book1 = Book::factory()->create([
        'author_id' => $author->id,
        'publisher_id' => $this->publisher->id,
    ]);
    $book2 = Book::factory()->create([
        'author_id' => $author->id,
        'publisher_id' => $this->publisher->id,
    ]);

    expect($this->publisher->books)->toHaveCount(2);
    expect($this->publisher->books->first()->id)->toBe($book1->id);
});

test('publisher can be updated', function () {
    $this->publisher->update([
        'name' => 'Updated Publisher',
        'address' => 'Updated Address',
    ]);

    $this->publisher->refresh();

    expect($this->publisher->name)->toBe('Updated Publisher');
    expect($this->publisher->address)->toBe('Updated Address');
});

test('publisher can be deleted', function () {
    $publisherId = $this->publisher->id;
    $this->publisher->delete();

    expect(Publisher::find($publisherId))->toBeNull();
});

