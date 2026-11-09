/** Stapelknoten nach QUA-LiS NRW, Version Generisch_02 2014-02-21. */
public class StackNode<ContentType> {
   private ContentType content = null;
   private StackNode<ContentType> nextNode = null;

   public StackNode(ContentType pContent) { content = pContent; }
   public void setNext(StackNode<ContentType> pNext) { nextNode = pNext; }
   public StackNode<ContentType> getNext() { return nextNode; }
   public ContentType getContent() { return content; }
}
