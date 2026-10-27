/**::
 * Ensure functional varargs array
 * { "expectedOutput": "foo, bar\n" }
 */
        
String[] returnedArray = method_array(new String[] { "foo", "bar", "baz", "qux" });
String firstArrayItem = returnedArray[0];

String[] returnedVarargs = method_varargs("foo", "bar", "baz", "qux");
String secondVarargsItem = returnedVarargs[1];


System.out.print(firstArrayItem);
System.out.print(", ");
System.out.println(secondVarargsItem);
   

/**
 * @param param The input string array
 * @return The same string array that was passed in
 */
String[] method_array(String[] param) {
  	return param;
}

/**
 * @param param A variable number of string arguments
 * @return An array containing the provided strings, used to yield "[object Object]" when indexing itemes
 */
String[] method_varargs(String... param) {
  	return param;
}