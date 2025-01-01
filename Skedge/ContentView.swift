//
//  ContentView.swift
//  Skedge
//
//  Created by Joe Malatesta on 9/26/24.
//

import SwiftUI
import UIKit

struct ContentView: View {
    @State private var todos: [(text: String, isStrikethrough: Bool)] = [
        (text: "Tap once to strike through", isStrikethrough: false),
        (text: "Tap again to delete", isStrikethrough: true)
    ]
    @State private var newTodo: String = ""
    @State private var previousStates: [[(text: String, isStrikethrough: Bool)]] = []
    
    // Add this property for haptic feedback
    private let feedback = UINotificationFeedbackGenerator()
    
    var body: some View {
        VStack(alignment: .leading) {
            HStack {
                Button(action: undo) {
                    Image(systemName: "arrow.uturn.backward")
                        .foregroundColor(previousStates.isEmpty ? .gray : .primary)
                }
                .disabled(previousStates.isEmpty)
                
                TextField("Add new todo", text: $newTodo)
                Button(action: {
                    if !newTodo.isEmpty {
                        todos.append((newTodo, false))
                        newTodo = ""
                    }
                }) {
                    Image(systemName: "arrow.right")
                        .foregroundColor(.primary)
                }
            }
            .padding()
            
            ForEach(todos.indices, id: \.self) { index in
                HStack {
                    Text(todos[index].text)
                        .strikethrough(todos[index].isStrikethrough)
                        .opacity(todos[index].isStrikethrough ? 0.5 : 1.0)
                    Spacer()
                    
                }
                .contentShape(Rectangle())
                .onTapGesture {
                    previousStates.append(todos)
                    if todos[index].isStrikethrough {
                        todos.remove(at: index)
                        feedback.notificationOccurred(.success)
                    } else {
                        todos[index].isStrikethrough = true
                        feedback.notificationOccurred(.success)
                    }
                }
                .padding(.horizontal)
            }
            Spacer()
        }
    }
    
    private func undo() {
        if let previousState = previousStates.popLast() {
            print(previousState)
            todos = previousState
        }
    }
}

#Preview {
    ContentView()
}
