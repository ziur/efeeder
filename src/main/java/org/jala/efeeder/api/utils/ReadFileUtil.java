package org.jala.efeeder.api.utils;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.List;

import org.apache.commons.fileupload.FileItem;

public class ReadFileUtil {

	public static List<String> readContentFileItem(FileItem fileItem) {

		List<String> lines = new ArrayList<String>();

		BufferedReader br = null;

		try {
			String sCurrentLine;

			br = new BufferedReader(new InputStreamReader(fileItem.getInputStream(), "UTF-8"));

			while ((sCurrentLine = br.readLine()) != null) {
				lines.add(sCurrentLine);
			}

		} catch (IOException e) {
			e.printStackTrace();
		} finally {
			try {
				if (br != null)br.close();
			} catch (IOException ex) {
				ex.printStackTrace();
			}
		}

		return lines;
	}
}
