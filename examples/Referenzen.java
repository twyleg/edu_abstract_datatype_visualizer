class Person {
   String name;
   Person freund;
   Person(String n) { name = n; }
}
class SchulArray<T> {
   Object[] daten = new Object[4];
   int anzahl = 0;
   void append(T wert) { daten[anzahl++] = wert; }
}
Person anna = new Person("Anna");
anna.freund = anna;
SchulArray<Person> personen = new SchulArray<Person>();
personen.append(anna);
personen.append(anna);
personen.append(null);
anna.name = "Anne";
println("Fertig");
