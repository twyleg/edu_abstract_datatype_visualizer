/**
 * Repraesentation von objektorientierten Hamstern im Java-Hamster-Modell
 * 
 * @author Dietrich Boles (Universitaet Oldenburg)
 * @version 2.5.2 (11.04.2008)
 * 
 */
public class Hamster {

	/**
	 * Blickrichtung Nord
	 */
	public final static int NORD = 0;

	/**
	 * Blickrichtung Ost
	 */
	public final static int OST = 1;

	/**
	 * Blickrichtung Sued
	 */
	public final static int SUED = 2;

	/**
	 * Blickrichtung West
	 */
	public final static int WEST = 3;

	public final static int BLAU = 0;
	public final static int BLUE = 0;

	public final static int ROT = 1;
	public final static int RED = 1;

	public final static int GRUEN = 2;
	public final static int GREEN = 2;

	public final static int GELB = 3;
	public final static int YELLOW = 3;

	public final static int CYAN = 4;

	public final static int MAGENTA = 5;

	public final static int ORANGE = 6;

	public final static int PINK = 7;

	public final static int GRAU = 8;
	public final static int GRAY = 8;

	public final static int WEISS = 9;
	public final static int WHITE = 9;

	/**
	 * Konstruktor zum Erzeugen eines nicht initialisierten Hamsters
	 */
	public Hamster() {
	}

	/**
	 * Konstruktor zum Erzeugen und Initialisieren eines Hamsters mit den
	 * uebergebenen Parametern
	 * 
	 * @param reihe
	 *            die Reihe des Territoriums, in der der Hamster erzeugt wird
	 * @param spalte
	 *            die Spalte des Territoriums, in der der Hamster erzeugt wird
	 * @param blickrichtung
	 *            die Richtung, in der der Hamster anfangs schaut (siehe
	 *            Konstanten)
	 * @param anzahlKoerner
	 *            die Anzahl an Koernern, die der Hamster anfangs im Maul hat
	 * @throws HamsterInitialisierungsException
	 *             wird geworfen, wenn: (a) eine Kachel (reihe/spalte) nicht
	 *             existiert (b) die Kachel (reihe/spalte) durch eine Mauer
	 *             blockiert ist (c) der Wert von blickrichtung nicht zwischen 0
	 *             und 3 liegt (d) der Wert von anzahlKoerner < 0 ist
	 */
	public Hamster(int reihe, int spalte, int blickrichtung, int anzahlKoerner)
			throws HamsterInitialisierungsException {
	}

	/**
	 * Konstruktor zum Erzeugen und Initialisieren eines Hamsters mit den Werten
	 * eines bereis existierenden Hamsters
	 * 
	 * @param hamster
	 *            ein bereits existierender Hamster
	 */
	public Hamster(Hamster hamster) {
	}

	/**
	 * Konstruktor zum Erzeugen und Initialisieren eines Hamsters mit den
	 * uebergebenen Parametern; mit diesem Konstruktor kann die Farbe eines
	 * Hamsters im Hamster-Simulator explizit gesetzt werden
	 * 
	 * @param reihe
	 *            die Reihe des Territoriums, in der der Hamster erzeugt wird
	 * @param spalte
	 *            die Spalte des Territoriums, in der der Hamster erzeugt wird
	 * @param blickrichtung
	 *            die Richtung, in der der Hamster anfangs schaut (siehe
	 *            Konstanten)
	 * @param anzahlKoerner
	 *            die Anzahl an Koernern, die der Hamster anfangs im Maul hat
	 * @param farbe
	 *            die Farbe des Hamsters im Hamster-Simulator (siehe Konstanten)
	 * @throws HamsterInitialisierungsException
	 *             wird geworfen, wenn: (a) eine Kachel (reihe/spalte) nicht
	 *             existiert (b) die Kachel (reihe/spalte) durch eine Mauer
	 *             blockiert ist (c) der Wert von blickrichtung nicht zwischen 0
	 *             und 3 liegt (d) der Wert von anzahlKoerner < 0 ist
	 */
	public Hamster(int reihe, int spalte, int blickrichtung, int anzahlKoerner,
			int farbe) {

	}

	/**
	 * Methode zum Initialisieren eines noch nicht initialsierten Hamsters. Der
	 * Aufruf der Methode fuer einen bereits initialisierten Hamster bewirkt
	 * nichts.
	 * 
	 * @param reihe
	 *            die Reihe des Territoriums, in der der Hamster erzeugt wird
	 * @param spalte
	 *            die Spalte des Territoriums, in der der Hamster erzeugt wird
	 * @param blickrichtung
	 *            die Richtung, in der der Hamster anfangs schaut (siehe
	 *            Konstanten)
	 * @param anzahlKoerner
	 *            die Anzahl an Koernern, die der Hamster anfangs im Maul hat
	 * @throws HamsterInitialisierungsException
	 *             wird geworfen, wenn: (a) eine Kachel (reihe/spalte) nicht
	 *             existiert (b) die Kachel (reihe/spalte) durch eine Mauer
	 *             blockiert ist (c) der Wert von blickrichtung nicht zwischen 0
	 *             und 3 liegt (d) der Wert von anzahlKoerner < 0 ist
	 */
	public synchronized void init(int reihe, int spalte, int blickrichtung,
			int anzahlKoerner) throws HamsterInitialisierungsException {
	}

	/**
	 * Der aufgerufene Hamster springt auf die in Blickrichtung vor ihm liegende
	 * Kachel.
	 * 
	 * @throws HamsterNichtInitialisiertException
	 *             wird geworfen, wenn der Hamster noch nicht initialisiert
	 *             worden ist
	 * @throws MauerDaException
	 *             wird geworfen, wenn die Kachel in Blickrichtung vor dem
	 *             Hamster durch eine Mauer blockiert ist oder der Hamster in
	 *             Blickrichtung am Rand des Territoriums steht
	 */
	public synchronized void vor() throws HamsterNichtInitialisiertException,
			MauerDaException {
	}

	/**
	 * Der aufgerufene Hamster dreht sich linksum.
	 * 
	 * @throws HamsterNichtInitialisiertException
	 *             wird geworfen, wenn der Hamster noch nicht initialisiert
	 *             worden ist
	 */
	public synchronized void linksUm()
			throws HamsterNichtInitialisiertException {
	}

	/**
	 * Der aufgerufene Hamster legt ein Korn auf der Kachel ab, auf der er sich
	 * gerade befindet.
	 * 
	 * @throws HamsterNichtInitialisiertException
	 *             wird geworfen, wenn der Hamster noch nicht initialisiert
	 *             worden ist
	 * @throws MaulLeerException
	 *             wird geworfen, wenn der Hamster keine Koerner im Maul hat
	 */
	public synchronized void gib() throws HamsterNichtInitialisiertException,
			MaulLeerException {
	}

	/**
	 * Der aufgerufene Hamster frisst ein Korn auf der Kachel, auf der er sich
	 * gerade befindet.
	 * 
	 * @throws HamsterNichtInitialisiertException
	 *             wird geworfen, wenn der Hamster noch nicht initialisiert
	 *             worden ist
	 * @throws KachelLeerException
	 *             wird geworfen, wenn auf der Kachel, auf der sich der Hamster
	 *             gerade befindet, kein Korn liegt
	 */
	public synchronized void nimm() throws HamsterNichtInitialisiertException,
			KachelLeerException {
	}

	/**
	 * liefert genau dann true, wenn sich in Blickrichtung vor dem aufgerufenen
	 * Hamster keine Mauer befindet (wenn sich der Hamster in Blickrichtung am
	 * Rand des Territoriums befindet, wird false geliefert)
	 * 
	 * @return true, wenn sich in Blickrichtung vor dem aufgerufenen Hamster
	 *         keine Mauer befindet; sonst false
	 * @throws HamsterNichtInitialisiertException
	 *             wird geworfen, wenn der Hamster noch nicht initialisiert
	 *             worden ist
	 */
	public synchronized boolean vornFrei()
			throws HamsterNichtInitialisiertException {
		return true;
	}

	/**
	 * liefert genau dann true, wenn der aufgerufene Hamster keine Koerner im
	 * Maul hat
	 * 
	 * @return true, wenn der aufgerufene Hamster keine Koerner im Maul hat;
	 *         sonst false
	 * @throws HamsterNichtInitialisiertException
	 *             wird geworfen, wenn der Hamster noch nicht initialisiert
	 *             worden ist
	 */
	public synchronized boolean maulLeer()
			throws HamsterNichtInitialisiertException {
		return true;
	}

	/**
	 * liefert genau dann true, wenn auf der Kachel, auf der sich der
	 * aufgerufene Hamster gerade befindet, mindestens ein Korn liegt
	 * 
	 * @return true, wenn auf der Kachel, auf der sich der aufgerufene Hamster
	 *         gerade befindet, mindestens ein Korn liegt; sonst false
	 * @throws HamsterNichtInitialisiertException
	 */
	public synchronized boolean kornDa()
			throws HamsterNichtInitialisiertException {
		return true;
	}

	/**
	 * gibt den uebergebenen String (in einer Dialogbox) auf den Bildschirm aus
	 * 
	 * @param zeichenkette
	 *            der auszugebende String
	 * @throws HamsterNichtInitialisiertException
	 *             wird geworfen, wenn der Hamster noch nicht initialisiert
	 *             worden ist
	 */
	public synchronized void schreib(String zeichenkette)
			throws HamsterNichtInitialisiertException {
	}

	/**
	 * gibt den uebergebenen String auf den Bildschirm aus und fordert den
	 * Benutzer auf, einen String einzugeben; der eingegebene String wird als
	 * Wert geliefert
	 * 
	 * @param aufforderung
	 *            der auszugebende String
	 * @return der vom Benutzer eingegebene String
	 * @throws HamsterNichtInitialisiertException
	 *             wird geworfen, wenn der Hamster noch nicht initialisiert
	 *             worden ist
	 */
	public synchronized String liesZeichenkette(String aufforderung)
			throws HamsterNichtInitialisiertException {
		return null;
	}

	/**
	 * gibt den uebergebenen String auf den Bildschirm aus und fordert den
	 * Benutzer auf, eine Zahl einzugeben; die eingegebene Zahl wird als Wert
	 * geliefert (wenn der Benutzer eine ungueltige Zahl eingibt, wird der Wert
	 * 0 geliefert)
	 * 
	 * @param aufforderung
	 *            der auszugebende String
	 * @return die vom Benutzer eingegebene Zahl
	 * @throws HamsterNichtInitialisiertException
	 *             wird geworfen, wenn der Hamster noch // nicht initialisiert
	 *             worden ist
	 */
	public synchronized int liesZahl(String aufforderung)
			throws HamsterNichtInitialisiertException {
		return 0;
	}

	/**
	 * liefert die Reihe der Kachel des Territoriums, auf der sich der
	 * aufgerufene Hamster gerade befindet
	 * 
	 * @return die Reihe der Kachel des Territoriums, auf der sich der
	 *         aufgerufene Hamster gerade befindet
	 * @throws HamsterNichtInitialisiertException
	 *             wird geworfen, wenn der Hamster noch // nicht initialisiert
	 *             worden ist
	 */
	public synchronized int getReihe()
			throws HamsterNichtInitialisiertException {
		return 0;
	}

	/**
	 * liefert die Spalte der Kachel des Territoriums, auf der sich der
	 * aufgerufene Hamster gerade befindet
	 * 
	 * @return die Spalte der Kachel des Territoriums, auf der sich der
	 *         aufgerufene Hamster gerade befindet
	 * @throws HamsterNichtInitialisiertException
	 *             wird geworfen, wenn der Hamster noch nicht initialisiert
	 *             worden ist
	 */
	public synchronized int getSpalte()
			throws HamsterNichtInitialisiertException {
		return 0;
	}

	/**
	 * liefert die Blickrichtung, in die der aufgerufene Hamster gerade schaut
	 * (die gelieferten Werte entsprechen den obigen Konstanten)
	 * 
	 * @return die Blickrichtung, in die der aufgerufene Hamster gerade schaut
	 * @throws HamsterNichtInitialisiertException
	 *             wird geworfen, wenn der Hamster noch nicht initialisiert
	 *             worden ist
	 */
	public synchronized int getBlickrichtung()
			throws HamsterNichtInitialisiertException {
		return 0;
	}

	/**
	 * liefert die Anzahl der Koerner, die der aufgerufene Hamster gerade im
	 * Maul hat
	 * 
	 * @return die Anzahl der Koerner, die der aufgerufene Hamster gerade im
	 *         Maul hat
	 * @throws HamsterNichtInitialisiertException
	 *             wird geworfen, wenn der Hamster noch nicht initialisiert
	 *             worden ist
	 */
	public synchronized int getAnzahlKoerner()
			throws HamsterNichtInitialisiertException {
		return 0;
	}

	/**
	 * liefert den Standard-Hamster, das ist der Hamster, der sich
	 * standardmaessig im Territorium befindet, ohne explizit erzeugt werden zu
	 * muessen
	 * 
	 * @return der Standard-Hamster
	 */
	public synchronized static Hamster getStandardHamster() {
		return null;
	}

	/**
	 * liefert die Gesamtzahl an erzeugten und initialisierten Hamstern im
	 * Territorium (inkl. dem Standard-Hamster)
	 * 
	 * @return die Gesamtzahl an erzeugten und initialisierten Hamstern im
	 *         Territorium
	 */
	public synchronized static int getAnzahlHamster() {
		return 0;
	}

	/**
	 * Methode, die einen Klon des aufgerufenen Hamsters erzeugt und liefert,
	 * d.h. die Werte der Attribute des neuen Hamsters sind identisch zu den
	 * Werten des aufgerufenen Hamsters. Wenn der aufgerufene Hamster noch nicht
	 * initialisiert ist, wird der neu erzeugte Hamster auch nicht initialisiert
	 * (ueberschreibt die entsprechende von der Klasse Object geerbte Methode).
	 * 
	 * @return ein Klon des aufgerufenen Hamsters
	 * @see java.lang.Object#clone()
	 */
	public synchronized Object clone() {
		return null;
	}

	/**
	 * Methode, die eine String-Repraesentation der folgenden Art fuer den
	 * aufgerufenen Hamster liefert: "Hamster steht auf Kachel (0/0) mit
	 * Blickrichtung OST und 2 Koernern im Maul" Wenn der aufgerufene Hamster
	 * noch nicht initialisiert ist, wird folgender String geliefert: "Hamster
	 * ist nicht initialisiert" (ueberschreibt die entsprechende von der Klasse
	 * Object geerbte Methode)
	 * 
	 * @return eine String-Repraesentation des aktuellen Hamster-Zustands
	 * @see java.lang.Object#toString()
	 */
	public synchronized String toString() {
		return null;
	}

}
