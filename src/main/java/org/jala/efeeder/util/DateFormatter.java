package org.jala.efeeder.util;

import java.sql.Timestamp;
import java.text.SimpleDateFormat;

/**
 *
 * @author amir_aranibar
 */
public class DateFormatter {

	private static SimpleDateFormat SIMPLE_FORMAT = new SimpleDateFormat("MM/dd/yyyy h:mm:ss");

	public static String format(Timestamp date) {
		return SIMPLE_FORMAT.format(date);
	}
}
