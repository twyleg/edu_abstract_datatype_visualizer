// Hauptprogramm für die bereitgestellte DynArray.java.
DynArray<String> werte = new DynArray<String>();
werte.append(null);
werte.append("Anna");
werte.insertAt(-1, "Ignoriert");
werte.append("Ben");
werte.getItem(1);
werte.setItem(0, null);
werte.setItem(99, "Ignoriert");
werte.delete(99);
werte.getItem(-1);
werte.delete(0);
werte.delete(0);
println(werte.getLength());
