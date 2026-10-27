// Selbst implementierter generischer Container. Adapter: SchulArray / daten / anzahl.
class SchulArray<T> {
   private Object[] daten = new Object[2];
   private int anzahl = 0;
   void append(T wert) {
      if (anzahl == daten.length) {
         Object[] neu = new Object[daten.length * 2];
         for (int i = 0; i < anzahl; i++) neu[i] = daten[i];
         daten = neu;
      }
      daten[anzahl] = wert;
      anzahl++;
   }
   void insertAt(int index, T wert) {
      append(wert);
      for (int i = anzahl - 1; i > index; i--) daten[i] = daten[i - 1];
      daten[index] = wert;
   }
   void delete(int index) {
      for (int i = index; i < anzahl - 1; i++) daten[i] = daten[i + 1];
      anzahl--;
      daten[anzahl] = null;
   }
   void falscheGroesse() { anzahl = daten.length + 3; }
}
SchulArray<String> namen = new SchulArray<String>();
SchulArray<String> alias = namen;
SchulArray<String> leer = new SchulArray<String>();
namen.append("Anna");
namen.append(null);
namen.insertAt(1, "Ben");
namen.delete(0);
namen.falscheGroesse();
println("Fertig");
