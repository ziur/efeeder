package org.jala.efeeder.util;

import java.security.MessageDigest;

public class Encrypt {

	public static String getPasswordEncrypt(String password) throws Exception {
		StringBuffer sb = new StringBuffer();

		MessageDigest messageDigest = MessageDigest.getInstance("MD5");
		messageDigest.update(password.getBytes());

		byte byteData[] = messageDigest.digest();

		for (int i = 0; i < byteData.length; i++) {
			sb.append(Integer.toString((byteData[i] & 0xff) + 0x100, 16).substring(1));
		}
		return sb.toString();
	}
}
