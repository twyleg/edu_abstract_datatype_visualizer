/**
 * Generische Klasse DynArray<ContentType> laut Abiturvorgaben,
 * Informatik 2018, Niedersachsen.
 *
 * Objekte der generischen Klasse DynArray (dynamische Reihung) verwalten
 * beliebige Objekte vom Typ ContentType. Die Indizierung beginnt bei 0.
 *
 * Die Klasse Node wurde aus der Klasse "List" mit dem Autor
 * "Qualitaets- und UnterstuetzungsAgentur - Landesinstitut fuer Schule,
 * Materialien zum schulinternen Lehrplan Informatik SII" entnommen.
 *
 * @author Lae
 */

/* --------- Anfang der privaten Hilfsklasse ------------------- */
class Node<ContentType>
{
    private ContentType contentObject;
    private Node<ContentType> next;

    public Node(ContentType pContent)
    {
        contentObject = pContent;
        next = null;
    }

    public ContentType getContentObject()
    {
        return contentObject;
    }

    public void setContentObject(ContentType pContent)
    {
        contentObject = pContent;
    }

    public Node<ContentType> getNextNode()
    {
        return next;
    }

    public void setNextNode(Node<ContentType> pNext)
    {
        next = pNext;
    }
}
/* ----------- Ende der privaten Hilfsklasse ------------------- */

public class DynArray<ContentType>
{
    private int size;
    private Node<ContentType> first;
    private Node<ContentType> last;
    private Node<ContentType> current;

    public DynArray()
    {
        first = null;
        last = null;
        current = null;
        size = 0;
    }

    public boolean isEmpty()
    {
        return first == null;
    }

    public ContentType getItem(int index)
    {
        if (index >= 0 && index < size)
        {
            current = first;
            for (int i = 0; i < index; i++)
            {
                current = current.getNextNode();
            }
            return current.getContentObject();
        }
        else
        {
            return null;
        }
    }

    public int getLength()
    {
        return size;
    }

    public void append(ContentType inhalt)
    {
        if (inhalt != null)
        {
            Node<ContentType> neuerKnoten = new Node<ContentType>(inhalt);
            if (isEmpty())
            {
                first = neuerKnoten;
                last = first;
                size = 1;
            }
            else
            {
                last.setNextNode(neuerKnoten);
                last = neuerKnoten;
                size++;
            }
        }
    }

    public void insertAt(int index, ContentType inhalt)
    {
        if (inhalt != null)
        {
            if ((index == 0 && isEmpty()) || index == size)
            {
                append(inhalt);
            }
            else if (index >= 0 && index < size)
            {
                current = first;
                Node<ContentType> davor = null;
                for (int i = 0; i < index; i++)
                {
                    davor = current;
                    current = current.getNextNode();
                }
                Node<ContentType> neuerKnoten = new Node<ContentType>(inhalt);
                if (davor != null)
                {
                    davor.setNextNode(neuerKnoten);
                    neuerKnoten.setNextNode(current);
                }
                else
                {
                    neuerKnoten.setNextNode(first);
                    first = neuerKnoten;
                }
                size++;
            }
        }
    }

    public void setItem(int index, ContentType inhalt)
    {
        if (index >= 0 && index < size && inhalt != null)
        {
            current = first;
            for (int i = 0; i < index; i++)
            {
                current = current.getNextNode();
            }
            current.setContentObject(inhalt);
        }
    }

    public void delete(int index)
    {
        if (size == 1 && index == 0)
        {
            first = null;
            last = null;
            current = null;
            size = 0;
        }
        else if (index >= 0 && index < size)
        {
            current = first;
            Node<ContentType> davor = null;
            for (int i = 0; i < index; i++)
            {
                davor = current;
                current = current.getNextNode();
            }
            if (davor != null)
            {
                davor.setNextNode(current.getNextNode());
                current = current.getNextNode();
                if (index == size - 1)
                {
                    last = davor;
                }
            }
            else
            {
                first = first.getNextNode();
            }
            size--;
        }
    }
}
