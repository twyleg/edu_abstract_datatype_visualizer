/**::
 * Test NRW class List
 * {"libraries": ["nrw"]}
 */
List<String> list = new List<>();

assertTrue(list.isEmpty(), "List.isEmpty broken");

list.append("A");
assertFalse(list.isEmpty(), "List.isEmpty broken");

list.append("B");
list.append("C");

list.toFirst();
assertEquals("A", list.getContent(), "List.toFirst or List.getContent broken");

list.next();
assertEquals("B", list.getContent(), "List.next or List.getContent broken");

list.next();
assertEquals("C", list.getContent(), "List.next or List.getContent broken");
assertTrue(list.hasAccess(), "List.hasAccess broken");

list.next();
assertEquals(null, list.getContent(), "List.next or List.getContent broken");
assertFalse(list.hasAccess(), "List.hasAccess broken");


list.toLast();
assertEquals("C", list.getContent(), "List.toLast or List.getContent broken");
list.remove();
assertFalse(list.hasAccess(), "List.hasAccess broken");
list.toLast();
assertEquals("B", list.getContent(), "List.toLast or List.remove broken");

list.insert("D");
list.toFirst();
list.next();
assertEquals("D", list.getContent(), "List.next or List.getContent broken");

// Stand jetzt: A, D, B
assertEquals("[\"A\", \"D\", \"B\"]", list.toString(), "List.toString() broken");

List<String> list2 = new List<>();
list2.append("E");
list2.append("F");

list.concat(list2);
assertTrue(list2.isEmpty(), "List.append broken");
assertEquals("[\"A\", \"D\", \"B\", \"E\", \"F\"]", list.toString(), "List.toString() broken");


/**::
 * Test NRW class Queue
 * {"libraries": ["nrw"]}
 */

Queue<String> q = new Queue<String>();
assertTrue(q.isEmpty(), "Queue.isEmpty broken");

q.enqueue("A");
assertFalse(q.isEmpty(), "Queue.isEmpty broken");

q.enqueue("B");
q.enqueue("C");
assertEquals("A", q.front(), "Queue.front broken");
q.dequeue();
assertEquals("B", q.front(), "Queue.front broken");

assertEquals("[\"B\", \"C\"]", q.toString(), "Queue.toString broken");


/**::
 * Test NRW class Stack
 * {"libraries": ["nrw"]}
 */

Stack<String> s = new Stack<String>();
assertTrue(s.isEmpty(), "Stack.isEmpty broken");

s.push("A");
assertFalse(s.isEmpty(), "Stack.isEmpty broken");

s.push("B");
s.push("C");
assertEquals("C", s.top(), "Stack.top broken");
s.pop();
assertEquals("B", s.top(), "Stack.top broken");

assertEquals("[\"B\", \"A\"]", s.toString(), "Stack.toString broken");


