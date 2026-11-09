/** Stapelknoten nach QUA-LiS NRW, Version Generisch_02 2014-02-21. */
public class StackNode<ContentType> {
   private ContentType content = null;
   private StackNode<ContentType> nextNode = null;

   public StackNode(ContentType pContent) { content = pContent; }
   public void setNext(StackNode<ContentType> pNext) { nextNode = pNext; }
   public StackNode<ContentType> getNext() { return nextNode; }
   public ContentType getContent() { return content; }
}

/**
 * Generischer Stapel (Last-In-First-Out).
 * Nach den Materialien zu den zentralen NRW-Abiturpruefungen Informatik ab 2017.
 * Qualitaets- und UnterstuetzungsAgentur - Landesinstitut fuer Schule,
 * Materialien zum schulinternen Lehrplan Informatik SII.
 * Version Generisch_02 2014-02-21.
 */
public class Stapel<ContentType> {
   /** Kurze Demonstration: Ben wird vor Anna entnommen (LIFO). */
   public static void main(String[] args) {
      Stapel<String> stapel = new Stapel<String>();
      stapel.push("Anna");
      stapel.push("Ben");
      println(stapel.top());
      println(stapel.pop());
      println(stapel.pop());
      println(stapel.isEmpty());
   }

   private StackNode<ContentType> head;

   public Stapel() { head = null; }

   public boolean isEmpty() { return head == null; }

   /** Legt einen Inhalt oben ab; null bleibt wirkungslos. */
   public void push(ContentType pContent) {
      if (pContent != null) {
         StackNode<ContentType> node = new StackNode<ContentType>(pContent);
         node.setNext(head);
         head = node;
      }
   }

   /** Entfernt und liefert den obersten Inhalt, bei leerem Stapel null. */
   public ContentType pop() {
      ContentType hilf = null;
      if (!isEmpty()) {
         hilf = head.getContent();
         head = head.getNext();
      }
      return hilf;
   }

   /** Liefert den obersten Inhalt ohne Aenderung, bei leerem Stapel null. */
   public ContentType top() {
      if (!isEmpty()) { return head.getContent(); }
      return null;
   }
}
