import 'package:flutter/material.dart';

void main() => runApp(const MyApp());

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'AREA Todo',
      theme: ThemeData(primarySwatch: Colors.indigo),
      home: const TodoPage(),
    );
  }
}

class Todo {
  final int id;
  final String title;
  bool done;

  Todo({required this.id, required this.title, this.done = false});
}

class TodoPage extends StatefulWidget {
  const TodoPage({super.key});

  @override
  State<TodoPage> createState() => _TodoPageState();
}

class _TodoPageState extends State<TodoPage> {
  final List<Todo> _todos = [];
  final TextEditingController _controller = TextEditingController();
  int _nextId = 0;

  void _addTodo() {
    final text = _controller.text.trim();
    if (text.isEmpty) return;
    setState(() {
      _todos.insert(0, Todo(id: _nextId++, title: text));
      _controller.clear();
    });
  }

  void _toggleTodo(int id) {
    setState(() {
      final t = _todos.firstWhere((e) => e.id == id);
      t.done = !t.done;
    });
  }

  void _removeTodo(int id) {
    setState(() {
      _todos.removeWhere((e) => e.id == id);
    });
  }

  void _clearCompleted() {
    setState(() {
      _todos.removeWhere((t) => t.done);
    });
  }

  void _editTodo(int id, String newTitle) {
    setState(() {
      final idx = _todos.indexWhere((e) => e.id == id);
      if (idx != -1) {
        final old = _todos[idx];
        _todos[idx] = Todo(id: old.id, title: newTitle, done: old.done);
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final total = _todos.length;
    final done = _todos.where((t) => t.done).length;

    return Scaffold(
      appBar: AppBar(
        title: const Text('AREA Todo'),
        actions: [
          PopupMenuButton<String>(
            onSelected: (v) {
              if (v == 'clear') _clearCompleted();
            },
            itemBuilder: (context) => [
              const PopupMenuItem(value: 'clear', child: Text('Clear completed')),
            ],
          )
        ],
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          children: [
            Row(
              children: [
                Expanded(
                  child: TextField(
                    key: const Key('addField'),
                    controller: _controller,
                    decoration: const InputDecoration(hintText: 'Add a todo'),
                    onSubmitted: (_) => _addTodo(),
                  ),
                ),
                const SizedBox(width: 8),
                ElevatedButton(
                  key: const Key('addButton'),
                  onPressed: _addTodo,
                  child: const Icon(Icons.add),
                ),
              ],
            ),
            const SizedBox(height: 12),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text('Total: $total', key: const Key('totalCount')),
                Text('Done: $done', key: const Key('doneCount')),
              ],
            ),
            const SizedBox(height: 12),
            Expanded(
              child: _todos.isEmpty
                  ? const Center(child: Text('No todos', key: Key('emptyText')))
                  : ListView.builder(
                      itemCount: _todos.length,
                      itemBuilder: (context, index) {
                        final todo = _todos[index];
                        return Dismissible(
                          key: ValueKey('todo-${todo.id}'),
                          direction: DismissDirection.endToStart,
                          onDismissed: (_) => _removeTodo(todo.id),
                          background: Container(
                            color: Colors.red,
                            alignment: Alignment.centerRight,
                            padding: const EdgeInsets.symmetric(horizontal: 16),
                            child: const Icon(Icons.delete, color: Colors.white),
                          ),
                          child: ListTile(
                            key: ValueKey('tile-${todo.id}'),
                            leading: Checkbox(
                              value: todo.done,
                              onChanged: (_) => _toggleTodo(todo.id),
                            ),
                            title: GestureDetector(
                              onTap: () async {
                                final updated = await showDialog<String>(
                                  context: context,
                                  builder: (ctx) {
                                    final c = TextEditingController(text: todo.title);
                                    return AlertDialog(
                                      title: const Text('Edit todo'),
                                      content: TextField(controller: c),
                                      actions: [
                                        TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancel')),
                                        TextButton(onPressed: () => Navigator.pop(ctx, c.text), child: const Text('Save')),
                                      ],
                                    );
                                  },
                                );
                                if (updated != null && updated.trim().isNotEmpty) {
                                  setState(() {
                                    // update mutable field by replacing object
                                    _todos[index] = Todo(id: todo.id, title: updated.trim(), done: todo.done);
                                  });
                                }
                              },
                              child: Text(
                                todo.title,
                                key: ValueKey('title-${todo.id}'),
                                style: TextStyle(
                                  decoration: todo.done ? TextDecoration.lineThrough : null,
                                ),
                              ),
                            ),
                            trailing: IconButton(
                              key: ValueKey('delete-${todo.id}'),
                              icon: const Icon(Icons.delete),
                              onPressed: () => _removeTodo(todo.id),
                            ),
                          ),
                        );
                      },
                    ),
            ),
          ],
        ),
      ),
    );
  }
}
