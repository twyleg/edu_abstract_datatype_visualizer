Stapel<String> stapel = new Stapel<String>();
boolean anfangsLeer = stapel.isEmpty();
println(anfangsLeer); // true
String leerPop = stapel.pop();
println(leerPop); // null
stapel.push("Anna");
stapel.push(null); // unveraendert
stapel.push("Ben");
Stapel<String> alias = stapel;
Stapel<String> leer = new Stapel<String>();
String oben = stapel.top();
println(oben); // Ben, unveraendert
String zuerst = stapel.pop();
println(zuerst); // Ben
String danach = stapel.pop();
println(danach); // Anna
println(stapel.pop()); // null
println(stapel.isEmpty()); // true
