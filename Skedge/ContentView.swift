//
//  ContentView.swift
//  Skedge
//
//  Created by Joe Malatesta on 9/26/24.
//

import SwiftUI

struct Todo: Identifiable {
    let id = UUID()
    var text: String
    var isStrikethrough: Bool
}

struct ContentView: View {
    @State private var todos: [Todo] = []
    @State private var deletedTodos: [Todo] = []  // Track deleted todos
    @State private var newTodo: String = ""
    
    var body: some View {
        VStack(alignment: .leading) {
            HStack {
                TextField("Add new todo", text: $newTodo)
                Button(action: {
                    if !newTodo.isEmpty {
                        todos.append(Todo(text: newTodo, isStrikethrough: false))
                        newTodo = ""
                    }
                }) {
                    Image(systemName: "arrow.right.circle.fill")
                        .foregroundColor(.black)
                }
            }
            .padding()
            
            ForEach(todos) { todo in
                HStack {
                    Text(todo.text)
                        .strikethrough(todo.isStrikethrough)
                        .opacity(todo.isStrikethrough ? 0.5 : 1.0)
                    Spacer()
                }
                .contentShape(Rectangle())
                .onTapGesture {
                    if let index = todos.firstIndex(where: { $0.id == todo.id }) {
                        if todos[index].isStrikethrough {
                            deletedTodos.append(todos[index])  // Store before removing
                            todos.remove(at: index)
                        } else {
                            todos[index].isStrikethrough = true
                        }
                    }
                }
                .padding(.horizontal)
            }
            Spacer()
        }
        .gesture(
            MagnificationGesture()
                .onEnded { value in
                    if value > 1.0 {  // Outward pinch
                        undoLastAction()
                    }
                }
        )
    }
    
    private func undoLastAction() {
        if let lastDeleted = deletedTodos.popLast() {
            todos.append(lastDeleted)
        } else if let lastTodo = todos.last {
            if lastTodo.isStrikethrough {
                if let index = todos.firstIndex(where: { $0.id == lastTodo.id }) {
                    todos[index].isStrikethrough = false
                }
            }
        }
    }
}

#Preview {
    ContentView()
}
